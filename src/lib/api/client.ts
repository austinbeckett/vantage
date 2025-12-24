// =============================================================================
// HTTP Client with Retry Logic
// =============================================================================
// Provides a robust fetch wrapper with timeout, retries, and error handling
// for Health Canada API calls.

import { API_CONFIG } from './constants'
import { getCachedResponse, setCachedResponse } from './cache'

export interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  signal?: AbortSignal
  /** Skip cache and fetch fresh data */
  skipCache?: boolean
}

export interface ApiError extends Error {
  status?: number
  statusText?: string
  isTimeout?: boolean
  isNetworkError?: boolean
  isAborted?: boolean
}

const defaultConfig: Required<Omit<RequestConfig, 'headers' | 'signal'>> = {
  timeout: API_CONFIG.TIMEOUT,
  retries: API_CONFIG.RETRIES,
  retryDelay: API_CONFIG.RETRY_DELAY,
  skipCache: false,
}

/**
 * Create an API error with additional context
 */
function createApiError(
  message: string,
  options?: {
    status?: number
    statusText?: string
    isTimeout?: boolean
    isNetworkError?: boolean
    isAborted?: boolean
  }
): ApiError {
  const error = new Error(message) as ApiError
  error.name = 'ApiError'
  error.status = options?.status
  error.statusText = options?.statusText
  error.isTimeout = options?.isTimeout ?? false
  error.isNetworkError = options?.isNetworkError ?? false
  error.isAborted = options?.isAborted ?? false
  return error
}

/**
 * Delay execution for a specified time
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000)
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const apiError = error as ApiError

    // Never retry aborted requests
    if (apiError.isAborted) return false

    // Retry on timeout
    if (apiError.isTimeout) return true

    // Retry on network errors
    if (apiError.isNetworkError) return true

    // Retry on server errors (5xx)
    if (apiError.status && apiError.status >= 500) return true

    // Retry on rate limiting (429)
    if (apiError.status === 429) return true
  }

  return false
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  timeout: number,
  headers?: Record<string, string>,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Abort our controller if external signal aborts
  const abortHandler = () => controller.abort()
  externalSignal?.addEventListener('abort', abortHandler)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Check if aborted by external signal first
      if (externalSignal?.aborted) {
        throw createApiError('Request aborted', { isAborted: true })
      }
      // Otherwise it was our timeout
      throw createApiError(`Request timeout after ${timeout}ms`, { isTimeout: true })
    }
    throw createApiError('Network error', { isNetworkError: true })
  } finally {
    clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', abortHandler)
  }
}

/**
 * Fetch with retry logic, exponential backoff, and caching
 */
export async function fetchWithRetry<T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout, retries, retryDelay, headers, signal, skipCache } = { ...defaultConfig, ...config }

  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cached = getCachedResponse<T>(url)
    if (cached !== null) {
      return cached
    }
  }

  let lastError: ApiError | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Check if already aborted before attempting
      if (signal?.aborted) {
        throw createApiError('Request aborted', { isAborted: true })
      }

      const response = await fetchWithTimeout(url, timeout, headers, signal)

      if (!response.ok) {
        throw createApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, statusText: response.statusText }
        )
      }

      const data = await response.json()

      // Cache successful response (unless explicitly skipped)
      if (!skipCache) {
        setCachedResponse(url, data)
      }

      return data as T
    } catch (error) {
      lastError = error instanceof Error
        ? (error as ApiError)
        : createApiError('Unknown error')

      // Don't retry on non-retryable errors
      if (!isRetryableError(lastError)) {
        throw lastError
      }

      // Don't wait after the last attempt
      if (attempt < retries) {
        const backoffDelay = getBackoffDelay(attempt, retryDelay)
        console.warn(
          `API request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${backoffDelay}ms:`,
          url
        )
        await delay(backoffDelay)
      }
    }
  }

  throw lastError ?? createApiError('Request failed after all retries')
}

/**
 * Build URL with query parameters
 * Handles both absolute URLs and relative paths (for proxy)
 */
export function buildUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  // For relative URLs (going through proxy), construct path manually
  const isRelative = baseUrl.startsWith('/')
  let fullPath: string

  if (isRelative) {
    // Ensure proper path joining for relative URLs
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    fullPath = `${base}${path}`
  } else {
    // For absolute URLs, use URL constructor
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    fullPath = new URL(endpoint, base).toString()
  }

  // Add query parameters
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullPath += (fullPath.includes('?') ? '&' : '?') + queryString
    }
  }

  return fullPath
}

/**
 * Parallel fetch with concurrency limit
 * Handles individual request failures gracefully - returns null for failed requests
 */
export async function fetchParallel<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = API_CONFIG.MAX_CONCURRENT_REQUESTS
): Promise<Array<T | null>> {
  const results: Array<T | null> = []
  const executing: Set<Promise<void>> = new Set()

  for (const request of requests) {
    const promise = (async () => {
      try {
        const result = await request()
        results.push(result)
      } catch (error) {
        console.error('Request failed in fetchParallel:', error)
        results.push(null)
      }
    })()

    executing.add(promise)
    promise.finally(() => executing.delete(promise))

    if (executing.size >= concurrency) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * Type guard to check if a value is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError'
}
