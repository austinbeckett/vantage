// =============================================================================
// Unified React Query Hooks
// =============================================================================
// React Query hooks for unified search and data access across all sources

import { useQuery, useQueries, keepPreviousData } from '@tanstack/react-query'
import { API_CONFIG } from '../constants'
import { unifiedSearch, quickSearch, SEARCH_LIMITS, type UnifiedSearchFilters } from './search'
import { fetchCompleteDPDProduct, fetchCompleteDPDProductByDIN } from './product-aggregator'
import { transformCompleteDPDProduct, type UnifiedDrugProduct } from '../dpd/transformers'
import { fetchGSURData, fetchSURData } from '../scraper'

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const unifiedQueryKeys = {
  all: ['unified'] as const,
  search: (query: string) => [...unifiedQueryKeys.all, 'search', query] as const,
  searchWithFilters: (filters: UnifiedSearchFilters) =>
    [...unifiedQueryKeys.all, 'search', JSON.stringify(filters)] as const,
  quickSearch: (query: string) => [...unifiedQueryKeys.all, 'quickSearch', query] as const,
  product: (drugCode: number) => [...unifiedQueryKeys.all, 'product', drugCode] as const,
  productByDIN: (din: string) => [...unifiedQueryKeys.all, 'product', 'din', din] as const,
  gsur: () => [...unifiedQueryKeys.all, 'gsur'] as const,
  sur: () => [...unifiedQueryKeys.all, 'sur'] as const,
}

// -----------------------------------------------------------------------------
// Search Hooks
// -----------------------------------------------------------------------------

/**
 * Hook for unified search across all sources
 */
export function useUnifiedSearch(
  query: string,
  enabled: boolean = true,
  searchType: 'brand' | 'ingredient' | 'auto' = 'auto',
  limit: number = SEARCH_LIMITS.DEFAULT
) {
  return useQuery({
    queryKey: [...unifiedQueryKeys.search(query), searchType, limit],
    queryFn: () => unifiedSearch({ query, searchType, limit }),
    enabled: enabled && query.length >= API_CONFIG.MIN_SEARCH_LENGTH,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
    placeholderData: keepPreviousData,
  })
}

// Re-export SEARCH_LIMITS for consumers
export { SEARCH_LIMITS }

/**
 * Hook for unified search with filters
 */
export function useUnifiedSearchWithFilters(
  filters: UnifiedSearchFilters,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: unifiedQueryKeys.searchWithFilters(filters),
    queryFn: () => unifiedSearch(filters),
    enabled: enabled && filters.query.length >= API_CONFIG.MIN_SEARCH_LENGTH,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
    placeholderData: keepPreviousData,
  })
}

/**
 * Hook for quick search (autocomplete)
 */
export function useQuickSearch(query: string) {
  return useQuery({
    queryKey: unifiedQueryKeys.quickSearch(query),
    queryFn: () => quickSearch(query),
    enabled: query.length >= API_CONFIG.MIN_SEARCH_LENGTH,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
    placeholderData: keepPreviousData,
  })
}

// -----------------------------------------------------------------------------
// Product Hooks
// -----------------------------------------------------------------------------

/**
 * Hook to fetch a single product by drug code
 */
export function useProduct(drugCode: number | null) {
  return useQuery({
    queryKey: unifiedQueryKeys.product(drugCode!),
    queryFn: async () => {
      const data = await fetchCompleteDPDProduct(drugCode!)
      return transformCompleteDPDProduct(data)
    },
    enabled: drugCode !== null,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch a product by DIN
 */
export function useProductByDIN(din: string | null) {
  return useQuery({
    queryKey: unifiedQueryKeys.productByDIN(din!),
    queryFn: async () => {
      const data = await fetchCompleteDPDProductByDIN(din!)
      if (!data) return null
      return transformCompleteDPDProduct(data)
    },
    enabled: din !== null && din.length > 0,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch multiple products by drug codes
 */
export function useProducts(drugCodes: number[]) {
  return useQueries({
    queries: drugCodes.map(drugCode => ({
      queryKey: unifiedQueryKeys.product(drugCode),
      queryFn: async () => {
        const data = await fetchCompleteDPDProduct(drugCode)
        return transformCompleteDPDProduct(data)
      },
      staleTime: API_CONFIG.CACHE.STALE_TIME,
      gcTime: API_CONFIG.CACHE.GC_TIME,
    })),
    combine: results => ({
      data: results.map(r => r.data).filter((d): d is UnifiedDrugProduct => d !== undefined),
      isLoading: results.some(r => r.isLoading),
      isError: results.some(r => r.isError),
      errors: results.filter(r => r.error).map(r => r.error),
    }),
  })
}

// -----------------------------------------------------------------------------
// GSUR/SUR Hooks
// -----------------------------------------------------------------------------

/**
 * Hook to fetch all GSUR entries
 */
export function useGSUR() {
  return useQuery({
    queryKey: unifiedQueryKeys.gsur(),
    queryFn: fetchGSURData,
    staleTime: API_CONFIG.CACHE.SCRAPER_STALE_TIME,
    gcTime: API_CONFIG.CACHE.SCRAPER_GC_TIME,
  })
}

/**
 * Hook to fetch all SUR entries
 */
export function useSUR() {
  return useQuery({
    queryKey: unifiedQueryKeys.sur(),
    queryFn: fetchSURData,
    staleTime: API_CONFIG.CACHE.SCRAPER_STALE_TIME,
    gcTime: API_CONFIG.CACHE.SCRAPER_GC_TIME,
  })
}

/**
 * Hook to search GSUR entries
 */
export function useGSURSearch(query: string) {
  const { data: allEntries, ...rest } = useGSUR()

  const filteredEntries = allEntries?.filter(entry => {
    if (!query || query.length < API_CONFIG.MIN_SEARCH_LENGTH) return true
    const lowerQuery = query.toLowerCase()
    return (
      entry.medicinal_ingredients.toLowerCase().includes(lowerQuery) ||
      entry.company_name.toLowerCase().includes(lowerQuery) ||
      entry.therapeutic_area.toLowerCase().includes(lowerQuery)
    )
  })

  return {
    ...rest,
    data: filteredEntries,
  }
}

/**
 * Hook to search SUR entries
 */
export function useSURSearch(query: string) {
  const { data: allEntries, ...rest } = useSUR()

  const filteredEntries = allEntries?.filter(entry => {
    if (!query || query.length < API_CONFIG.MIN_SEARCH_LENGTH) return true
    const lowerQuery = query.toLowerCase()
    return (
      entry.medicinal_ingredients.toLowerCase().includes(lowerQuery) ||
      entry.company_sponsor_name.toLowerCase().includes(lowerQuery) ||
      entry.therapeutic_area.toLowerCase().includes(lowerQuery)
    )
  })

  return {
    ...rest,
    data: filteredEntries,
  }
}
