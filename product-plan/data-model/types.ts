// =============================================================================
// Vantage Data Model Types
// =============================================================================

// -----------------------------------------------------------------------------
// Core Entities
// -----------------------------------------------------------------------------

export interface DrugProduct {
  id: string
  din: string
  brandName: string
  activeIngredientId: string
  activeIngredientName: string
  manufacturerId: string
  manufacturerName: string
  routeId: string
  routeName: string
  dosageFormId: string
  dosageFormName: string
  atcClassificationId: string
  atcCode: string
  status: ProductStatus
  statusDate: string
  submissionDate: string | null
  approvalDate: string | null
  marketedDate: string | null
  source: 'DPD' | 'NOC' | 'GSUR'
}

export type ProductStatus =
  | 'approved'
  | 'marketed'
  | 'expired'
  | 'revoked'
  | 'cancelled'
  | 'dormant'
  | 'submitted'
  | 'under_review'

export interface ActiveIngredient {
  id: string
  name: string
  strength: string | null
}

export interface Manufacturer {
  id: string
  name: string
  headquarters: string | null
}

export interface RouteOfAdministration {
  id: string
  name: string
  code: string
}

export interface DosageForm {
  id: string
  name: string
  code: string
}

export interface ATCClassification {
  id: string
  code: string
  name: string
  level: 1 | 2 | 3 | 4 | 5
}

// -----------------------------------------------------------------------------
// Watchlist Entities
// -----------------------------------------------------------------------------

export interface Watchlist {
  id: string
  userId: string
  name: string
  description: string | null
  isPaused: boolean
  matchCount: number
  recentActivityCount: number
  createdAt: string
  updatedAt: string
  items: WatchlistItem[]
}

export interface WatchlistItem {
  id: string
  watchlistId: string
  activeIngredientId: string | null
  activeIngredientName: string | null
  manufacturerId: string | null
  manufacturerName: string | null
  routeId: string | null
  routeName: string | null
  dosageFormId: string | null
  dosageFormName: string | null
  atcClassificationId: string | null
  atcCode: string | null
}

export interface Alert {
  id: string
  watchlistItemId: string
  watchlistId: string
  watchlistName: string
  drugProductId: string
  drugProduct: DrugProduct
  eventType: AlertEventType
  eventDescription: string
  isRead: boolean
  isDismissed: boolean
  createdAt: string
}

export type AlertEventType =
  | 'submission'
  | 'approval'
  | 'status_change'
  | 'discontinuation'
  | 'new_entry'

// -----------------------------------------------------------------------------
// User & Settings
// -----------------------------------------------------------------------------

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  createdAt: string
}

export interface NotificationSettings {
  emailFrequency: 'instant' | 'daily' | 'weekly' | 'none'
  quietHoursStart: string | null // "22:00"
  quietHoursEnd: string | null   // "07:00"
  notifyOnSubmissions: boolean
  notifyOnApprovals: boolean
  notifyOnStatusChanges: boolean
  notifyOnDiscontinuations: boolean
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  defaultView: 'dashboard' | 'search' | 'watchlists'
}

// -----------------------------------------------------------------------------
// Dashboard & Activity
// -----------------------------------------------------------------------------

export interface DashboardMetrics {
  totalWatchlists: number
  activeAlerts: number
  newMatchesThisWeek: number
  totalProductsTracked: number
  recentDatabaseUpdates: number
}

export interface ActivityItem {
  id: string
  type: AlertEventType
  drugProduct: DrugProduct
  watchlistId: string | null
  watchlistName: string | null
  description: string
  timestamp: string
  isRead: boolean
  source: 'DPD' | 'NOC' | 'GSUR'
}

export interface ActivityFilters {
  source: ('DPD' | 'NOC' | 'GSUR')[] | null
  watchlistId: string | null
  eventType: AlertEventType[] | null
  manufacturerId: string | null
  dateRange: {
    start: string
    end: string
  } | null
  isRead: boolean | null
}

// -----------------------------------------------------------------------------
// Search & Discovery
// -----------------------------------------------------------------------------

export interface SearchFilters {
  query: string
  activeIngredientId: string | null
  manufacturerId: string | null
  routeId: string | null
  dosageFormId: string | null
  status: ProductStatus[] | null
}

export interface SearchResults {
  items: DrugProduct[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// -----------------------------------------------------------------------------
// Competitive Intelligence
// -----------------------------------------------------------------------------

export interface CompetitorMetrics {
  totalCompetitors: number
  competitorsTracked: number
  recentSubmissions: number
  recentApprovals: number
  pendingReviews: number
  marketedProducts: number
  avgApprovalTime: number
}

export interface MarketShareItem {
  name: string
  value: number
  percentage: number
}

export interface Competitor {
  id: string
  name: string
  headquarters: string
  totalProducts: number
  marketedProducts: number
  pendingApprovals: number
  recentApprovals: number
  recentSubmissions: number
  marketShare: number
  avgApprovalTime: number
  portfolioByTherapeuticArea: { area: string; count: number }[]
  recentActivity: { date: string; type: AlertEventType; product: string }[]
  timeline: { date: string; approvals: number; submissions: number }[]
}

export interface PipelineItem {
  id: string
  productName: string
  activeIngredient: string
  manufacturer: string
  therapeuticArea: string
  stage: 'submitted' | 'under_review' | 'noc_granted' | 'marketed'
  submissionDate: string
  daysInStage: number
  predictedApprovalDate: string | null
  confidence: number | null
}

export interface TrendData {
  approvalsByMonth: { month: string; count: number }[]
  submissionsByMonth: { month: string; count: number }[]
  approvalsByTherapeuticArea: { area: string; [year: string]: string | number }[]
}

// -----------------------------------------------------------------------------
// Help
// -----------------------------------------------------------------------------

export interface HelpCategory {
  id: string
  name: string
  description: string
  icon: string
  articleCount: number
  articles: HelpArticle[]
}

export interface HelpArticle {
  id: string
  title: string
  summary: string
  content: string
  relatedArticles: string[]
}
