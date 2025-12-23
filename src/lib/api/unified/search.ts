// =============================================================================
// Unified Search Function
// =============================================================================
// Provides a unified search interface across all Health Canada data sources

import type { UnifiedDrugProduct } from '../dpd/transformers'
import type { GSUREntry, SUREntry, DPDDrugProductResponse } from '../../../types/health-canada-api'
import * as dpdEndpoints from '../dpd/endpoints'
import { transformCompleteDPDProduct } from '../dpd/transformers'
import { fetchCompleteDPDProduct, type DataSource } from './product-aggregator'
import { fetchGSURData, fetchSURData } from '../scraper'
import { API_CONFIG } from '../constants'
import { fetchParallel } from '../client'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type SearchType = 'brand' | 'ingredient' | 'auto'

// Default limits for different contexts
export const SEARCH_LIMITS = {
  DEFAULT: 50,        // Default for general searches
  WATCHLIST: 500,     // High limit for watchlists (effectively unlimited for most cases)
  AUTOCOMPLETE: 10,   // Quick search/autocomplete
} as const

export interface UnifiedSearchFilters {
  // Text search
  query: string

  // Search type: 'brand' searches brand names, 'ingredient' searches active ingredients, 'auto' tries both
  searchType?: SearchType

  // Data sources to search
  sources?: DataSource[]

  // DPD-specific filters
  statusCodes?: number[]
  routeNames?: string[]
  formNames?: string[]
  companyNames?: string[]
  atcPrefix?: string

  // Pagination - use SEARCH_LIMITS constants
  limit?: number
  offset?: number
}

export interface UnifiedSearchResults {
  // DPD products (main results)
  products: UnifiedDrugProduct[]

  // Submissions under review (GSUR/SUR)
  gsurMatches: GSUREntry[]
  surMatches: SUREntry[]

  // Metadata
  totalProducts: number
  totalGSUR: number
  totalSUR: number
  sources: DataSource[]
  query: string
}

// -----------------------------------------------------------------------------
// Search Implementation
// -----------------------------------------------------------------------------

/**
 * Unified search across all Health Canada data sources
 */
export async function unifiedSearch(
  filters: UnifiedSearchFilters
): Promise<UnifiedSearchResults> {
  const {
    query,
    searchType = 'auto',
    sources = ['DPD', 'GSUR', 'SUR'],
    statusCodes = [],
    routeNames = [],
    formNames = [],
    companyNames = [],
    limit = SEARCH_LIMITS.DEFAULT,
  } = filters

  // Validate query length
  if (query.length < API_CONFIG.MIN_SEARCH_LENGTH) {
    return {
      products: [],
      gsurMatches: [],
      surMatches: [],
      totalProducts: 0,
      totalGSUR: 0,
      totalSUR: 0,
      sources: [],
      query,
    }
  }

  const results: UnifiedSearchResults = {
    products: [],
    gsurMatches: [],
    surMatches: [],
    totalProducts: 0,
    totalGSUR: 0,
    totalSUR: 0,
    sources: [],
    query,
  }

  // Build parallel search promises
  const searchPromises: Promise<void>[] = []

  // Search DPD
  if (sources.includes('DPD')) {
    searchPromises.push(
      searchDPD(query, { searchType, statusCodes, routeNames, formNames, companyNames, limit })
        .then(products => {
          results.products = products
          results.totalProducts = products.length
          results.sources.push('DPD')
        })
        .catch(error => {
          console.error('DPD search error:', error)
        })
    )
  }

  // Search GSUR
  if (sources.includes('GSUR')) {
    searchPromises.push(
      searchGSUR(query)
        .then(entries => {
          results.gsurMatches = entries
          results.totalGSUR = entries.length
          results.sources.push('GSUR')
        })
        .catch(error => {
          console.error('GSUR search error:', error)
        })
    )
  }

  // Search SUR
  if (sources.includes('SUR')) {
    searchPromises.push(
      searchSUR(query)
        .then(entries => {
          results.surMatches = entries
          results.totalSUR = entries.length
          results.sources.push('SUR')
        })
        .catch(error => {
          console.error('SUR search error:', error)
        })
    )
  }

  // Wait for all searches to complete
  await Promise.all(searchPromises)

  return results
}

// -----------------------------------------------------------------------------
// DPD Search
// -----------------------------------------------------------------------------

interface DPDSearchOptions {
  searchType?: SearchType
  statusCodes?: number[]
  routeNames?: string[]
  formNames?: string[]
  companyNames?: string[]
  limit?: number
}

/**
 * Search DPD by brand name or ingredient based on searchType
 */
