// =============================================================================
// DPD (Drug Product Database) API Endpoints
// =============================================================================
// Documentation: https://health-products.canada.ca/api/documentation/dpd-documentation-en.html

import { fetchWithRetry, buildUrl } from '../client'
import { DPD_API } from '../constants'
import type {
  DPDDrugProductResponse,
  DPDActiveIngredientResponse,
  DPDRouteResponse,
  DPDFormResponse,
  DPDStatusResponse,
  DPDTherapeuticClassResponse,
  DPDScheduleResponse,
  DPDCompanyResponse,
  DPDPackagingResponse,
  DPDPharmaceuticalStdResponse,
} from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Drug Product Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch drug product by drug code
 * Note: API returns a single object when queried with id
 */
export async function fetchDrugProductByDrugCode(
  drugCode: number
): Promise<DPDDrugProductResponse> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.DRUG_PRODUCT, {
    id: drugCode,
  })
  return fetchWithRetry<DPDDrugProductResponse>(url)
}

/**
 * Fetch drug product by DIN (Drug Identification Number)
 */
export async function fetchDrugProductByDIN(
  din: string
): Promise<DPDDrugProductResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.DRUG_PRODUCT, {
    din,
  })
  return fetchWithRetry<DPDDrugProductResponse[]>(url)
}

/**
 * Search drug products by brand name (partial match)
 */
export async function searchDrugProductsByBrandName(
  brandName: string
): Promise<DPDDrugProductResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.DRUG_PRODUCT, {
    brandname: brandName,
  })
  return fetchWithRetry<DPDDrugProductResponse[]>(url)
}

/**
 * Fetch drug products by status code
 */
export async function fetchDrugProductsByStatus(
  status: number
): Promise<DPDDrugProductResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.DRUG_PRODUCT, {
    status,
  })
  return fetchWithRetry<DPDDrugProductResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Active Ingredient Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch active ingredients for a drug code
 */
export async function fetchActiveIngredients(
  drugCode: number
): Promise<DPDActiveIngredientResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.ACTIVE_INGREDIENT, {
    id: drugCode,
  })
  return fetchWithRetry<DPDActiveIngredientResponse[]>(url)
}

/**
 * Search active ingredients by name (partial match)
 */
export async function searchActiveIngredientsByName(
  ingredientName: string
): Promise<DPDActiveIngredientResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.ACTIVE_INGREDIENT, {
    ingredientname: ingredientName,
  })
  return fetchWithRetry<DPDActiveIngredientResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Route of Administration Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch routes of administration for a drug code
 */
export async function fetchRoutes(
  drugCode: number,
  activeOnly: boolean = false
): Promise<DPDRouteResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.ROUTE, {
    id: drugCode,
    active: activeOnly ? 'yes' : undefined,
  })
  return fetchWithRetry<DPDRouteResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Pharmaceutical Form Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch pharmaceutical forms for a drug code
 */
export async function fetchForms(
  drugCode: number,
  activeOnly: boolean = false
): Promise<DPDFormResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.FORM, {
    id: drugCode,
    active: activeOnly ? 'yes' : undefined,
  })
  return fetchWithRetry<DPDFormResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Status Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch status for a drug code
 * Note: API returns a single object when queried with id
 */
export async function fetchStatus(
  drugCode: number
): Promise<DPDStatusResponse> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.STATUS, {
    id: drugCode,
  })
  return fetchWithRetry<DPDStatusResponse>(url)
}

// -----------------------------------------------------------------------------
// Therapeutic Class Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch therapeutic class (ATC/AHFS) for a drug code
 */
export async function fetchTherapeuticClass(
  drugCode: number
): Promise<DPDTherapeuticClassResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.THERAPEUTIC_CLASS, {
    id: drugCode,
  })
  return fetchWithRetry<DPDTherapeuticClassResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Schedule Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch schedules for a drug code
 */
export async function fetchSchedule(
  drugCode: number,
  activeOnly: boolean = false
): Promise<DPDScheduleResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.SCHEDULE, {
    id: drugCode,
    active: activeOnly ? 'yes' : undefined,
  })
  return fetchWithRetry<DPDScheduleResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Company Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch company details by company code
 */
export async function fetchCompany(
  companyCode: number
): Promise<DPDCompanyResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.COMPANY, {
    id: companyCode,
  })
  return fetchWithRetry<DPDCompanyResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Packaging Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch packaging information for a drug code
 */
export async function fetchPackaging(
  drugCode: number
): Promise<DPDPackagingResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.PACKAGING, {
    id: drugCode,
  })
  return fetchWithRetry<DPDPackagingResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Pharmaceutical Standard Endpoint
// -----------------------------------------------------------------------------

/**
 * Fetch pharmaceutical standard for a drug code
 */
export async function fetchPharmaceuticalStd(
  drugCode: number
): Promise<DPDPharmaceuticalStdResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.PHARMACEUTICAL_STD, {
    id: drugCode,
  })
  return fetchWithRetry<DPDPharmaceuticalStdResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Reference Data Endpoints (Fetch ALL)
// -----------------------------------------------------------------------------
// When called without an ID, these endpoints return ALL records in the database.
// Use for autocomplete dropdowns - fetch once and cache for extended periods.

/**
 * Fetch ALL routes of administration (~101 unique routes)
 * Returns all routes in the database for autocomplete/filtering
 */
export async function fetchAllRoutes(): Promise<DPDRouteResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.ROUTE)
  return fetchWithRetry<DPDRouteResponse[]>(url)
}

/**
 * Fetch ALL pharmaceutical forms (~130 unique forms)
 * Returns all forms in the database for autocomplete/filtering
 */
export async function fetchAllForms(): Promise<DPDFormResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.FORM)
  return fetchWithRetry<DPDFormResponse[]>(url)
}

/**
 * Fetch ALL companies (~5,215 unique companies)
 * Returns all companies in the database for autocomplete/filtering
 */
export async function fetchAllCompanies(): Promise<DPDCompanyResponse[]> {
  const url = buildUrl(DPD_API.BASE_URL, DPD_API.ENDPOINTS.COMPANY)
  return fetchWithRetry<DPDCompanyResponse[]>(url)
}
