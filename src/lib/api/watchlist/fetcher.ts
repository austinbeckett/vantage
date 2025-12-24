// =============================================================================
// Watchlist Timeline Fetcher
// =============================================================================
// Fetches data from DPD, NOC, and GSUR for a watchlist and transforms
// results into a unified timeline format

import type { WatchlistCriteriaLive, SeenEntries } from '../../hooks/useWatchlistStorage'
import type {
  TimelineEvent,
  TimelineData,
  TimelineEventSource,
  TimelineEventType,
  TimelineEventCategory,
} from '../../../types/timeline'
import type { UnifiedDrugProduct } from '../dpd/transformers'
import type { GSUREntry } from '../../../types/health-canada-api'
import { unifiedSearch, SEARCH_LIMITS } from '../unified/search'
import { searchNOCByIngredientWithFilters, type NOCSearchResult } from '../noc'
import { searchGSUR } from '../scraper'
import { getSearchType, getPrimarySearchQuery } from '../../hooks/useWatchlistStorage'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface WatchlistFetchOptions {
  criteria: WatchlistCriteriaLive
  lastViewedAt: string | null
  seenEntries: SeenEntries
}

export interface TabbedFetchOptions {
  criteria: WatchlistCriteriaLive
  lastViewedAt: string | null
  seenEntries: SeenEntries
}

export interface DPDTabData {
  products: UnifiedDrugProduct[]
  count: number
  newCount: number
}

export interface NOCTabData {
  entries: (NOCSearchResult & { isNew: boolean })[]
  count: number
  newCount: number
}

export interface GSURTabData {
  entries: (GSUREntry & { isNew: boolean; id: string })[]
  count: number
  newCount: number
}

export interface TabbedWatchlistData {
  dpd: DPDTabData
  noc: NOCTabData
  gsur: GSURTabData
  lastFetched: string
}

// -----------------------------------------------------------------------------
// Timeline Event Generators
// -----------------------------------------------------------------------------

/**
 * Generate unique ID for a DPD product event
 */
function getDPDEventId(product: UnifiedDrugProduct): string {
  return `dpd-${product.drugCode}-${product.din}`
}

/**
 * Generate unique ID for an NOC event
 */
function getNOCEventId(noc: NOCSearchResult): string {
  return `noc-${noc.nocNumber}`
}

/**
 * Generate unique ID for a GSUR event
 */
function getGSUREventId(entry: GSUREntry): string {
  // Create composite key from ingredient, company, and date
  const ingredient = entry.medicinal_ingredients.toLowerCase().replace(/\s+/g, '-').slice(0, 50)
  const company = entry.company_name.toLowerCase().replace(/\s+/g, '-').slice(0, 30)
  return `gsur-${ingredient}-${company}-${entry.year_month_accepted}`
}

/**
 * Check if an event is new (not seen before)
 */
function isEventNew(
  eventDate: string,
  lastViewedAt: string | null,
  seenIds: string[] | number[],
  eventId: string | number
): boolean {
  // If never viewed, everything is new
  if (!lastViewedAt) {
    return true
  }

  // Check if already in seen list
  const seen = seenIds.includes(eventId as never)
  if (seen) {
    return false
  }

  // Check if event is newer than last viewed
  const eventTime = new Date(eventDate).getTime()
  const viewedTime = new Date(lastViewedAt).getTime()

  return eventTime > viewedTime
}

/**
 * Transform DPD products to timeline events
 */
function transformDPDToTimeline(
  products: UnifiedDrugProduct[],
  seenDINs: string[],
  lastViewedAt: string | null,
  matchedIngredient?: string
): TimelineEvent[] {
  return products.map(product => {
    // Use last status update date if available, otherwise use current date
    const eventDate = product.lastUpdated || new Date().toISOString().split('T')[0]

    // Build description from active ingredients
    const description = product.activeIngredients
      .map(i => `${i.name} ${i.strength}${i.strengthUnit}`)
      .join(', ')

    const event: TimelineEvent = {
      id: getDPDEventId(product),
      source: 'DPD' as TimelineEventSource,
      eventType: 'dpd_new_product' as TimelineEventType,
      date: eventDate,
      title: product.brandName,
      subtitle: product.companyName,
      description,
      din: product.din,
      drugCode: product.drugCode,
      matchedIngredient,
      companyName: product.companyName,
      isNew: isEventNew(eventDate, lastViewedAt, seenDINs, product.din),
      category: 'status_change' as TimelineEventCategory,
    }

    return event
  })
}

