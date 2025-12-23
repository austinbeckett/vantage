// =============================================================================
// Watchlist Storage Hook
// =============================================================================
// Persists watchlists to local storage

import { useState, useEffect, useCallback } from 'react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface WatchlistCriteriaLive {
  // PRIMARY SEARCH CRITERIA (API-supported, at least one required)
  /** Drug Identification Number - 8-digit unique identifier */
  din: string | null
  /** Product name search term (uses Health Canada API brandname parameter) */
  searchTerm: string | null
  /** Ingredient name search term (uses Health Canada API ingredientname parameter) */
  ingredientName: string | null

  // PRIMARY FILTERS (client-side, always visible)
  /** Filter results by route of administration (exact match) */
  routeNameFilter: string | null
  /** Filter results by company/manufacturer name (partial match) */
  companyNameFilter: string | null

  // ADVANCED FILTERS (client-side, in accordion)
  /** Filter results by status code (exact match) */
  statusFilter: number | null
  /** Filter results by pharmaceutical/dosage form (exact match) */
  formNameFilter: string | null
  /** Filter results by drug class (partial match) */
  classFilter: string | null
  /** Filter results by schedule (exact match) */
  scheduleFilter: string | null
  /** Filter results by ATC code (prefix match) */
  atcFilter: string | null
}

/** Minimum characters required for text-based API search */
export const MIN_SEARCH_LENGTH = 5

/** Minimum characters required for DIN search (DINs are 8 digits) */
export const MIN_DIN_LENGTH = 8

/** Check if criteria has a valid primary search term */
export function hasValidPrimarySearch(criteria: WatchlistCriteriaLive): boolean {
  const din = criteria.din?.trim() || ''
  const searchTerm = criteria.searchTerm?.trim() || ''
  const ingredientName = criteria.ingredientName?.trim() || ''

  // DIN requires 8 characters, text searches require 5
  return din.length >= MIN_DIN_LENGTH ||
         searchTerm.length >= MIN_SEARCH_LENGTH ||
         ingredientName.length >= MIN_SEARCH_LENGTH
}

/** Get the primary search query from criteria */
export function getPrimarySearchQuery(criteria: WatchlistCriteriaLive): string {
  // DIN takes priority, then product name, then ingredient
  return criteria.din?.trim() || criteria.searchTerm?.trim() || criteria.ingredientName?.trim() || ''
}

/** Determine the search type based on criteria */
export function getSearchType(criteria: WatchlistCriteriaLive): 'din' | 'brand' | 'ingredient' | 'none' {
  const din = criteria.din?.trim() || ''
  const searchTerm = criteria.searchTerm?.trim() || ''
  const ingredientName = criteria.ingredientName?.trim() || ''

  if (din.length >= MIN_DIN_LENGTH) return 'din'
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

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setWatchlists(parsed)
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
    criteria: WatchlistCriteriaLive
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

  return {
    watchlists,
    isLoaded,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    toggleNotifications,
    getWatchlist,
  }
}
