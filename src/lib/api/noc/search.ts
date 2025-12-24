// =============================================================================
// NOC (Notice of Compliance) Search
// =============================================================================
// Searches NOC database by medicinal ingredient name
// Fetches all data once, caches it, and filters client-side

import {
  fetchAllNOCMain,
  fetchAllMedicinalIngredients,
  fetchAllNOCDrugProducts,
  fetchAllNOCRoutes,
  fetchAllNOCDosageForms,
} from './endpoints'
import type {
  NOCMainResponse,
  NOCIngredientResponse,
  NOCDrugProductResponse,
  NOCRouteResponse,
  NOCDosageFormResponse,
  NOCSearchResult,
  NOCCache,
} from './types'
import { API_CONFIG } from '../constants'

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

let cache: NOCCache | null = null
const CACHE_TTL = API_CONFIG.CACHE.SCRAPER_STALE_TIME // 1 hour

function isCacheValid(): boolean {
  return cache !== null && Date.now() - cache.timestamp < CACHE_TTL
}

/**
 * Clear the NOC cache
 */
export function clearNOCCache(): void {
  cache = null
}

/**
 * Get cache status for debugging
 */
export function getNOCCacheStatus(): { cached: boolean; age: number | null; ingredientCount: number } {
  return {
    cached: cache !== null,
    age: cache ? Date.now() - cache.timestamp : null,
    ingredientCount: cache?.ingredients.length ?? 0,
  }
}

// -----------------------------------------------------------------------------
// Data Fetching
// -----------------------------------------------------------------------------

/**
 * Fetch all NOC data and cache it
 * This is a heavy operation (~15-30 seconds) but only runs once per session
 */
async function ensureCache(): Promise<NOCCache> {
  if (isCacheValid()) {
    return cache!
  }

  console.log('Fetching NOC data from Health Canada API...')
  const startTime = Date.now()

  // Fetch all five datasets in parallel
  const [mainData, ingredientsData, drugProductsData, routesData, dosageFormsData] = await Promise.all([
    fetchAllNOCMain(),
    fetchAllMedicinalIngredients(),
    fetchAllNOCDrugProducts(),
    fetchAllNOCRoutes(),
    fetchAllNOCDosageForms(),
  ])

  // Index main data by NOC number
  const mainMap = new Map<number, NOCMainResponse>()
  for (const item of mainData) {
    mainMap.set(item.noc_number, item)
  }

  // Index drug products by NOC number
  const drugProductsMap = new Map<number, NOCDrugProductResponse[]>()
  for (const item of drugProductsData) {
    if (!drugProductsMap.has(item.noc_number)) {
      drugProductsMap.set(item.noc_number, [])
    }
    drugProductsMap.get(item.noc_number)!.push(item)
  }

  // Index routes by NOC number
  const routesMap = new Map<number, NOCRouteResponse[]>()
  for (const item of routesData) {
    if (!routesMap.has(item.noc_number)) {
      routesMap.set(item.noc_number, [])
    }
    routesMap.get(item.noc_number)!.push(item)
  }

  // Index dosage forms by NOC number
  const dosageFormsMap = new Map<number, NOCDosageFormResponse[]>()
  for (const item of dosageFormsData) {
    if (!dosageFormsMap.has(item.noc_number)) {
      dosageFormsMap.set(item.noc_number, [])
    }
    dosageFormsMap.get(item.noc_number)!.push(item)
  }

  const elapsed = Date.now() - startTime
  console.log(`Fetched ${mainData.length} NOC entries, ${ingredientsData.length} ingredients, ${drugProductsData.length} drug products, ${routesData.length} routes, ${dosageFormsData.length} dosage forms in ${elapsed}ms`)

  cache = {
    main: mainMap,
    ingredients: ingredientsData,
    drugProducts: drugProductsMap,
    routes: routesMap,
    dosageForms: dosageFormsMap,
    timestamp: Date.now(),
  }

  return cache
}

// -----------------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------------

/**
 * Extract base ingredient names from DPD format
 * DPD uses format like "CEFTRIAXONE (CEFTRIAXONE SODIUM)"
 * We need to search for both the base name and the salt form
 */
function extractSearchTerms(ingredientName: string): string[] {
  const terms: string[] = []
  const upper = ingredientName.toUpperCase().trim()

  // Extract the part before parentheses (base name)
  const baseMatch = upper.match(/^([^(]+)/)
  if (baseMatch) {
    terms.push(baseMatch[1].trim())
  }

  // Extract the part inside parentheses (salt form)
  const saltMatch = upper.match(/\(([^)]+)\)/)
  if (saltMatch) {
    terms.push(saltMatch[1].trim())
  }

  // If no parentheses, use the whole string
  if (terms.length === 0) {
    terms.push(upper)
  }

  return [...new Set(terms)] // Remove duplicates
}