/**
 * Transform NOC results to timeline events
 */
function transformNOCToTimeline(
  nocResults: NOCSearchResult[],
  seenNOCNumbers: number[],
  lastViewedAt: string | null,
  matchedIngredient?: string
): TimelineEvent[] {
  return nocResults.map(noc => {
    const eventType: TimelineEventType = noc.isSupplement ? 'noc_supplement' : 'noc_approval'
    const category: TimelineEventCategory = noc.isSupplement ? 'supplement' : 'approval'

    // Build description
    let description = noc.therapeuticClass
    if (noc.reasonSupplement) {
      description = noc.reasonSupplement
    } else if (noc.reasonSubmission) {
      description = noc.reasonSubmission
    }

    // Include matched ingredients in description
    const ingredientList = noc.matchedIngredients
      .map(i => `${i.name} ${i.strength}${i.unit}`)
      .join(', ')
    if (ingredientList) {
      description = `${ingredientList}. ${description}`
    }

    const event: TimelineEvent = {
      id: getNOCEventId(noc),
      source: 'NOC' as TimelineEventSource,
      eventType,
      date: noc.nocDate,
      title: noc.brandNames.length > 0 ? noc.brandNames[0] : `NOC #${noc.nocNumber}`,
      subtitle: noc.manufacturer,
      description,
      nocNumber: noc.nocNumber,
      din: noc.dins.length > 0 ? noc.dins[0] : undefined,
      matchedIngredient: matchedIngredient || noc.matchedIngredients[0]?.name,
      companyName: noc.manufacturer,
      isNew: isEventNew(noc.nocDate, lastViewedAt, seenNOCNumbers, noc.nocNumber),
      category,
    }

    return event
  })
}

/**
 * Transform GSUR entries to timeline events
 */
function transformGSURToTimeline(
  gsurEntries: GSUREntry[],
  seenGSURKeys: string[],
  lastViewedAt: string | null,
  matchedIngredient?: string
): TimelineEvent[] {
  return gsurEntries.map(entry => {
    // Convert year_month_accepted (YYYY-MM) to a date
    const eventDate = `${entry.year_month_accepted}-01`
    const eventId = getGSUREventId(entry)

    const event: TimelineEvent = {
      id: eventId,
      source: 'GSUR' as TimelineEventSource,
      eventType: 'gsur_filing' as TimelineEventType,
      date: eventDate,
      title: entry.medicinal_ingredients,
      subtitle: entry.company_name,
      description: entry.therapeutic_area,
      matchedIngredient: matchedIngredient || entry.medicinal_ingredients,
      companyName: entry.company_name,
      isNew: isEventNew(eventDate, lastViewedAt, seenGSURKeys, eventId),
      category: 'filing' as TimelineEventCategory,
    }

    return event
  })
}

// -----------------------------------------------------------------------------
// Main Fetcher
// -----------------------------------------------------------------------------

/**
 * Fetch timeline data for a watchlist from all three sources
 */
