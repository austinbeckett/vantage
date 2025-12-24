// =============================================================================
// Health Canada API Constants
// =============================================================================

/**
 * Drug Product Database (DPD) API
 * Documentation: https://health-products.canada.ca/api/documentation/dpd-documentation-en.html
 *
 * In development, requests go through Vite proxy to avoid CORS.
 * In production, you'll need a backend proxy or serverless function.
 */
export const DPD_API = {
  // Use relative URL to go through Vite proxy in development
  BASE_URL: '/api/drug',
  ENDPOINTS: {
    DRUG_PRODUCT: 'drugproduct/',
    ACTIVE_INGREDIENT: 'activeingredient/',
    COMPANY: 'company/',
    FORM: 'form/',
    PACKAGING: 'packaging/',
    PHARMACEUTICAL_STD: 'pharmaceuticalstd/',
    ROUTE: 'route/',
    SCHEDULE: 'schedule/',
    STATUS: 'status/',
    THERAPEUTIC_CLASS: 'therapeuticclass/',
    VETERINARY_SPECIES: 'veterinaryspecies/',
  },
} as const

/**
 * Notice of Compliance (NOC) API
 * Documentation: https://health-products.canada.ca/api/documentation/noc-documentation-en.html
 */
export const NOC_API = {
  // Use relative URL to go through Vite proxy in development
  BASE_URL: '/api/notice-of-compliance',
  ENDPOINTS: {
    DRUG_PRODUCT: 'drugproduct/',
    NOTICE_OF_COMPLIANCE_MAIN: 'noticeofcompliancemain/',
    DOSAGE_FORM: 'dosageform/',
    MEDICINAL_INGREDIENT: 'medicinalingredient/',
    ROUTE: 'route/',
    VET_SPECIES: 'vetspecies/',
  },
} as const

/**
 * Web scraping URLs (no API available)
 */
export const SCRAPE_URLS = {
  GSUR: 'https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/generic-submissions-under-review.html',
  SUR: 'https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/submissions-under-review.html',
} as const

/**
 * Supabase Edge Functions for scraped data
 */
export const SCRAPER_API = {
  get BASE_URL() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    return supabaseUrl ? `${supabaseUrl}/functions/v1` : ''
  },
  ENDPOINTS: {
    GSUR: '/scrape-gsur',
    SUR: '/scrape-sur',
    NOC_SEARCH: '/search-noc',
  },
} as const

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Request timeout in milliseconds
  // Health Canada API can be very slow (up to 60+ seconds for some queries)
  TIMEOUT: 60000,

  // Number of retry attempts for failed requests
  // Reduced from 3 since slow queries won't benefit from retries
  RETRIES: 1,

  // Base delay for exponential backoff (ms)
  RETRY_DELAY: 1000,

  // Maximum concurrent requests (to avoid rate limiting)
  MAX_CONCURRENT_REQUESTS: 5,

  // Cache times for React Query (in milliseconds)
  CACHE: {
    STALE_TIME: 5 * 60 * 1000,      // 5 minutes
    GC_TIME: 60 * 60 * 1000,        // 1 hour
    SCRAPER_STALE_TIME: 60 * 60 * 1000,  // 1 hour (scraped data updates less frequently)
    SCRAPER_GC_TIME: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Minimum search query length before making API calls
  MIN_SEARCH_LENGTH: 3,
} as const

/**
 * Data source identifiers
 */
export const DATA_SOURCES = {
  DPD: 'DPD',
  NOC: 'NOC',
  GSUR: 'GSUR',
  SUR: 'SUR',
} as const

export type DataSource = typeof DATA_SOURCES[keyof typeof DATA_SOURCES]
