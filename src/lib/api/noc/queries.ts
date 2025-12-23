// =============================================================================
// NOC React Query Hooks
// =============================================================================
// React Query hooks for NOC API data fetching with caching

import { useQuery, useQueries } from '@tanstack/react-query'
import { API_CONFIG } from '../constants'
import * as endpoints from './endpoints'
import { transformCompleteNOCProduct } from './transformers'
import type { CompleteNOCProduct } from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const nocQueryKeys = {
  all: ['noc'] as const,
  notices: () => [...nocQueryKeys.all, 'notices'] as const,
  notice: (nocNumber: number) => [...nocQueryKeys.notices(), nocNumber] as const,
  drugProducts: (nocNumber: number) => [...nocQueryKeys.all, 'drugProducts', nocNumber] as const,
  ingredients: (nocNumber: number) => [...nocQueryKeys.all, 'ingredients', nocNumber] as const,
  dosageForms: (nocNumber: number) => [...nocQueryKeys.all, 'dosageForms', nocNumber] as const,
  routes: (nocNumber: number) => [...nocQueryKeys.all, 'routes', nocNumber] as const,
}

// -----------------------------------------------------------------------------
// Complete NOC Data Fetching
// -----------------------------------------------------------------------------

/**
 * Fetch complete NOC data (aggregates multiple API calls)
 */
async function fetchCompleteNOC(nocNumber: number): Promise<CompleteNOCProduct> {
  const [main, drugProducts, ingredients, dosageForms, routes] = await Promise.all([
    endpoints.fetchNOCMain(nocNumber),
    endpoints.fetchNOCDrugProducts(nocNumber),
    endpoints.fetchNOCMedicinalIngredients(nocNumber),
    endpoints.fetchNOCDosageForms(nocNumber),
    endpoints.fetchNOCRoutes(nocNumber),
  ])

  return {
    main: main[0],
    drugProducts,
    ingredients,
    dosageForms,
    routes,
  }
}

// -----------------------------------------------------------------------------
// React Query Hooks
// -----------------------------------------------------------------------------

/**
 * Hook to fetch a single NOC with complete data
 */
export function useNOC(nocNumber: number | null) {
  return useQuery({
    queryKey: nocQueryKeys.notice(nocNumber!),
    queryFn: async () => {
      const data = await fetchCompleteNOC(nocNumber!)
      return transformCompleteNOCProduct(data)
    },
    enabled: nocNumber !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch multiple NOCs with complete data
 */
export function useNOCs(nocNumbers: number[]) {
  return useQueries({
    queries: nocNumbers.map(nocNumber => ({
      queryKey: nocQueryKeys.notice(nocNumber),
      queryFn: async () => {
        const data = await fetchCompleteNOC(nocNumber)
        return transformCompleteNOCProduct(data)
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
 * Hook to fetch drug products for an NOC
 */
export function useNOCDrugProducts(nocNumber: number | null) {
  return useQuery({
    queryKey: nocQueryKeys.drugProducts(nocNumber!),
    queryFn: () => endpoints.fetchNOCDrugProducts(nocNumber!),
    enabled: nocNumber !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch medicinal ingredients for an NOC
 */
export function useNOCIngredients(nocNumber: number | null) {
  return useQuery({
    queryKey: nocQueryKeys.ingredients(nocNumber!),
    queryFn: () => endpoints.fetchNOCMedicinalIngredients(nocNumber!),
    enabled: nocNumber !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch dosage forms for an NOC
 */
export function useNOCDosageForms(nocNumber: number | null) {
  return useQuery({
    queryKey: nocQueryKeys.dosageForms(nocNumber!),
    queryFn: () => endpoints.fetchNOCDosageForms(nocNumber!),
    enabled: nocNumber !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch routes for an NOC
 */
export function useNOCRoutes(nocNumber: number | null) {
  return useQuery({
    queryKey: nocQueryKeys.routes(nocNumber!),
    queryFn: () => endpoints.fetchNOCRoutes(nocNumber!),
    enabled: nocNumber !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}