/**
 * Search NOC entries by medicinal ingredient name
 * Uses partial matching (contains) to find related ingredients
 * Handles DPD format like "CEFTRIAXONE (CEFTRIAXONE SODIUM)"
 */
export async function searchNOCByIngredient(
  ingredientName: string,
  limit: number = 100
): Promise<NOCSearchResult[]> {
  const searchTerms = extractSearchTerms(ingredientName)
  if (searchTerms.length === 0 || searchTerms[0].length < 3) {
    return []
  }

  // Ensure cache is populated
  const data = await ensureCache()

  // Find all ingredients matching any of the search terms
  const matchingIngredients = data.ingredients.filter(ing => {
    const nocIngredient = ing.noc_pi_medic_ingr_name.toUpperCase()
    return searchTerms.some(term => nocIngredient.includes(term))
  })

  // Group by NOC number
  const nocIngredientMap = new Map<number, NOCIngredientResponse[]>()
  for (const ing of matchingIngredients) {
    if (!nocIngredientMap.has(ing.noc_number)) {
      nocIngredientMap.set(ing.noc_number, [])
    }
    nocIngredientMap.get(ing.noc_number)!.push(ing)
  }

  // Build results with main NOC data
  const results: NOCSearchResult[] = []

  for (const [nocNumber, ingredients] of nocIngredientMap) {
    const main = data.main.get(nocNumber)
    if (!main) continue

    // Get drug products for this NOC
    const drugProducts = data.drugProducts.get(nocNumber) || []
    const brandNames = [...new Set(drugProducts.map(dp => dp.noc_br_brandname).filter(Boolean))]
    const dins = [...new Set(drugProducts.map(dp => dp.noc_br_din).filter(Boolean))]

    results.push({
      nocNumber: main.noc_number,
      nocDate: main.noc_date,
      manufacturer: main.noc_manufacturer_name,
      submissionType: main.noc_on_submission_type,
      submissionClass: main.noc_submission_class,
      therapeuticClass: main.noc_therapeutic_class,
      productType: main.noc_product_type,
      isNOCWithConditions: main.noc_status_with_conditions === 'Y',
      isSupplement: main.noc_is_suppliment === 'Y', // Note: API typo
      reasonSupplement: main.noc_reason_supplement || null,
      reasonSubmission: main.noc_reason_submission || null,
      crpProductName: main.noc_crp_product_name || null,
      crpCompanyName: main.noc_crp_company_name || null,
      crpCountryName: main.noc_crp_country_name || null,
      matchedIngredients: ingredients.map(ing => ({
        name: ing.noc_pi_medic_ingr_name,
        strength: ing.noc_pi_strength,
        unit: ing.noc_pi_unit,
      })),
      brandNames,
      dins,
    })
  }

  // Sort by NOC date (newest first) and limit results
  results.sort((a, b) => new Date(b.nocDate).getTime() - new Date(a.nocDate).getTime())

  return results.slice(0, limit)
}

/**
 * Search NOC entries by medicinal ingredient name with optional route/form filters
 * Uses partial matching (contains) to find related ingredients
 * Filters by route and/or dosage form if provided
 */
export async function searchNOCByIngredientWithFilters(
  ingredientName: string,
  routeFilter: string[] | null,
  formFilter: string[] | null,
  limit: number = 100
): Promise<NOCSearchResult[]> {
  // Get base results (fetch more to allow for filtering)
  const baseResults = await searchNOCByIngredient(ingredientName, limit * 2)

  // If no filters, return base results with limit
  if (!routeFilter?.length && !formFilter?.length) {
    return baseResults.slice(0, limit)
  }

  // Ensure cache is populated for route/form data
  const data = await ensureCache()

  // Apply filters
  const filtered = baseResults.filter(result => {
    // Check route filter
    if (routeFilter?.length) {
      const nocRoutes = data.routes.get(result.nocNumber) || []
      const routeNames = nocRoutes.map(r => r.noc_pr_route.toUpperCase())
      const hasMatchingRoute = routeFilter.some(rf =>
        routeNames.some(rn => rn.includes(rf.toUpperCase()))
      )
      if (!hasMatchingRoute) return false
    }

    // Check form filter
    if (formFilter?.length) {
      const nocForms = data.dosageForms.get(result.nocNumber) || []
      const formNames = nocForms.map(f => f.noc_pf_form_name.toUpperCase())
      const hasMatchingForm = formFilter.some(ff =>
        formNames.some(fn => fn.includes(ff.toUpperCase()))
      )
      if (!hasMatchingForm) return false
    }

    return true
  })

  return filtered.slice(0, limit)
}
