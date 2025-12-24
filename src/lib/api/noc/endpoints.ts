// =============================================================================
// NOC (Notice of Compliance) API Endpoints
// =============================================================================
// Documentation: https://health-products.canada.ca/api/documentation/noc-documentation-en.html
//
// Note: The NOC API doesn't support search by ingredient name.
// To search, we fetch all data and filter client-side.

import { fetchWithRetry, buildUrl } from '../client'
import { NOC_API } from '../constants'
import type {
  NOCMainResponse,
  NOCIngredientResponse,
  NOCDrugProductResponse,
  NOCDosageFormResponse,
  NOCRouteResponse,
} from './types'

// -----------------------------------------------------------------------------
// Fetch All Data (for search/filtering)
// -----------------------------------------------------------------------------

/**
 * Fetch all NOC main records
 * Returns all Notice of Compliance entries with manufacturer, dates, status, etc.
 * Note: skipCache=true because this data is cached in-memory in search.ts
 */
export async function fetchAllNOCMain(): Promise<NOCMainResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.NOTICE_OF_COMPLIANCE_MAIN, {
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCMainResponse[]>(url, {
    timeout: 60000, // 60 seconds - large dataset
    retries: 2,
    skipCache: true, // Too large for localStorage, uses in-memory cache instead
  })
}

/**
 * Fetch all medicinal ingredients
 * Returns all ingredients with their NOC numbers for cross-referencing
 * Note: skipCache=true because this data is cached in-memory in search.ts
 */
export async function fetchAllMedicinalIngredients(): Promise<NOCIngredientResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.MEDICINAL_INGREDIENT, {
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCIngredientResponse[]>(url, {
    timeout: 60000, // 60 seconds - large dataset
    retries: 2,
    skipCache: true, // Too large for localStorage, uses in-memory cache instead
  })
}

/**
 * Fetch all NOC drug products (brand names and DINs)
 * Returns all brand names associated with NOC numbers
 * Note: skipCache=true because this data is cached in-memory in search.ts
 */
export async function fetchAllNOCDrugProducts(): Promise<NOCDrugProductResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.DRUG_PRODUCT, {
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCDrugProductResponse[]>(url, {
    timeout: 60000, // 60 seconds - large dataset
    retries: 2,
    skipCache: true, // Too large for localStorage, uses in-memory cache instead
  })
}

/**
 * Fetch all NOC routes
 * Returns all routes for cross-referencing with NOC numbers
 * Note: skipCache=true because this data is cached in-memory in search.ts
 */
export async function fetchAllNOCRoutes(): Promise<NOCRouteResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.ROUTE, {
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCRouteResponse[]>(url, {
    timeout: 60000, // 60 seconds - large dataset
    retries: 2,
    skipCache: true, // Too large for localStorage, uses in-memory cache instead
  })
}

/**
 * Fetch all NOC dosage forms
 * Returns all dosage forms for cross-referencing with NOC numbers
 * Note: skipCache=true because this data is cached in-memory in search.ts
 */
export async function fetchAllNOCDosageForms(): Promise<NOCDosageFormResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.DOSAGE_FORM, {
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCDosageFormResponse[]>(url, {
    timeout: 60000, // 60 seconds - large dataset
    retries: 2,
    skipCache: true, // Too large for localStorage, uses in-memory cache instead
  })
}

// -----------------------------------------------------------------------------
// Fetch by NOC Number (for individual lookups)
// -----------------------------------------------------------------------------

/**
 * Fetch NOC main record by NOC number
 */
export async function fetchNOCMainByNumber(nocNumber: number): Promise<NOCMainResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.NOTICE_OF_COMPLIANCE_MAIN, {
    id: nocNumber,
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCMainResponse[]>(url)
}

/**
 * Fetch medicinal ingredients by NOC number
 */
export async function fetchIngredientsByNOCNumber(nocNumber: number): Promise<NOCIngredientResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.MEDICINAL_INGREDIENT, {
    id: nocNumber,
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCIngredientResponse[]>(url)
}

/**
 * Fetch drug products by NOC number
 */
export async function fetchDrugProductsByNOCNumber(nocNumber: number): Promise<NOCDrugProductResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.DRUG_PRODUCT, {
    id: nocNumber,
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCDrugProductResponse[]>(url)
}

/**
 * Fetch dosage forms by NOC number
 */
export async function fetchDosageFormsByNOCNumber(nocNumber: number): Promise<NOCDosageFormResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.DOSAGE_FORM, {
    id: nocNumber,
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCDosageFormResponse[]>(url)
}

/**
 * Fetch routes by NOC number
 */
export async function fetchRoutesByNOCNumber(nocNumber: number): Promise<NOCRouteResponse[]> {
  const url = buildUrl(NOC_API.BASE_URL, NOC_API.ENDPOINTS.ROUTE, {
    id: nocNumber,
    lang: 'en',
    type: 'json',
  })
  return fetchWithRetry<NOCRouteResponse[]>(url)
}

// -----------------------------------------------------------------------------
// Aliases for backwards compatibility with queries.ts
// -----------------------------------------------------------------------------

export const fetchNOCMain = fetchNOCMainByNumber
export const fetchNOCDrugProducts = fetchDrugProductsByNOCNumber
export const fetchNOCMedicinalIngredients = fetchIngredientsByNOCNumber
export const fetchNOCDosageForms = fetchDosageFormsByNOCNumber
export const fetchNOCRoutes = fetchRoutesByNOCNumber
