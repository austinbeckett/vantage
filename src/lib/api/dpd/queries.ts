// =============================================================================
// DPD React Query Hooks
// =============================================================================
// React Query hooks for DPD API data fetching with caching

import { useQuery, useQueries, keepPreviousData } from '@tanstack/react-query'
import { API_CONFIG } from '../constants'
import * as endpoints from './endpoints'
import { transformCompleteDPDProduct, transformBasicDPDProduct } from './transformers'
import type { CompleteDPDProduct } from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const dpdQueryKeys = {
  all: ['dpd'] as const,
  products: () => [...dpdQueryKeys.all, 'products'] as const,
  product: (drugCode: number) => [...dpdQueryKeys.products(), drugCode] as const,
  productByDIN: (din: string) => [...dpdQueryKeys.products(), 'din', din] as const,
  search: (query: string) => [...dpdQueryKeys.all, 'search', query] as const,
  searchByBrand: (name: string) => [...dpdQueryKeys.all, 'brand-search', name] as const,
  searchByIngredient: (name: string) => [...dpdQueryKeys.all, 'ingredient-search', name] as const,
  ingredients: (drugCode: number) => [...dpdQueryKeys.all, 'ingredients', drugCode] as const,
  routes: (drugCode: number) => [...dpdQueryKeys.all, 'routes', drugCode] as const,
  forms: (drugCode: number) => [...dpdQueryKeys.all, 'forms', drugCode] as const,
  status: (drugCode: number) => [...dpdQueryKeys.all, 'status', drugCode] as const,
  therapeuticClass: (drugCode: number) => [...dpdQueryKeys.all, 'therapeutic', drugCode] as const,
  company: (companyCode: number) => [...dpdQueryKeys.all, 'company', companyCode] as const,
  // Reference data (all records)
  allRoutes: () => [...dpdQueryKeys.all, 'all-routes'] as const,
  allForms: () => [...dpdQueryKeys.all, 'all-forms'] as const,
  allCompanies: () => [...dpdQueryKeys.all, 'all-companies'] as const,
}

// -----------------------------------------------------------------------------
// Complete Product Data Fetching
// -----------------------------------------------------------------------------

/**
 * Fetch complete product data (aggregates multiple API calls)
 */
async function fetchCompleteProduct(drugCode: number): Promise<CompleteDPDProduct> {
  const [product, activeIngredients, routes, forms, statuses, therapeuticClass, schedules] =
    await Promise.all([
      endpoints.fetchDrugProductByDrugCode(drugCode),
      endpoints.fetchActiveIngredients(drugCode),
      endpoints.fetchRoutes(drugCode),
      endpoints.fetchForms(drugCode),
      endpoints.fetchStatus(drugCode),
      endpoints.fetchTherapeuticClass(drugCode),
      endpoints.fetchSchedule(drugCode),
    ])

  return {
    product: product[0],
    activeIngredients,
    routes,
    forms,
    statuses,
    therapeuticClass,
    schedules,
  }
}

/**
 * Fetch complete product by DIN
 */
async function fetchCompleteProductByDIN(din: string): Promise<CompleteDPDProduct | null> {
  const products = await endpoints.fetchDrugProductByDIN(din)
  if (products.length === 0) return null

  return fetchCompleteProduct(products[0].drug_code)
}

// -----------------------------------------------------------------------------
// React Query Hooks
// -----------------------------------------------------------------------------

/**
 * Hook to fetch a single product by drug code with complete data
 */
