// =============================================================================
// Watchlist Storage Hook
// =============================================================================
// Persists watchlists to local storage

import { useState, useEffect, useCallback } from 'react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Primary search criteria for watchlist notifications
 * These define WHAT to track across all data sources (DPD, NOC, GSUR)
 */
export interface WatchlistCriteriaLive {
  /** Product name search term (uses Health Canada API brandname parameter) */
  searchTerm: string | null
  /** Ingredient name search term (uses Health Canada API ingredientname parameter) */
  ingredientName: string | null
  /** Filter by route of administration - applies to DPD and NOC (notification scope) */
  routeFilter: string[] | null
  /** Filter by dosage form - applies to DPD and NOC (notification scope) */
  formFilter: string[] | null
}

/**
 * View-only filters for the DPD tab
 * These are for narrowing results display, NOT for notification scope
 * Stored separately per watchlist and applied client-side
 */
export interface DPDViewFilters {
  /** Filter results by status codes (exact match, OR logic). Defaults to [1, 2] (Approved, Marketed) */
  statusFilter: number[] | null
}

/**
 * Default status filter: shows only Approved (1) and Marketed (2) products
 * This filters out Cancelled and Post Market products by default
 */
export const DEFAULT_DPD_STATUS_FILTER: number[] = [1, 2]

/**
 * Helper functions for array conversion
 */
const toStringArray = (val: any): string[] | null => {
  if (val === null || val === undefined || val === '') return null
  if (Array.isArray(val)) return val.length > 0 ? val : null
  return [val]
}

const toNumberArray = (val: any): number[] | null => {
  if (val === null || val === undefined) return null
  if (Array.isArray(val)) return val.length > 0 ? val : null
  return [val]
}

/**
 * Check if status filter is set in a DPDViewFilters object
 */
function hasStatusFilter(filters: DPDViewFilters): boolean {
  return !!(filters.statusFilter?.length)
}

/**
 * Migrate old criteria format to new simplified criteria + separate DPD view filters
 * Handles backward compatibility for existing watchlists
 *
 * Migration strategy:
 * - Route/form move from dpdViewFilters to criteria (notification scope)
 * - Only statusFilter remains in dpdViewFilters (view-only)
 * - Other filters (din, company, class, schedule, atc) are discarded
 * - Status defaults to [1, 2] (Approved, Marketed) if not set
 */
function migrateWatchlist(wl: any): { criteria: WatchlistCriteriaLive; dpdViewFilters: DPDViewFilters | undefined } {
  const criteria = wl.criteria || {}
  const existingDpdFilters = wl.dpdViewFilters || {}

  // Migrate route/form from old dpdViewFilters to criteria (notification scope)
  const routeFilter = toStringArray(
    criteria.routeFilter || existingDpdFilters.routeNameFilter || criteria.routeNameFilter
  )
  const formFilter = toStringArray(
    criteria.formFilter || existingDpdFilters.formNameFilter || criteria.formNameFilter
  )

  // Status stays in dpdViewFilters (view-only), defaults to Approved + Marketed
  const statusFilter = toNumberArray(
    existingDpdFilters.statusFilter || criteria.statusFilter
  ) ?? DEFAULT_DPD_STATUS_FILTER

  // Build simplified DPD view filters (status only)
  const dpdViewFilters: DPDViewFilters = {
    statusFilter,
  }

  // Return new criteria with route/form as notification-scope filters
  return {
    criteria: {
      searchTerm: criteria.searchTerm || null,
      ingredientName: criteria.ingredientName || null,
      routeFilter,
      formFilter,
    },
    dpdViewFilters: hasStatusFilter(dpdViewFilters) ? dpdViewFilters : undefined,
  }
}

/** Minimum characters required for text-based API search */
export const MIN_SEARCH_LENGTH = 3

/** Minimum characters required for DIN search (DINs are 8 digits) */
export const MIN_DIN_LENGTH = 8

/** Check if criteria has a valid primary search term */
export function hasValidPrimarySearch(criteria: WatchlistCriteriaLive): boolean {
  const searchTerm = criteria.searchTerm?.trim() || ''
  const ingredientName = criteria.ingredientName?.trim() || ''

  // Primary search requires either product name or ingredient with minimum characters
  return searchTerm.length >= MIN_SEARCH_LENGTH ||
         ingredientName.length >= MIN_SEARCH_LENGTH
}

/** Get the primary search query from criteria */
export function getPrimarySearchQuery(criteria: WatchlistCriteriaLive): string {
  // Product name takes priority, then ingredient
  return criteria.searchTerm?.trim() || criteria.ingredientName?.trim() || ''
}

/** Determine the search type based on criteria */
export function getSearchType(criteria: WatchlistCriteriaLive): 'brand' | 'ingredient' | 'none' {
  const searchTerm = criteria.searchTerm?.trim() || ''
  const ingredientName = criteria.ingredientName?.trim() || ''

  if (searchTerm.length >= MIN_SEARCH_LENGTH) return 'brand'
  if (ingredientName.length >= MIN_SEARCH_LENGTH) return 'ingredient'
  return 'none'
}

/** Seen entries tracking for "new" badge functionality */
export interface SeenEntries {
  /** DIN values from DPD */
  dpd: string[]
  /** NOC numbers from Notice of Compliance */
  noc: number[]
  /** Composite keys from GSUR: ingredient-company-yearMonth */
  gsur: string[]
}

