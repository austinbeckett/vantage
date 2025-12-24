// =============================================================================
// Watchlist Queries
// =============================================================================
// React Query hooks for fetching watchlist data

import { useQuery } from '@tanstack/react-query'
import { fetchWatchlistTimeline, fetchTabbedWatchlistData } from './fetcher'
import type { TabbedWatchlistData } from './fetcher'
import type { WatchlistCriteriaLive, SeenEntries } from '../../hooks/useWatchlistStorage'
import type { TimelineData } from '../../../types/timeline'
import { API_CONFIG } from '../constants'
import { hasValidPrimarySearch } from '../../hooks/useWatchlistStorage'

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const watchlistQueryKeys = {
  all: ['watchlist'] as const,
  timeline: (watchlistId: string) =>
    [...watchlistQueryKeys.all, 'timeline', watchlistId] as const,
  tabbed: (watchlistId: string) =>
    [...watchlistQueryKeys.all, 'tabbed', watchlistId] as const,
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Hook to fetch timeline data for a watchlist
 */
export function useWatchlistTimeline(
  watchlistId: string,
  criteria: WatchlistCriteriaLive,
  lastViewedAt: string | null,
  seenEntries: SeenEntries,
  enabled: boolean = true
) {
  const hasValidSearch = hasValidPrimarySearch(criteria)

  return useQuery<TimelineData>({
    queryKey: watchlistQueryKeys.timeline(watchlistId),
    queryFn: () =>
      fetchWatchlistTimeline({
        criteria,
        lastViewedAt,
        seenEntries,
      }),
    enabled: enabled && hasValidSearch,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}

/**
 * Hook to fetch tabbed data for a watchlist
 * Returns data organized by source (DPD, NOC, GSUR) for tabbed display
 */
export function useWatchlistTabbedData(
  watchlistId: string,
  criteria: WatchlistCriteriaLive,
  lastViewedAt: string | null,
  seenEntries: SeenEntries,
  enabled: boolean = true
) {
  const hasValidSearch = hasValidPrimarySearch(criteria)

  return useQuery<TabbedWatchlistData>({
    queryKey: watchlistQueryKeys.tabbed(watchlistId),
    queryFn: () =>
      fetchTabbedWatchlistData({
        criteria,
        lastViewedAt,
        seenEntries,
      }),
    enabled: enabled && hasValidSearch,
    staleTime: API_CONFIG.CACHE.STALE_TIME,
    gcTime: API_CONFIG.CACHE.GC_TIME,
  })
}
