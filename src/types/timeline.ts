// =============================================================================
// Timeline Types
// =============================================================================
// Types for the unified watchlist timeline view showing events from
// DPD, NOC, and GSUR data sources

// -----------------------------------------------------------------------------
// Source & Event Types
// -----------------------------------------------------------------------------

/** Data sources that can appear in the timeline */
export type TimelineEventSource = 'DPD' | 'NOC' | 'GSUR'

/** Types of events that can appear in the timeline */
export type TimelineEventType =
  // DPD events
  | 'dpd_status_change'
  | 'dpd_new_product'
  // NOC events
  | 'noc_approval'
  | 'noc_supplement'
  // GSUR events
  | 'gsur_filing'

/** Categories for visual styling */
export type TimelineEventCategory = 'approval' | 'filing' | 'status_change' | 'supplement'

// -----------------------------------------------------------------------------
// Timeline Event
// -----------------------------------------------------------------------------

/** A single event in the timeline */
export interface TimelineEvent {
  /** Unique identifier for this event */
  id: string

  /** Which data source this event came from */
  source: TimelineEventSource

  /** Type of event for categorization */
  eventType: TimelineEventType

  /** Date of the event (ISO string) */
  date: string

  /** Primary display text */
  title: string

  /** Secondary display text */
  subtitle: string

  /** Additional context/details */
  description: string

  // Source-specific identifiers (for linking to details)
  /** Drug Identification Number (DPD) */
  din?: string
  /** NOC number */
  nocNumber?: number
  /** Drug code from DPD */
  drugCode?: number

  /** The ingredient that matched the watchlist criteria */
  matchedIngredient?: string

  /** Company/manufacturer name */
  companyName?: string

  /** True if this entry is new (not seen before) */
  isNew: boolean

  /** Category for styling purposes */
  category: TimelineEventCategory
}

// -----------------------------------------------------------------------------
// Timeline Data
// -----------------------------------------------------------------------------

/** Counts by source for display */
export interface TimelineCounts {
  total: number
  dpd: number
  noc: number
  gsur: number
  newEntries: number
}

/** Complete timeline data returned from fetch */
export interface TimelineData {
  /** All timeline events, sorted by date descending */
  events: TimelineEvent[]

  /** Counts by source */
  counts: TimelineCounts

  /** When this data was fetched */
  lastFetched: string
}

// -----------------------------------------------------------------------------
// Utility Types
// -----------------------------------------------------------------------------

/** Filter options for the timeline view */
export type TimelineSourceFilter = 'all' | TimelineEventSource

/** Props for timeline filter controls */
export interface TimelineFilterProps {
  sourceFilter: TimelineSourceFilter
  showOnlyNew: boolean
  counts: TimelineCounts
  onSourceFilterChange: (filter: TimelineSourceFilter) => void
  onShowOnlyNewChange: (show: boolean) => void
}
