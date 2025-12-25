// =============================================================================
// Custom Hooks - Main Exports
// =============================================================================

export { useDebouncedValue } from './useDebouncedValue'
export { useNOCCacheStatus } from './useNOCCacheStatus'
export { useWatchlistStorage, hasValidPrimarySearch, getPrimarySearchQuery, getSearchType, MIN_SEARCH_LENGTH, MIN_DIN_LENGTH, DEFAULT_DPD_STATUS_FILTER } from './useWatchlistStorage'
export type { WatchlistLive, WatchlistCriteriaLive, DPDViewFilters, SeenEntries, CachedCounts } from './useWatchlistStorage'
