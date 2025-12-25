// =============================================================================
// Watchlist Data Prefetching
// =============================================================================
// Utilities for prefetching watchlist data to improve perceived performance.
// Prefetch data before the user navigates to a watchlist detail page.

import { QueryClient } from '@tanstack/react-query'
import { watchlistQueryKeys } from './queries'
import { fetchTabbedWatchlistData } from './fetcher'
import type { WatchlistCriteriaLive, SeenEntries } from '../../hooks/useWatchlistStorage'
import { API_CONFIG } from '../constants'

/**
 * Prefetch watchlist tabbed data for a given watchlist.
 * This runs in the background and populates the React Query cache,
 * so the data is ready when the user navigates to the detail page.
 *
 * @param queryClient - The React Query client
 * @param watchlistId - The watchlist ID
 * @param criteria - The watchlist search criteria
 * @param lastViewedAt - When the watchlist was last viewed (optional)
 * @param seenEntries - Previously seen entries (optional)
 *
 * @example
 * // Prefetch on watchlist creation
 * const newWatchlist = createWatchlist(...)
 * prefetchWatchlistData(queryClient, newWatchlist.id, newWatchlist.criteria)
 *
 * // Prefetch on card hover
 * prefetchWatchlistData(queryClient, watchlist.id, watchlist.criteria)
 */
export function prefetchWatchlistData(
  queryClient: QueryClient,
  watchlistId: string,
  criteria: WatchlistCriteriaLive,
  lastViewedAt: string | null = null,
  seenEntries: SeenEntries = { dpd: [], noc: [], gsur: [] }
): void {
  // Don't await - this runs in background
  queryClient.prefetchQuery({
    queryKey: watchlistQueryKeys.tabbed(watchlistId),
    queryFn: () =>
      fetchTabbedWatchlistData({
        criteria,
        lastViewedAt,
        seenEntries,
      }),
    staleTime: API_CONFIG.CACHE.STALE_TIME,
  })
}

/**
 * Check if watchlist data is already cached.
 * Useful to avoid unnecessary prefetch calls.
 *
 * @param queryClient - The React Query client
 * @param watchlistId - The watchlist ID
 * @returns true if data is cached and not stale
 */
export function isWatchlistDataCached(
  queryClient: QueryClient,
  watchlistId: string
): boolean {
  const queryState = queryClient.getQueryState(watchlistQueryKeys.tabbed(watchlistId))
  if (!queryState) return false

  // Check if data exists and is not stale
  const staleTime = API_CONFIG.CACHE.STALE_TIME
  const dataUpdatedAt = queryState.dataUpdatedAt
  if (!dataUpdatedAt) return false

  return Date.now() - dataUpdatedAt < staleTime
}
