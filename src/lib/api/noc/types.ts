// =============================================================================
// NOC (Notice of Compliance) Types
// =============================================================================
// Re-exports types from centralized type definitions and adds search-specific types

// Re-export raw API types from centralized location
export type {
  NOCMainResponse,
  NOCDrugProductResponse,
  NOCMedicinalIngredientResponse,
  NOCDosageFormResponse,
  NOCRouteResponse,
  NOCVetSpeciesResponse,
} from '../../../types/health-canada-api'

// Alias for backwards compatibility with our endpoints
export type { NOCMedicinalIngredientResponse as NOCIngredientResponse } from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Transformed/Search Result Types
// -----------------------------------------------------------------------------

/**
 * Matched ingredient info within a search result
 */
export interface NOCMatchedIngredient {
  name: string
  strength: string
  unit: string
}

/**
 * Transformed NOC search result
 */
export interface NOCSearchResult {
  nocNumber: number
  nocDate: string
  manufacturer: string
  submissionType: string
  submissionClass: string
  therapeuticClass: string
  productType: string
  isNOCWithConditions: boolean
  isSupplement: boolean
  reasonSupplement: string | null
  reasonSubmission: string | null
  // Comparative Reference Product (for generics)
  crpProductName: string | null
  crpCompanyName: string | null
  crpCountryName: string | null
  // Matched ingredients
  matchedIngredients: NOCMatchedIngredient[]
  // Brand names and DINs
  brandNames: string[]
  dins: string[]
}

// -----------------------------------------------------------------------------
// Cache Types
// -----------------------------------------------------------------------------

import type { NOCMainResponse, NOCMedicinalIngredientResponse, NOCDrugProductResponse, NOCRouteResponse, NOCDosageFormResponse } from '../../../types/health-canada-api'

/**
 * Cached NOC data structure
 */
export interface NOCCache {
  main: Map<number, NOCMainResponse>
  ingredients: NOCMedicinalIngredientResponse[]
  drugProducts: Map<number, NOCDrugProductResponse[]>
  routes: Map<number, NOCRouteResponse[]>
  dosageForms: Map<number, NOCDosageFormResponse[]>
  timestamp: number
}
