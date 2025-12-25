// =============================================================================
// NOC (Notice of Compliance) Search
// =============================================================================
// Searches NOC database by medicinal ingredient name
// Uses the NOC cache manager for background loading and progress tracking

import type {
  NOCIngredientResponse,
  NOCSearchResult,
  NOCCache,
} from './types'
import { nocCacheManager } from './cache-manager'

// -----------------------------------------------------------------------------
// Cache (delegated to cache manager)
// -----------------------------------------------------------------------------

/**
 * Clear the NOC cache
 */
export function clearNOCCache(): void {
  nocCacheManager.clearCache()
}

/**
 * Get cache status for debugging
 */
export function getNOCCacheStatus(): { cached: boolean; age: number | null; ingredientCount: number } {
  const cache = nocCacheManager.getCache()
  return {
    cached: nocCacheManager.isReady(),
    age: cache ? Date.now() - cache.timestamp : null,
    ingredientCount: cache?.ingredients.length ?? 0,
  }
}

/**
 * Check if NOC cache is ready without blocking
 */
export function isNOCCacheReady(): boolean {
  return nocCacheManager.isReady()
}

/**
 * Ensure cache is loaded (waits if necessary)
 * Delegates to the cache manager
 */
async function ensureCache(): Promise<NOCCache> {
  return nocCacheManager.ensureCache()
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