export async function fetchWatchlistTimeline(
  options: WatchlistFetchOptions
): Promise<TimelineData> {
  const { criteria, lastViewedAt, seenEntries } = options

  // Determine search type and query
  const searchType = getSearchType(criteria)
  const searchQuery = getPrimarySearchQuery(criteria)

  if (searchType === 'none' || !searchQuery) {
    return {
      events: [],
      counts: { total: 0, dpd: 0, noc: 0, gsur: 0, newEntries: 0 },
      lastFetched: new Date().toISOString(),
    }
  }

  // Extract ingredient for matching
  const matchedIngredient = criteria.ingredientName || undefined

  // Fetch from all sources in parallel
  // Route/Form filters are notification-scope and applied server-side to DPD/NOC
  const [dpdResult, nocResult, gsurResult] = await Promise.allSettled([
    // DPD search via unified search with route/form filters
    unifiedSearch({
      query: searchQuery,
      searchType: searchType === 'ingredient' ? 'ingredient' : 'brand',
      sources: ['DPD'],
      limit: SEARCH_LIMITS.WATCHLIST,
      // Pass route/form filters for DPD (notification scope)
      routeNames: criteria.routeFilter || undefined,
      formNames: criteria.formFilter || undefined,
    }),

    // NOC search with route/form filters - only search if we have an ingredient name
    criteria.ingredientName
      ? searchNOCByIngredientWithFilters(
          criteria.ingredientName,
          criteria.routeFilter,
          criteria.formFilter,
          100
        )
      : Promise.resolve([]),

    // GSUR search - no route/form data available, always fetches all
    searchGSUR(searchQuery),
  ])

  // Process results
  const dpdProducts = dpdResult.status === 'fulfilled' ? dpdResult.value.products : []
  const nocEntries = nocResult.status === 'fulfilled' ? nocResult.value : []
  const gsurEntries = gsurResult.status === 'fulfilled' ? gsurResult.value : []

  // Log any errors
  if (dpdResult.status === 'rejected') {
    console.error('DPD fetch failed:', dpdResult.reason)
  }
  if (nocResult.status === 'rejected') {
    console.error('NOC fetch failed:', nocResult.reason)
  }
  if (gsurResult.status === 'rejected') {
    console.error('GSUR fetch failed:', gsurResult.reason)
  }

  // Transform to timeline events
  const dpdEvents = transformDPDToTimeline(
    dpdProducts,
    seenEntries.dpd,
    lastViewedAt,
    matchedIngredient
  )

  const nocEvents = transformNOCToTimeline(
    nocEntries,
    seenEntries.noc,
    lastViewedAt,
    matchedIngredient
  )

  const gsurEvents = transformGSURToTimeline(
    gsurEntries,
    seenEntries.gsur,
    lastViewedAt,
    matchedIngredient
  )

  // Combine and sort by date (newest first)
  const allEvents = [...dpdEvents, ...nocEvents, ...gsurEvents]
  allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Count new entries
  const newEntries = allEvents.filter(e => e.isNew).length

  return {
    events: allEvents,
    counts: {
      total: allEvents.length,
      dpd: dpdEvents.length,
      noc: nocEvents.length,
      gsur: gsurEvents.length,
      newEntries,
    },
    lastFetched: new Date().toISOString(),
  }
}

/**
 * Extract seen entry IDs from timeline events for storage
 */
export function extractSeenEntries(events: TimelineEvent[]): SeenEntries {
  const dpd: string[] = []
  const noc: number[] = []
  const gsur: string[] = []

  for (const event of events) {
    switch (event.source) {
      case 'DPD':
        if (event.din) dpd.push(event.din)
        break
      case 'NOC':
        if (event.nocNumber) noc.push(event.nocNumber)
        break
      case 'GSUR':
        gsur.push(event.id)
        break
    }
  }

  return { dpd, noc, gsur }
}

// -----------------------------------------------------------------------------
// Tabbed Data Fetcher
// -----------------------------------------------------------------------------

/**
 * Check if a DPD product is new (not seen before)
 */
function isDPDProductNew(
  product: UnifiedDrugProduct,
  lastViewedAt: string | null,
  seenDINs: string[]
): boolean {
  if (!lastViewedAt) return true
  if (seenDINs.includes(product.din)) return false

  const eventDate = product.lastUpdated || new Date().toISOString().split('T')[0]
  const eventTime = new Date(eventDate).getTime()
  const viewedTime = new Date(lastViewedAt).getTime()

  return eventTime > viewedTime
}

/**
 * Check if an NOC entry is new (not seen before)
 */
function isNOCEntryNew(
  entry: NOCSearchResult,
  lastViewedAt: string | null,
  seenNOCNumbers: number[]
): boolean {
  if (!lastViewedAt) return true
  if (seenNOCNumbers.includes(entry.nocNumber)) return false

  const eventTime = new Date(entry.nocDate).getTime()
  const viewedTime = new Date(lastViewedAt).getTime()

  return eventTime > viewedTime
}

/**
 * Check if a GSUR entry is new (not seen before)
 */
function isGSUREntryNew(
  entry: GSUREntry,
  entryId: string,
  lastViewedAt: string | null,
  seenGSURKeys: string[]
): boolean {
  if (!lastViewedAt) return true
  if (seenGSURKeys.includes(entryId)) return false

  const eventDate = `${entry.year_month_accepted}-01`
  const eventTime = new Date(eventDate).getTime()
  const viewedTime = new Date(lastViewedAt).getTime()

  return eventTime > viewedTime
}

