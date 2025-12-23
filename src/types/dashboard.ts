// =============================================================================
// Dashboard Data Types
// =============================================================================

export interface DashboardStats {
  totalWatchlists: number
  activeAlerts: number
  newMatchesThisWeek: number
  totalProductsTracked: number
  recentDpdUpdates: number
  recentNocUpdates: number
  recentGsurUpdates: number
  activityTrend: number[]
}

export interface WatchlistReference {
  id: string
  name: string
}

export interface ActivityItem {
  id: string
  drugProductId: string
  drugProductName: string
  din: string
  manufacturer: string
  eventType: 'status_change' | 'noc_issued' | 'new_submission' | 'safety_update' | 'label_change'
  eventDescription: string
  database: 'DPD' | 'NOC' | 'GSUR'
  timestamp: string
  isRead: boolean
  isNew: boolean
  triggeredWatchlist: WatchlistReference | null
}

export interface UpcomingDate {
  id: string
  title: string
  description: string
  date: string
  type: 'deadline' | 'submission' | 'system'
}

export interface FilterOption {
  id: string
  name: string
  fullName?: string
}

export interface FilterOptions {
  databases: FilterOption[]
  eventTypes: FilterOption[]
  watchlists: FilterOption[]
  manufacturers: FilterOption[]
}

export type TimeRange = '24h' | '7d' | '30d'

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardProps {
  /** Key metrics and statistics */
  stats: DashboardStats
  /** Activity feed items */
  activityFeed: ActivityItem[]
  /** Upcoming regulatory dates */
  upcomingDates: UpcomingDate[]
  /** Available filter options */
  filterOptions: FilterOptions
  /** Called when user clicks to view a drug product's details */
  onViewProduct?: (productId: string) => void
  /** Called when user marks an activity item as read */
  onMarkAsRead?: (activityId: string) => void
  /** Called when user dismisses an activity item */
  onDismiss?: (activityId: string) => void
  /** Called when user wants to add a product to a watchlist */
  onAddToWatchlist?: (productId: string) => void
  /** Called when user wants to share an activity item */
  onShare?: (activityId: string) => void
  /** Called when user wants to export an activity item */
  onExport?: (activityId: string) => void
  /** Called when user clicks on a watchlist reference */
  onViewWatchlist?: (watchlistId: string) => void
}
