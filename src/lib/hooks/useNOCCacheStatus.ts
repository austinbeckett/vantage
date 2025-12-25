// =============================================================================
// NOC Cache Status Hook
// =============================================================================
// React hook for subscribing to NOC cache loading progress.
// Useful for showing loading indicators while the NOC cache warms up.

import { useState, useEffect } from 'react'
import { nocCacheManager, type CacheProgress } from '../api/noc'

/**
 * Hook to subscribe to NOC cache loading progress.
 *
 * @returns Current cache status and progress information
 *
 * @example
 * function MyComponent() {
 *   const { isReady, isLoading, progress, message } = useNOCCacheStatus()
 *
 *   if (isLoading) {
 *     return <ProgressBar value={progress} message={message} />
 *   }
 *
 *   if (isReady) {
 *     return <NOCSearchResults />
 *   }
 * }
 */
export function useNOCCacheStatus() {
  const [progress, setProgress] = useState<CacheProgress>(
    nocCacheManager.getProgress()
  )

  useEffect(() => {
    // Subscribe to progress updates
    const unsubscribe = nocCacheManager.subscribe(setProgress)
    return unsubscribe
  }, [])

  return {
    /** Whether the cache is fully loaded and ready to use */
    isReady: progress.status === 'ready',
    /** Whether the cache is currently loading */
    isLoading: progress.status === 'loading',
    /** Whether the cache is in an error state */
    isError: progress.status === 'error',
    /** Whether loading hasn't started yet */
    isIdle: progress.status === 'idle',
    /** Progress percentage (0-100) */
    progress: Math.round((progress.loaded / progress.total) * 100),
    /** Number of datasets loaded (out of 5) */
    loaded: progress.loaded,
    /** Total datasets to load (5) */
    total: progress.total,
    /** Human-readable status message */
    message: progress.message,
    /** Error message if status is 'error' */
    error: progress.error,
    /** Raw status value */
    status: progress.status,
  }
}
