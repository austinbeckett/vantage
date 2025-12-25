// =============================================================================
// NOC Cache Manager
// =============================================================================
// Manages the NOC data cache with background loading and progress tracking.
// Allows the app to start warming the cache immediately on load without
// blocking the UI, and provides progress updates for loading indicators.

import {
  fetchAllNOCMain,
  fetchAllMedicinalIngredients,
  fetchAllNOCDrugProducts,
  fetchAllNOCRoutes,
  fetchAllNOCDosageForms,
} from './endpoints'
import type {
  NOCMainResponse,
  NOCDrugProductResponse,
  NOCRouteResponse,
  NOCDosageFormResponse,
  NOCCache,
} from './types'
import { API_CONFIG } from '../constants'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type CacheStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface CacheProgress {
  status: CacheStatus
  loaded: number
  total: number
  message: string
  error?: string
}

type ProgressListener = (progress: CacheProgress) => void

// -----------------------------------------------------------------------------
// Cache Manager Class
// -----------------------------------------------------------------------------

const CACHE_TTL = API_CONFIG.CACHE.SCRAPER_STALE_TIME // 1 hour

/**
 * Singleton cache manager for NOC data.
 * Supports background loading with progress tracking.
 */
class NOCCacheManager {
  private cache: NOCCache | null = null
  private loadingPromise: Promise<NOCCache> | null = null
  private progress: CacheProgress = {
    status: 'idle',
    loaded: 0,
    total: 5,
    message: 'Not started',
  }
  private listeners: Set<ProgressListener> = new Set()

  /**
   * Subscribe to cache progress updates
   */
  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener)
    // Immediately call with current state
    listener(this.progress)
    // Return unsubscribe function
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of progress update
   */
  private notify(): void {
    this.listeners.forEach(listener => listener(this.progress))
  }

  /**
   * Update progress and notify listeners
   */
  private updateProgress(updates: Partial<CacheProgress>): void {
    this.progress = { ...this.progress, ...updates }
    this.notify()
  }

  /**
   * Check if cache is valid and ready to use
   */
  isReady(): boolean {
    return (
      this.cache !== null &&
      Date.now() - this.cache.timestamp < CACHE_TTL
    )
  }

  /**
   * Check if cache is currently loading
   */
  isLoading(): boolean {
    return this.progress.status === 'loading'
  }

  /**
   * Get current progress
   */
  getProgress(): CacheProgress {
    return this.progress
  }

  /**
   * Get the cache if ready, or null if not
   */
  getCache(): NOCCache | null {
    return this.isReady() ? this.cache : null
  }

  /**
   * Start loading cache in the background.
   * Does NOT block - returns immediately.
   * Use subscribe() to monitor progress.
   */
  startBackgroundLoad(): void {
    // Don't start if already loading or cache is valid
    if (this.loadingPromise || this.isReady()) {
      return
    }
    // Start loading but don't await
    this.loadInBackground()
  }

  /**
   * Ensure cache is loaded, waiting if necessary.
   * Use this when you NEED the cache to proceed.
   */
  async ensureCache(): Promise<NOCCache> {
    // Return immediately if cache is valid
    if (this.isReady()) {
      return this.cache!
    }

    // If already loading, wait for that promise
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // Start loading and wait
    return this.loadInBackground()
  }

  /**
   * Clear the cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache = null
    this.loadingPromise = null
    this.updateProgress({
      status: 'idle',
      loaded: 0,
      message: 'Cache cleared',
    })
  }

  /**
   * Internal method to load cache with progress tracking
   */
  private async loadInBackground(): Promise<NOCCache> {
    this.updateProgress({
      status: 'loading',
      loaded: 0,
      message: 'Starting NOC data fetch...',
    })

    this.loadingPromise = this.performLoad()

    try {
      const result = await this.loadingPromise
      return result
    } finally {
      this.loadingPromise = null
    }
  }

  /**
   * Perform the actual data loading with progress updates
   */
  private async performLoad(): Promise<NOCCache> {
    const startTime = Date.now()

    try {
      // Fetch each dataset and track progress
      this.updateProgress({ loaded: 0, message: 'Loading NOC main records...' })
      const mainData = await fetchAllNOCMain()

      this.updateProgress({ loaded: 1, message: 'Loading medicinal ingredients...' })
      const ingredientsData = await fetchAllMedicinalIngredients()

      this.updateProgress({ loaded: 2, message: 'Loading drug products...' })
      const drugProductsData = await fetchAllNOCDrugProducts()

      this.updateProgress({ loaded: 3, message: 'Loading routes...' })
      const routesData = await fetchAllNOCRoutes()

      this.updateProgress({ loaded: 4, message: 'Loading dosage forms...' })
      const dosageFormsData = await fetchAllNOCDosageForms()

      this.updateProgress({ loaded: 5, message: 'Building indexes...' })

      // Build indexed maps
      const mainMap = new Map<number, NOCMainResponse>()
      for (const item of mainData) {
        mainMap.set(item.noc_number, item)
      }

      const drugProductsMap = new Map<number, NOCDrugProductResponse[]>()
      for (const item of drugProductsData) {
        if (!drugProductsMap.has(item.noc_number)) {
          drugProductsMap.set(item.noc_number, [])
        }
        drugProductsMap.get(item.noc_number)!.push(item)
      }

      const routesMap = new Map<number, NOCRouteResponse[]>()
      for (const item of routesData) {
        if (!routesMap.has(item.noc_number)) {
          routesMap.set(item.noc_number, [])
        }
        routesMap.get(item.noc_number)!.push(item)
      }

      const dosageFormsMap = new Map<number, NOCDosageFormResponse[]>()
      for (const item of dosageFormsData) {
        if (!dosageFormsMap.has(item.noc_number)) {
          dosageFormsMap.set(item.noc_number, [])
        }
        dosageFormsMap.get(item.noc_number)!.push(item)
      }

      // Create cache object
      this.cache = {
        main: mainMap,
        ingredients: ingredientsData,
        drugProducts: drugProductsMap,
        routes: routesMap,
        dosageForms: dosageFormsMap,
        timestamp: Date.now(),
      }

      const elapsed = Date.now() - startTime
      console.log(
        `NOC cache loaded: ${mainData.length} NOC entries, ` +
        `${ingredientsData.length} ingredients, ` +
        `${drugProductsData.length} drug products, ` +
        `${routesData.length} routes, ` +
        `${dosageFormsData.length} dosage forms in ${elapsed}ms`
      )

      this.updateProgress({
        status: 'ready',
        loaded: 5,
        message: 'Ready',
      })

      return this.cache
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('NOC cache load failed:', error)

      this.updateProgress({
        status: 'error',
        message: 'Failed to load NOC data',
        error: errorMessage,
      })

      throw error
    }
  }
}

// -----------------------------------------------------------------------------
// Singleton Export
// -----------------------------------------------------------------------------

/**
 * Singleton instance of the NOC cache manager.
 * Use this to start background loading and check cache status.
 *
 * @example
 * // Start warming cache on app load
 * nocCacheManager.startBackgroundLoad()
 *
 * // Check if ready before searching
 * if (nocCacheManager.isReady()) {
 *   const cache = nocCacheManager.getCache()
 *   // ... use cache
 * }
 *
 * // Or wait for cache if needed
 * const cache = await nocCacheManager.ensureCache()
 */
export const nocCacheManager = new NOCCacheManager()