export function useProduct(drugCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.product(drugCode!),
    queryFn: async () => {
      const data = await fetchCompleteProduct(drugCode!)
      return transformCompleteDPDProduct(data)
    },
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch a product by DIN with complete data
 */
export function useProductByDIN(din: string | null) {
  return useQuery({
    queryKey: dpdQueryKeys.productByDIN(din!),
    queryFn: async () => {
      const data = await fetchCompleteProductByDIN(din!)
      if (!data) return null
      return transformCompleteDPDProduct(data)
    },
    enabled: din !== null && din.length > 0,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to search products by brand name
 * Returns basic product info (not complete data)
 */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: dpdQueryKeys.search(query),
    queryFn: async () => {
      const products = await endpoints.searchDrugProductsByBrandName(query)
      return products.map(transformBasicDPDProduct)
    },
    enabled: query.length >= API_CONFIG.MIN_SEARCH_LENGTH,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
    placeholderData: keepPreviousData,
  })
}

/**
 * Hook to search by active ingredient name
 */
export function useIngredientSearch(ingredientName: string) {
  return useQuery({
    queryKey: dpdQueryKeys.searchByIngredient(ingredientName),
    queryFn: async () => {
      const ingredients = await endpoints.searchActiveIngredientsByName(ingredientName)
      // Get unique drug codes
      const drugCodes = [...new Set(ingredients.map(i => i.drug_code))]
      return { ingredients, drugCodes }
    },
    enabled: ingredientName.length >= API_CONFIG.MIN_SEARCH_LENGTH,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
    placeholderData: keepPreviousData,
  })
}

/**
 * Hook to fetch complete data for multiple products
 * Used for batch loading search results
 */
export function useProducts(drugCodes: number[]) {
  return useQueries({
    queries: drugCodes.map(drugCode => ({
      queryKey: dpdQueryKeys.product(drugCode),
      queryFn: async () => {
        const data = await fetchCompleteProduct(drugCode)
        return transformCompleteDPDProduct(data)
      },
      staleTime: API_CONFIG.CACHE.STALE_TIME,
      gcTime: API_CONFIG.CACHE.GC_TIME,
    })),
    combine: results => ({
      data: results.map(r => r.data).filter(Boolean),
      isLoading: results.some(r => r.isLoading),
      isError: results.some(r => r.isError),
      errors: results.filter(r => r.error).map(r => r.error),
    }),
  })
}

/**
 * Hook to fetch active ingredients for a drug
 */
export function useActiveIngredients(drugCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.ingredients(drugCode!),
    queryFn: () => endpoints.fetchActiveIngredients(drugCode!),
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch routes of administration for a drug
 */
export function useRoutes(drugCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.routes(drugCode!),
    queryFn: () => endpoints.fetchRoutes(drugCode!),
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch pharmaceutical forms for a drug
 */
export function useForms(drugCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.forms(drugCode!),
    queryFn: () => endpoints.fetchForms(drugCode!),
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch status history for a drug
 */
export function useStatus(drugCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.status(drugCode!),
    queryFn: () => endpoints.fetchStatus(drugCode!),
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch therapeutic class for a drug
 */
export function useTherapeuticClass(drugCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.therapeuticClass(drugCode!),
    queryFn: () => endpoints.fetchTherapeuticClass(drugCode!),
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch company details
 */
export function useCompany(companyCode: number | null) {
  return useQuery({
    queryKey: dpdQueryKeys.company(companyCode!),
    queryFn: () => endpoints.fetchCompany(companyCode!),
    enabled: companyCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

// -----------------------------------------------------------------------------
// Reference Data Hooks (Fetch ALL - for autocomplete)
// -----------------------------------------------------------------------------
// These hooks fetch all reference data on demand and cache for extended periods.
// Use for autocomplete dropdowns where client-side filtering is appropriate.

const REFERENCE_DATA_STALE_TIME = 24 * 60 * 60 * 1000  // 24 hours
const REFERENCE_DATA_GC_TIME = 7 * 24 * 60 * 60 * 1000  // 7 days

/**
 * Hook to fetch ALL routes of administration
 * Returns ~101 unique routes for autocomplete
 */
export function useAllRoutes() {
  return useQuery({
    queryKey: dpdQueryKeys.allRoutes(),
    queryFn: endpoints.fetchAllRoutes,
    staleTime: REFERENCE_DATA_STALE_TIME,
    gcTime: REFERENCE_DATA_GC_TIME,
  })
}

/**
 * Hook to fetch ALL pharmaceutical forms
 * Returns ~130 unique forms for autocomplete
 */
export function useAllForms() {
  return useQuery({
    queryKey: dpdQueryKeys.allForms(),
    queryFn: endpoints.fetchAllForms,
    staleTime: REFERENCE_DATA_STALE_TIME,
    gcTime: REFERENCE_DATA_GC_TIME,
  })
}

/**
 * Hook to fetch ALL companies
 * Returns ~5,215 unique companies for autocomplete
 */
export function useAllCompanies() {
  return useQuery({
    queryKey: dpdQueryKeys.allCompanies(),
    queryFn: endpoints.fetchAllCompanies,
    staleTime: REFERENCE_DATA_STALE_TIME,
    gcTime: REFERENCE_DATA_GC_TIME,
  })
}

/**
 * Hook to search for brand names
 * Returns unique brand names from product search results
 */
export function useBrandSearch(brandName: string) {
  return useQuery({
    queryKey: dpdQueryKeys.searchByBrand(brandName),
    queryFn: async () => {
      const products = await endpoints.searchDrugProductsByBrandName(brandName)
      // Extract unique brand names
      const uniqueBrands = [...new Set(products.map(p => p.brand_name))]
      return { brands: uniqueBrands, products }
    },
    enabled: brandName.length >= API_CONFIG.MIN_SEARCH_LENGTH,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
    placeholderData: keepPreviousData,
  })
}
