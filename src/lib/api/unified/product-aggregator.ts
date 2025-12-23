// =============================================================================
// Unified Product Aggregator
// =============================================================================
// Combines data from multiple Health Canada sources (DPD, NOC, GSUR, SUR)
// into a unified product view.

import type { CompleteDPDProduct, GSUREntry, SUREntry } from '../../../types/health-canada-api'
import { transformCompleteDPDProduct, type UnifiedDrugProduct } from '../dpd/transformers'
import * as dpdEndpoints from '../dpd/endpoints'
import { fetchParallel } from '../client'
import { API_CONFIG } from '../constants'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type DataSource = 'DPD' | 'NOC' | 'GSUR' | 'SUR'

export interface UnifiedSearchResult {
  products: UnifiedDrugProduct[]
  gsurEntries: GSUREntry[]
  surEntries: SUREntry[]
  totalCount: number
  sources: DataSource[]
}

export interface SearchParams {
  query: string
  sources?: DataSource[]
  statusCodes?: number[]
  limit?: number
}

// -----------------------------------------------------------------------------
// DPD Product Aggregation
// -----------------------------------------------------------------------------

/**
 * Fetch complete product data from DPD (aggregates multiple API calls)
 */
export async function fetchCompleteDPDProduct(drugCode: number): Promise<CompleteDPDProduct> {
  const [product, activeIngredients, routes, forms, status, therapeuticClass, schedules] =
    await Promise.all([
      dpdEndpoints.fetchDrugProductByDrugCode(drugCode),
      dpdEndpoints.fetchActiveIngredients(drugCode),
      dpdEndpoints.fetchRoutes(drugCode),
      dpdEndpoints.fetchForms(drugCode),
      dpdEndpoints.fetchStatus(drugCode),
      dpdEndpoints.fetchTherapeuticClass(drugCode),
      dpdEndpoints.fetchSchedule(drugCode),
    ])

  return {
    product,  // Now a single object (API returns object, not array when queried by id)
    activeIngredients,
    routes,
    forms,
    status,  // Now a single object
    therapeuticClass,
    schedules,
  }
}

/**
 * Fetch complete product by DIN
 */
export async function fetchCompleteDPDProductByDIN(
  din: string
): Promise<CompleteDPDProduct | null> {
  const products = await dpdEndpoints.fetchDrugProductByDIN(din)
  if (products.length === 0) return null

  return fetchCompleteDPDProduct(products[0].drug_code)
}

/**
 * Fetch complete data for multiple products with concurrency limit
 */
export async function fetchCompleteDPDProducts(
  drugCodes: number[]
): Promise<UnifiedDrugProduct[]> {
  const requests = drugCodes.map(drugCode => async () => {
    const data = await fetchCompleteDPDProduct(drugCode)
    return transformCompleteDPDProduct(data)
  })

  const results = await fetchParallel(requests, API_CONFIG.MAX_CONCURRENT_REQUESTS)
  return results.filter((product): product is UnifiedDrugProduct => product !== null)
}

// -----------------------------------------------------------------------------
// Search Utilities
// -----------------------------------------------------------------------------

/**
 * Search DPD by brand name and get basic product list
 */
export async function searchDPDByBrandName(
  brandName: string,
  limit: number = 50
): Promise<UnifiedDrugProduct[]> {
  const products = await dpdEndpoints.searchDrugProductsByBrandName(brandName)

  // Limit results to avoid too many API calls
  const limitedProducts = products.slice(0, limit)

  // Fetch complete data for each product
  const drugCodes = limitedProducts.map(p => p.drug_code)
  return fetchCompleteDPDProducts(drugCodes)
}

/**
 * Search DPD by active ingredient name
 */
export async function searchDPDByIngredient(
  ingredientName: string,
  limit: number = 50
): Promise<UnifiedDrugProduct[]> {
  const ingredients = await dpdEndpoints.searchActiveIngredientsByName(ingredientName)

  // Get unique drug codes
  const drugCodes = [...new Set(ingredients.map(i => i.drug_code))].slice(0, limit)

  // Fetch complete data for each product
  return fetchCompleteDPDProducts(drugCodes)
}

/**
 * Search DPD by DIN
 */