/**
 * Fetch tabbed data for a watchlist from all three sources
 * Returns raw data per source instead of unified timeline events
 */
export async function fetchTabbedWatchlistData(
  options: TabbedFetchOptions
): Promise<TabbedWatchlistData> {
  const { criteria, lastViewedAt, seenEntries } = options

  // Determine search type and query
  const searchType = getSearchType(criteria)
  const searchQuery = getPrimarySearchQuery(criteria)

  // Return empty data if no valid search criteria
  if (searchType === 'none' || !searchQuery) {
    return {
      dpd: { products: [], count: 0, newCount: 0 },
      noc: { entries: [], count: 0, newCount: 0 },
      gsur: { entries: [], count: 0, newCount: 0 },
      lastFetched: new Date().toISOString(),
    }
  }

  // Fetch from all sources in parallel
  // Route/Form filters are notification-scope and applied server-side to DPD/NOC
  // Status filter is view-only and applied client-side in DPD tab
  const [dpdResult, nocResult, gsurResult] = await Promise.allSettled([
    // DPD search via unified search with route/form filters
    unifiedSearch({
      query: searchQuery,
      searchType: searchType === 'ingredient' ? 'ingredient' : 'brand',
      sources: ['DPD'],
      limit: SEARCH_LIMITS.WATCHLIST,
      // Pass route/form filters for DPD (notification scope)
      routeNames: criteria.routeFilter || undefined,
      formNames: criteria.formFilter || undefined,
    }),

    // NOC search with route/form filters - only search if we have an ingredient name
    criteria.ingredientName
      ? searchNOCByIngredientWithFilters(
          criteria.ingredientName,
          criteria.routeFilter,
          criteria.formFilter,
          100
        )
      : Promise.resolve([]),

    // GSUR search - no route/form data available, always fetches all
    searchGSUR(searchQuery),
  ])

  // Process DPD results
  const dpdProducts = dpdResult.status === 'fulfilled' ? dpdResult.value.products : []
  const dpdNewCount = dpdProducts.filter(p => isDPDProductNew(p, lastViewedAt, seenEntries.dpd)).length

  // Process NOC results with isNew flag
  const rawNocEntries = nocResult.status === 'fulfilled' ? nocResult.value : []
  const nocEntries = rawNocEntries.map(entry => ({
    ...entry,
    isNew: isNOCEntryNew(entry, lastViewedAt, seenEntries.noc),
  }))
  const nocNewCount = nocEntries.filter(e => e.isNew).length

  // Process GSUR results with isNew flag and id
  const rawGsurEntries = gsurResult.status === 'fulfilled' ? gsurResult.value : []
  const gsurEntries = rawGsurEntries.map(entry => {
    const id = getGSUREventId(entry)
    return {
      ...entry,
      id,
      isNew: isGSUREntryNew(entry, id, lastViewedAt, seenEntries.gsur),
    }
  })
  const gsurNewCount = gsurEntries.filter(e => e.isNew).length

  // Log any errors
  if (dpdResult.status === 'rejected') {
    console.error('DPD fetch failed:', dpdResult.reason)
  }
  if (nocResult.status === 'rejected') {
    console.error('NOC fetch failed:', nocResult.reason)
  }
  if (gsurResult.status === 'rejected') {
    console.error('GSUR fetch failed:', gsurResult.reason)
  }

  return {
    dpd: {
      products: dpdProducts,
      count: dpdProducts.length,
      newCount: dpdNewCount,
    },
    noc: {
      entries: nocEntries,
      count: nocEntries.length,
      newCount: nocNewCount,
    },
    gsur: {
      entries: gsurEntries,
      count: gsurEntries.length,
      newCount: gsurNewCount,
    },
    lastFetched: new Date().toISOString(),
  }
}

/**
 * Extract seen entry IDs from tabbed data for storage
 */
export function extractSeenEntriesFromTabbed(data: TabbedWatchlistData): SeenEntries {
  return {
    dpd: data.dpd.products.map(p => p.din),
    noc: data.noc.entries.map(e => e.nocNumber),
    gsur: data.gsur.entries.map(e => e.id),
  }
}
