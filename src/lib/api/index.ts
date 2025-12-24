// =============================================================================
// Health Canada API - Main Exports
// =============================================================================
// Unified API layer for Health Canada data sources

// Client and utilities
export { fetchWithRetry, buildUrl, fetchParallel, isApiError } from './client'
export type { RequestConfig, ApiError } from './client'

// Constants
export { DPD_API, NOC_API, SCRAPE_URLS, SCRAPER_API, API_CONFIG, DATA_SOURCES } from './constants'
export type { DataSource } from './constants'

// Status codes
export {
  DPD_STATUS_CODES,
  DPD_SCHEDULES,
  getStatusInfo,
  getStatusName,
  getStatusCategory,
  parseStatusCode,
  getActiveStatusCodes,
  getInactiveStatusCodes,
  isActiveStatus,
  getStatusOptions,
} from './status-codes'
export type { StatusInfo, ScheduleType } from './status-codes'

// DPD API - endpoints and transformers (not hooks to avoid conflicts)
export * from './dpd/endpoints'
export * from './dpd/transformers'

// NOC API - endpoints and transformers (not hooks to avoid conflicts)
export * from './noc/endpoints'
export * from './noc/transformers'

// Unified API - this is the main API to use for hooks
export * from './unified'

// Scraper
export * from './scraper'

// AI
export * from './ai'
