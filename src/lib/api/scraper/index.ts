// =============================================================================
// Scraper Client
// =============================================================================
// Client for fetching scraped data from Supabase Edge Functions
// GSUR and SUR data requires web scraping as Health Canada does not provide APIs

import { fetchWithRetry } from '../client'
import { SCRAPER_API, API_CONFIG } from '../constants'
import type { GSUREntry, SUREntry } from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// In-Memory Cache
// -----------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache: {
  gsur: CacheEntry<GSUREntry[]> | null
  sur: CacheEntry<SUREntry[]> | null
} = {
  gsur: null,
  sur: null,
}

function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false
  const age = Date.now() - entry.timestamp
  return age < API_CONFIG.CACHE.SCRAPER_STALE_TIME
}

// -----------------------------------------------------------------------------
// GSUR (Generic Submissions Under Review)
// -----------------------------------------------------------------------------

/**
 * Fetch GSUR data from Supabase Edge Function
 * Falls back to cached data if API fails
 */
export async function fetchGSURData(): Promise<GSUREntry[]> {
  // Return cached data if valid
  if (isCacheValid(cache.gsur)) {
    return cache.gsur!.data
  }

  try {
    const url = `${SCRAPER_API.BASE_URL}${SCRAPER_API.ENDPOINTS.GSUR}`

    if (!SCRAPER_API.BASE_URL) {
      console.warn('GSUR scraper not configured: Missing VITE_SUPABASE_URL')
      return cache.gsur?.data ?? []
    }

    const data = await fetchWithRetry<GSUREntry[]>(url, {
      timeout: 30000, // Longer timeout for scraping
      retries: 2,
    })

    // Update cache
    cache.gsur = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error('Failed to fetch GSUR data:', error)

    // Return stale cached data if available
    if (cache.gsur) {
      console.warn('Returning stale GSUR data from cache')
      return cache.gsur.data
    }

    throw error
  }
}

// -----------------------------------------------------------------------------
// SUR (Submissions Under Review)
// -----------------------------------------------------------------------------

/**
 * Fetch SUR data from Supabase Edge Function
 * Falls back to cached data if API fails
 */
export async function fetchSURData(): Promise<SUREntry[]> {
  // Return cached data if valid
  if (isCacheValid(cache.sur)) {
    return cache.sur!.data
  }

  try {
    const url = `${SCRAPER_API.BASE_URL}${SCRAPER_API.ENDPOINTS.SUR}`

    if (!SCRAPER_API.BASE_URL) {
      console.warn('SUR scraper not configured: Missing VITE_SUPABASE_URL')
      return cache.sur?.data ?? []
    }

    const data = await fetchWithRetry<SUREntry[]>(url, {
      timeout: 30000, // Longer timeout for scraping
      retries: 2,
    })

    // Update cache
    cache.sur = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error('Failed to fetch SUR data:', error)

    // Return stale cached data if available
    if (cache.sur) {
      console.warn('Returning stale SUR data from cache')
      return cache.sur.data
    }

    throw error
  }
}

// -----------------------------------------------------------------------------
// Cache Management
// -----------------------------------------------------------------------------

/**
 * Clear all scraper cache
 */
export function clearScraperCache(): void {
  cache.gsur = null
  cache.sur = null
}

/**
 * Clear specific cache
 */
export function clearGSURCache(): void {
  cache.gsur = null
}

export function clearSURCache(): void {
  cache.sur = null
}

/**
 * Get cache status
 */
export function getScraperCacheStatus(): {
  gsur: { cached: boolean; age: number | null }
  sur: { cached: boolean; age: number | null }
} {
  return {
    gsur: {
      cached: cache.gsur !== null,
      age: cache.gsur ? Date.now() - cache.gsur.timestamp : null,
    },
    sur: {
      cached: cache.sur !== null,
      age: cache.sur ? Date.now() - cache.sur.timestamp : null,
    },
  }
}

// -----------------------------------------------------------------------------
// Search Utilities
// -----------------------------------------------------------------------------

/**
 * Search GSUR entries by query
 */
export async function searchGSUR(query: string): Promise<GSUREntry[]> {
  const entries = await fetchGSURData()
  const lowerQuery = query.toLowerCase()

  return entries.filter(entry =>
    entry.medicinal_ingredients.toLowerCase().includes(lowerQuery) ||
    entry.company_name.toLowerCase().includes(lowerQuery) ||
    entry.therapeutic_area.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Search SUR entries by query
 */
export async function searchSUR(query: string): Promise<SUREntry[]> {
  const entries = await fetchSURData()
  const lowerQuery = query.toLowerCase()

  return entries.filter(entry =>
    entry.medicinal_ingredients.toLowerCase().includes(lowerQuery) ||
    entry.company_sponsor_name.toLowerCase().includes(lowerQuery) ||
    entry.therapeutic_area.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get GSUR entries by company name
 */
export async function getGSURByCompany(companyName: string): Promise<GSUREntry[]> {
  const entries = await fetchGSURData()
  const lowerCompany = companyName.toLowerCase()

  return entries.filter(entry =>
    entry.company_name.toLowerCase().includes(lowerCompany)
  )
}

/**
 * Get SUR entries by company name
 */
export async function getSURByCompany(companyName: string): Promise<SUREntry[]> {
  const entries = await fetchSURData()
  const lowerCompany = companyName.toLowerCase()

  return entries.filter(entry =>
    entry.company_sponsor_name.toLowerCase().includes(lowerCompany)
  )
}

/**
 * Get GSUR entries by therapeutic area
 */
export async function getGSURByTherapeuticArea(area: string): Promise<GSUREntry[]> {
  const entries = await fetchGSURData()
  const lowerArea = area.toLowerCase()

  return entries.filter(entry =>
    entry.therapeutic_area.toLowerCase().includes(lowerArea)
  )
}

/**
 * Get SUR entries by therapeutic area
 */
export async function getSURByTherapeuticArea(area: string): Promise<SUREntry[]> {
  const entries = await fetchSURData()
  const lowerArea = area.toLowerCase()

  return entries.filter(entry =>
    entry.therapeutic_area.toLowerCase().includes(lowerArea)
  )
}

/**
 * Get unique therapeutic areas from GSUR
 */
export async function getGSURTherapeuticAreas(): Promise<string[]> {
  const entries = await fetchGSURData()
  return [...new Set(entries.map(e => e.therapeutic_area))].sort()
}

/**
 * Get unique therapeutic areas from SUR
 */
export async function getSURTherapeuticAreas(): Promise<string[]> {
  const entries = await fetchSURData()
  return [...new Set(entries.map(e => e.therapeutic_area))].sort()
}

/**
 * Get unique companies from GSUR
 */
export async function getGSURCompanies(): Promise<string[]> {
  const entries = await fetchGSURData()
  return [...new Set(entries.map(e => e.company_name).filter(c => c !== 'Not available'))].sort()
}

/**
 * Get unique companies from SUR
 */
export async function getSURCompanies(): Promise<string[]> {
  const entries = await fetchSURData()
  return [...new Set(entries.map(e => e.company_sponsor_name).filter(c => c !== 'Not available'))].sort()
}