export async function searchDPDByDIN(din: string): Promise<UnifiedDrugProduct | null> {
  const data = await fetchCompleteDPDProductByDIN(din)
  if (!data) return null

  return transformCompleteDPDProduct(data)
}

// -----------------------------------------------------------------------------
// Filtering Utilities
// -----------------------------------------------------------------------------

/**
 * Filter products by status codes
 */
export function filterByStatus(
  products: UnifiedDrugProduct[],
  statusCodes: number[]
): UnifiedDrugProduct[] {
  if (statusCodes.length === 0) return products
  return products.filter(p => statusCodes.includes(p.statusCode))
}

/**
 * Filter products by route of administration
 */
export function filterByRoute(
  products: UnifiedDrugProduct[],
  routeNames: string[]
): UnifiedDrugProduct[] {
  if (routeNames.length === 0) return products
  const lowerRoutes = routeNames.map(r => r.toLowerCase())
  return products.filter(p =>
    p.routes.some(r => lowerRoutes.includes(r.name.toLowerCase()))
  )
}

/**
 * Filter products by pharmaceutical form
 */
export function filterByForm(
  products: UnifiedDrugProduct[],
  formNames: string[]
): UnifiedDrugProduct[] {
  if (formNames.length === 0) return products
  const lowerForms = formNames.map(f => f.toLowerCase())
  return products.filter(p =>
    p.forms.some(f => lowerForms.includes(f.name.toLowerCase()))
  )
}

/**
 * Filter products by company name
 */
export function filterByCompany(
  products: UnifiedDrugProduct[],
  companyNames: string[]
): UnifiedDrugProduct[] {
  if (companyNames.length === 0) return products
  const lowerCompanies = companyNames.map(c => c.toLowerCase())
  return products.filter(p =>
    lowerCompanies.some(c => p.companyName.toLowerCase().includes(c))
  )
}

/**
 * Filter products by ATC code prefix
 */
export function filterByATCCode(
  products: UnifiedDrugProduct[],
  atcPrefix: string
): UnifiedDrugProduct[] {
  if (!atcPrefix) return products
  const upperPrefix = atcPrefix.toUpperCase()
  return products.filter(p =>
    p.atcCode && p.atcCode.toUpperCase().startsWith(upperPrefix)
  )
}

// -----------------------------------------------------------------------------
// Sorting Utilities
// -----------------------------------------------------------------------------

export type SortField = 'brandName' | 'companyName' | 'statusDate' | 'lastUpdated' | 'din'
export type SortOrder = 'asc' | 'desc'

/**
 * Sort products by field
 */
export function sortProducts(
  products: UnifiedDrugProduct[],
  field: SortField,
  order: SortOrder = 'asc'
): UnifiedDrugProduct[] {
  const sorted = [...products].sort((a, b) => {
    let aVal: string | null
    let bVal: string | null

    switch (field) {
      case 'brandName':
        aVal = a.brandName
        bVal = b.brandName
        break
      case 'companyName':
        aVal = a.companyName
        bVal = b.companyName
        break
      case 'statusDate':
        aVal = a.statusDate
        bVal = b.statusDate
        break
      case 'lastUpdated':
        aVal = a.lastUpdated
        bVal = b.lastUpdated
        break
      case 'din':
        aVal = a.din
        bVal = b.din
        break
      default:
        return 0
    }

    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1

    const comparison = aVal.localeCompare(bVal)
    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}

// -----------------------------------------------------------------------------
// Related Products
// -----------------------------------------------------------------------------

/**
 * Find products with the same active ingredient
 */
export function findRelatedByIngredient(
  product: UnifiedDrugProduct,
  allProducts: UnifiedDrugProduct[]
): UnifiedDrugProduct[] {
  const primaryIngredient = product.activeIngredients[0]?.name.toLowerCase()
  if (!primaryIngredient) return []

  return allProducts.filter(p =>
    p.drugCode !== product.drugCode &&
    p.activeIngredients.some(ai => ai.name.toLowerCase() === primaryIngredient)
  )
}

/**
 * Find products from the same manufacturer
 */
export function findRelatedByManufacturer(
  product: UnifiedDrugProduct,
  allProducts: UnifiedDrugProduct[]
): UnifiedDrugProduct[] {
  return allProducts.filter(p =>
    p.drugCode !== product.drugCode &&
    p.companyCode === product.companyCode
  )
}
