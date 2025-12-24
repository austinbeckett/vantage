// =============================================================================
// API Response Cache
// =============================================================================
// Provides localStorage caching for Health Canada API responses
// to avoid repeated slow queries for the same data.

// Cache configuration
const CACHE_CONFIG = {
  // Cache prefix to avoid collisions
  PREFIX: 'vantage_api_cache_',
  // Time-to-live for cached data (24 hours in milliseconds)
  TTL: 24 * 60 * 60 * 1000,
  // Maximum cache entries to prevent localStorage overflow
  MAX_ENTRIES: 100,
} as const

interface CacheEntry<T> {
  data: T
  timestamp: number
  url: string
}

/**
 * Generate a cache key from a URL
 */
function getCacheKey(url: string): string {
  return `${CACHE_CONFIG.PREFIX}${url}`
}

/**
 * Check if a cache entry is still valid
 */
function isEntryValid<T>(entry: CacheEntry<T>): boolean {
  const now = Date.now()
  return now - entry.timestamp < CACHE_CONFIG.TTL
}

/**
 * Get cached response if available and valid
 */
export function getCachedResponse<T>(url: string): T | null {
  try {
    const key = getCacheKey(url)
    const stored = localStorage.getItem(key)

    if (!stored) return null

    const entry: CacheEntry<T> = JSON.parse(stored)

    if (!isEntryValid(entry)) {
      // Remove expired entry
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.warn('Cache read error:', error)
    return null
  }
}

/**
 * Store a response in cache
 */
export function setCachedResponse<T>(url: string, data: T): void {
  try {
    const key = getCacheKey(url)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      url,
    }

    // Check cache size before adding
    cleanupCacheIfNeeded()

    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // localStorage might be full or disabled
    console.warn('Cache write error:', error)
    // Try to make room by clearing old entries
    cleanupCache()
  }
}

/**
 * Get all cache keys
 */
function getCacheKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_CONFIG.PREFIX)) {
      keys.push(key)
    }
  }
  return keys
}

/**
 * Clean up cache if it's getting too large
 */
function cleanupCacheIfNeeded(): void {
  const keys = getCacheKeys()
  if (keys.length >= CACHE_CONFIG.MAX_ENTRIES) {
    cleanupCache()
  }
}

/**
 * Remove expired entries and oldest entries if over limit
 */
function cleanupCache(): void {
  const keys = getCacheKeys()
  const entries: Array<{ key: string; timestamp: number }> = []

  // Collect all entries with their timestamps
  for (const key of keys) {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const entry = JSON.parse(stored)

        // Remove expired entries immediately
        if (!isEntryValid(entry)) {
          localStorage.removeItem(key)
          continue
        }

        entries.push({ key, timestamp: entry.timestamp })
      }
    } catch {
      // Remove corrupted entries
      localStorage.removeItem(key)
    }
  }

  // If still over limit, remove oldest entries
  if (entries.length >= CACHE_CONFIG.MAX_ENTRIES) {
    entries.sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = entries.slice(0, entries.length - CACHE_CONFIG.MAX_ENTRIES + 10)
    for (const { key } of toRemove) {
      localStorage.removeItem(key)
    }
  }
}

/**
 * Clear all cached responses
 */
export function clearApiCache(): void {
  const keys = getCacheKeys()
  for (const key of keys) {
    localStorage.removeItem(key)
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { entries: number; oldestAge: number | null } {
  const keys = getCacheKeys()
  let oldestTimestamp: number | null = null

  for (const key of keys) {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const entry = JSON.parse(stored)
        if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp
        }
      }
    } catch {
      // Ignore corrupted entries
    }
  }

  return {
    entries: keys.length,
    oldestAge: oldestTimestamp ? Date.now() - oldestTimestamp : null,
  }
}