/** Cached counts for quick display on watchlist cards */
export interface CachedCounts {
  dpd: number
  noc: number
  gsur: number
  newSinceLastView: number
  lastUpdated: string
}

export interface WatchlistLive {
  id: string
  name: string
  description: string
  criteria: WatchlistCriteriaLive
  notificationsActive: boolean
  createdAt: string
  lastUpdated: string
  /** Indicates AI is currently generating the name and description */
  isGeneratingMetadata?: boolean
  /** Timestamp when the watchlist was last viewed (for "new" badge tracking) */
  lastViewedAt: string | null
  /** IDs of entries that have been seen (for tracking new vs. viewed) */
  seenEntries: SeenEntries
  /** Cached counts from last fetch (for card display without refetching) */
  cachedCounts?: CachedCounts
  /** View-only filters for the DPD tab (persisted per watchlist) */
  dpdViewFilters?: DPDViewFilters
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const STORAGE_KEY = 'vantage-watchlists'

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useWatchlistStorage() {
  const [watchlists, setWatchlists] = useState<WatchlistLive[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage on mount (with migration for backward compatibility)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Migrate each watchlist to new format (simplified criteria + separate DPD view filters)
          const migrated = parsed.map((wl: any) => {
            const { criteria, dpdViewFilters } = migrateWatchlist(wl)
            return {
              ...wl,
              criteria,
              dpdViewFilters: dpdViewFilters ?? wl.dpdViewFilters,
              // Add new tracking fields with defaults if missing
              lastViewedAt: wl.lastViewedAt ?? null,
              seenEntries: wl.seenEntries ?? { dpd: [], noc: [], gsur: [] },
              cachedCounts: wl.cachedCounts ?? undefined,
            }
          })
          setWatchlists(migrated)
        }
      }
    } catch (error) {
      console.error('Failed to load watchlists from storage:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to local storage when watchlists change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists))
      } catch (error) {
        console.error('Failed to save watchlists to storage:', error)
      }
    }
  }, [watchlists, isLoaded])

  // Create a new watchlist
  const createWatchlist = useCallback((
    name: string,
    description: string,
    criteria: WatchlistCriteriaLive,
    isGeneratingMetadata: boolean = false
  ): WatchlistLive => {
    const now = new Date().toISOString()
    const newWatchlist: WatchlistLive = {
      id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      criteria,
      notificationsActive: true,
      createdAt: now,
      lastUpdated: now,
      isGeneratingMetadata,
      // Initialize tracking fields
      lastViewedAt: null,
      seenEntries: { dpd: [], noc: [], gsur: [] },
      cachedCounts: undefined,
      // Default DPD view filter: show only Approved + Marketed products
      dpdViewFilters: { statusFilter: DEFAULT_DPD_STATUS_FILTER },
    }

    setWatchlists(prev => [newWatchlist, ...prev])
    return newWatchlist
  }, [])

  // Update an existing watchlist
  const updateWatchlist = useCallback((
    id: string,
    updates: Partial<Omit<WatchlistLive, 'id' | 'createdAt'>>
  ) => {
    setWatchlists(prev => prev.map(wl =>
      wl.id === id
        ? { ...wl, ...updates, lastUpdated: new Date().toISOString() }
        : wl
    ))
  }, [])

  // Delete a watchlist
  const deleteWatchlist = useCallback((id: string) => {
    setWatchlists(prev => prev.filter(wl => wl.id !== id))
  }, [])

  // Toggle notifications for a watchlist
  const toggleNotifications = useCallback((id: string) => {
    setWatchlists(prev => prev.map(wl =>
      wl.id === id
        ? { ...wl, notificationsActive: !wl.notificationsActive, lastUpdated: new Date().toISOString() }
        : wl
    ))
  }, [])

  // Get a single watchlist by ID
  const getWatchlist = useCallback((id: string): WatchlistLive | undefined => {
    return watchlists.find(wl => wl.id === id)
  }, [watchlists])

  // Check if a watchlist still exists (useful for async operations)
  const watchlistExists = useCallback((id: string): boolean => {
    return watchlists.some(wl => wl.id === id)
  }, [watchlists])

  // Mark a watchlist as viewed and update seen entries
  const markAsViewed = useCallback((
    id: string,
    currentEntries: SeenEntries
  ) => {
    setWatchlists(prev => prev.map(wl =>
      wl.id === id
        ? {
            ...wl,
            lastViewedAt: new Date().toISOString(),
            seenEntries: currentEntries,
            lastUpdated: new Date().toISOString(),
          }
        : wl
    ))
  }, [])

  // Update cached counts for a watchlist (used for card display)
  const updateCachedCounts = useCallback((
    id: string,
    counts: CachedCounts
  ) => {
    setWatchlists(prev => prev.map(wl =>
      wl.id === id
        ? { ...wl, cachedCounts: counts }
        : wl
    ))
  }, [])

  // Update DPD view filters for a watchlist (used for filtering in DPD tab)
  const updateDPDViewFilters = useCallback((
    id: string,
    filters: DPDViewFilters | null
  ) => {
    setWatchlists(prev => prev.map(wl =>
      wl.id === id
        ? { ...wl, dpdViewFilters: filters || undefined, lastUpdated: new Date().toISOString() }
        : wl
    ))
  }, [])

  return {
    watchlists,
    isLoaded,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    toggleNotifications,
    getWatchlist,
    watchlistExists,
    markAsViewed,
    updateCachedCounts,
    updateDPDViewFilters,
  }
}
