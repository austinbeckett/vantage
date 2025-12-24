// =============================================================================
// Watchlist Storage Hook
// =============================================================================
// Persists watchlists to local storage

import { useState, useEffect, useCallback } from 'react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface WatchlistCriteriaLive {
  // PRIMARY SEARCH CRITERIA (at least one required)
  /** Product name search term (uses Health Canada API brandname parameter) */
  searchTerm: string | null
  /** Ingredient name search term (uses Health Canada API ingredientname parameter) */
  ingredientName: string | null

  // FILTERS (all optional)
  /** Drug Identification Number - 8-digit unique identifier (optional filter) */
  din: string | null
  /** Filter results by route of administration (exact match, OR logic) */
  routeNameFilter: string[] | null
  /** Filter results by company/manufacturer name (partial match, OR logic) */
  companyNameFilter: string[] | null
  /** Filter results by status codes (exact match, OR logic) */
  statusFilter: number[] | null
  /** Filter results by pharmaceutical/dosage form (exact match, OR logic) */
  formNameFilter: string[] | null
  /** Filter results by drug class (partial match, OR logic) */
  classFilter: string[] | null
  /** Filter results by schedule (exact match, OR logic) */
  scheduleFilter: string[] | null
  /** Filter results by ATC code (prefix match, OR logic) */
  atcFilter: string[] | null
}

/**
 * Migrate old single-value criteria to new array format
 * Handles backward compatibility for existing watchlists
 */
function migrateCriteria(criteria: any): WatchlistCriteriaLive {
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

  return {
    // Primary search (unchanged)
    din: criteria.din || null,
    searchTerm: criteria.searchTerm || null,
    ingredientName: criteria.ingredientName || null,
    // Filters (migrate to arrays)
    routeNameFilter: toStringArray(criteria.routeNameFilter),
    companyNameFilter: toStringArray(criteria.companyNameFilter),
    statusFilter: toNumberArray(criteria.statusFilter),
    formNameFilter: toStringArray(criteria.formNameFilter),
    classFilter: toStringArray(criteria.classFilter),
    scheduleFilter: toStringArray(criteria.scheduleFilter),
    atcFilter: toStringArray(criteria.atcFilter),
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
          // Migrate each watchlist's criteria to new array format
          const migrated = parsed.map((wl: any) => ({
            ...wl,
            criteria: migrateCriteria(wl.criteria),
          }))
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

  return {
    watchlists,
    isLoaded,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    toggleNotifications,
    getWatchlist,
    watchlistExists,
  }
}
