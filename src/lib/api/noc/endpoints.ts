// =============================================================================
// NOC (Notice of Compliance) API Endpoints
// =============================================================================
// Documentation: https://health-products.canada.ca/api/documentation/noc-documentation-en.html

import { fetchWithRetry, buildUrl } from '../client'
import { NOC_API } from '../constants'
import type {
  NOCMainResponse,
  NOCDrugProductResponse,
  NOCMedicinalIngredientResponse,
  NOCDosageFormResponse,
  NOCRouteResponse,
  NOCVetSpeciesResponse,
} from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Notice of Compliance Main Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch main NOC data by NOC number
 */
export async function fetchNOCMain(
  nocNumber: number
): Promise<NOCMainResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.NOTICE_OF_COMPLIANCE_MAIN, {
    id: nocNumber,
  })
  return fetchWithRetry<NOCMainResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Drug Product Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch drug products associated with an NOC
 */
export async function fetchNOCDrugProducts(
  nocNumber: number
): Promise<NOCDrugProductResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.DRUG_PRODUCT, {
    id: nocNumber,
  })
  return fetchWithRetry<NOCDrugProductResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Medicinal Ingredient Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch medicinal ingredients for an NOC
 */
export async function fetchNOCMedicinalIngredients(
  nocNumber: number
): Promise<NOCMedicinalIngredientResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.MEDICINAL_INGREDIENT, {
    id: nocNumber,
  })
  return fetchWithRetry<NOCMedicinalIngredientResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Dosage Form Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch dosage forms for an NOC
 */
export async function fetchNOCDosageForms(
  nocNumber: number
): Promise<NOCDosageFormResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.DOSAGE_FORM, {
    id: nocNumber,
  })
  return fetchWithRetry<NOCDosageFormResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Route of Administration Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch routes of administration for an NOC
 */
export async function fetchNOCRoutes(
  nocNumber: number
): Promise<NOCRouteResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.ROUTE, {
    id: nocNumber,
  })
  return fetchWithRetry<NOCRouteResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Veterinary Species Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch veterinary species for an NOC
 */
export async function fetchNOCVetSpecies(
  nocNumber: number
): Promise<NOCVetSpeciesResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.VET_SPECIES, {
    id: nocNumber,
  })
  return fetchWithRetry<NOCVetSpeciesResponse[]>(url)
}