async function searchDPD(
  query: string,
  options: DPDSearchOptions = {}
): Promise<UnifiedDrugProduct[]> {
  const { searchType = 'auto', limit = SEARCH_LIMITS.DEFAULT } = options

  let products: DPDDrugProductResponse[] = []

  // Search based on searchType
  if (searchType === 'ingredient') {
    // Search directly by ingredient - don't try brand name first
    const ingredients = await dpdEndpoints.searchActiveIngredientsByName(query)
    const drugCodes = [...new Set(ingredients.map(i => i.drug_code))]

    // Fetch basic product info for each drug code (with concurrency limiting)
    const productRequests = drugCodes.slice(0, limit).map(code =>
      () => dpdEndpoints.fetchDrugProductByDrugCode(code)
    )
    const productResults = await fetchParallel(productRequests, API_CONFIG.MAX_CONCURRENT_REQUESTS)
    products = productResults.filter((p): p is DPDDrugProductResponse => p !== null)
  } else if (searchType === 'brand') {
    // Search directly by brand name
    products = await dpdEndpoints.searchDrugProductsByBrandName(query)
  } else {
    // 'auto' mode: try brand name first, fall back to ingredient
    products = await dpdEndpoints.searchDrugProductsByBrandName(query)

    // If no results, try searching by ingredient
    if (products.length === 0) {
      const ingredients = await dpdEndpoints.searchActiveIngredientsByName(query)
      const drugCodes = [...new Set(ingredients.map(i => i.drug_code))]

      const productRequests = drugCodes.slice(0, limit).map(code =>
        () => dpdEndpoints.fetchDrugProductByDrugCode(code)
      )
      const productResults = await fetchParallel(productRequests, API_CONFIG.MAX_CONCURRENT_REQUESTS)
      products = productResults.filter((p): p is DPDDrugProductResponse => p !== null)
    }
  }

  // Limit results
  const limitedProducts = products.slice(0, limit)

  // Fetch complete data for each product (with concurrency limiting)
  const completeProductRequests = limitedProducts.map(p => async () => {
    try {
      const complete = await fetchCompleteDPDProduct(p.drug_code)
      return transformCompleteDPDProduct(complete)
    } catch (error) {
      console.error(`Failed to fetch complete data for drug_code ${p.drug_code}:`, error)
      return null
    }
  })
  const completeProducts = await fetchParallel(completeProductRequests, API_CONFIG.MAX_CONCURRENT_REQUESTS)

  // Filter out failed fetches and apply filters
  let results = completeProducts.filter((p): p is UnifiedDrugProduct => p !== null)

  // Apply status filter
  if (options.statusCodes && options.statusCodes.length > 0) {
    results = results.filter(p => options.statusCodes!.includes(p.statusCode))
  }

  // Apply route filter
  if (options.routeNames && options.routeNames.length > 0) {
    const lowerRoutes = options.routeNames.map(r => r.toLowerCase())
    results = results.filter(p =>
      p.routes.some(r => lowerRoutes.includes(r.name.toLowerCase()))
    )
  }

  // Apply form filter
  if (options.formNames && options.formNames.length > 0) {
    const lowerForms = options.formNames.map(f => f.toLowerCase())
    results = results.filter(p =>
      p.forms.some(f => lowerForms.includes(f.name.toLowerCase()))
    )
  }

  // Apply company filter
  if (options.companyNames && options.companyNames.length > 0) {
    const lowerCompanies = options.companyNames.map(c => c.toLowerCase())
    results = results.filter(p =>
      lowerCompanies.some(c => p.companyName.toLowerCase().includes(c))
    )
  }

  return results
}

// -----------------------------------------------------------------------------
// GSUR Search
// -----------------------------------------------------------------------------

/**
 * Search GSUR entries
 */
async function searchGSUR(query: string): Promise<GSUREntry[]> {
  const allEntries = await fetchGSURData()
  const lowerQuery = query.toLowerCase()

  return allEntries.filter(entry =>
    entry.medicinal_ingredients.toLowerCase().includes(lowerQuery) ||
    entry.company_name.toLowerCase().includes(lowerQuery) ||
    entry.therapeutic_area.toLowerCase().includes(lowerQuery)
  )
}

// -----------------------------------------------------------------------------
// SUR Search
// -----------------------------------------------------------------------------

/**
 * Search SUR entries
 */
async function searchSUR(query: string): Promise<SUREntry[]> {
  const allEntries = await fetchSURData()
  const lowerQuery = query.toLowerCase()

  return allEntries.filter(entry =>
    entry.medicinal_ingredients.toLowerCase().includes(lowerQuery) ||
    entry.company_sponsor_name.toLowerCase().includes(lowerQuery) ||
    entry.therapeutic_area.toLowerCase().includes(lowerQuery)
  )
}

// -----------------------------------------------------------------------------
// Quick Search (Brand Name Only)
// -----------------------------------------------------------------------------

/**
 * Quick search for autocomplete (returns basic product info only)
 */
export async function quickSearch(
  query: string,
  limit: number = 10
): Promise<Array<{ drugCode: number; din: string; brandName: string; companyName: string }>> {
  if (query.length < API_CONFIG.MIN_SEARCH_LENGTH) {
    return []
  }

  const products = await dpdEndpoints.searchDrugProductsByBrandName(query)

  return products.slice(0, limit).map(p => ({
    drugCode: p.drug_code,
    din: p.drug_identification_number,
    brandName: p.brand_name,
    companyName: p.company_name,
  }))
}
