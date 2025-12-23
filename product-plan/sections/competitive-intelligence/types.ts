// =============================================================================
// Data Types
// =============================================================================

export interface DashboardMetrics {
  totalCompetitors: number
  competitorsTracked: number
  recentSubmissions: number
  recentApprovals: number
  pendingReviews: number
  marketedProducts: number
  avgApprovalTime: number
  myCompanyRank: number
}

export interface ActivityEvent {
  id: string
  type: 'approval' | 'submission' | 'discontinuation' | 'status_change'
  manufacturer: string
  productName: string
  activeIngredient: string
  therapeuticArea: string
  description: string
  date: string
  previousStatus: string | null
  newStatus: string
}

export interface MarketShareItem {
  name: string
  value: number
  percentage: number
}

export interface PortfolioItem {
  area: string
  count: number
}

export interface CompetitorActivityItem {
  date: string
  type: 'approval' | 'submission' | 'discontinuation' | 'status_change'
  product: string
}

export interface CompetitorTimelineItem {
  date: string
  approvals: number
  submissions: number
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
  portfolioByTherapeuticArea: PortfolioItem[]
  recentActivity: CompetitorActivityItem[]
  timeline: CompetitorTimelineItem[]
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

export interface StageMetric {
  stage: 'submitted' | 'under_review' | 'noc_granted' | 'marketed'
  label: string
  avgDays: number | null
  count: number
}

export interface MonthlyCount {
  month: string
  count: number
}

export interface TherapeuticAreaTrend {
  area: string
  [year: string]: string | number
}

export interface TrendData {
  approvalsByMonth: MonthlyCount[]
  submissionsByMonth: MonthlyCount[]
  approvalsByTherapeuticArea: TherapeuticAreaTrend[]
}

export interface SavedViewFilters {
  therapeuticArea?: string
  competitors?: string[]
  timeRange?: string
  view?: string
}

export interface SavedView {
  id: string
  name: string
  description: string
  filters: SavedViewFilters
  createdAt: string
  lastAccessed: string
}

export interface TimeRangeOption {
  value: string
  label: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface CompetitiveIntelligenceProps {
  /** High-level metrics for the dashboard overview */
  dashboardMetrics: DashboardMetrics
  /** Recent regulatory activity from competitors */
  activityFeed: ActivityEvent[]
  /** Market share distribution by therapeutic area */
  marketShareByTherapeuticArea: MarketShareItem[]
  /** Market share distribution by manufacturer */
  marketShareByManufacturer: MarketShareItem[]
  /** Detailed competitor profiles */
  competitors: Competitor[]
  /** Products in the regulatory pipeline */
  pipelineItems: PipelineItem[]
  /** Metrics for each pipeline stage */
  stageMetrics: StageMetric[]
  /** Historical trend data */
  trendData: TrendData
  /** User's saved filter configurations */
  savedViews: SavedView[]
  /** Available time range filter options */
  timeRangeOptions: TimeRangeOption[]
  /** Available therapeutic area filter options */
  therapeuticAreaOptions: string[]
  /** Called when user searches for a competitor or product */
  onSearch?: (query: string) => void
  /** Called when user selects a competitor to view details */
  onSelectCompetitor?: (competitorId: string) => void
  /** Called when user selects a pipeline item to view details */
  onSelectPipelineItem?: (itemId: string) => void
  /** Called when user changes the time range filter */
  onTimeRangeChange?: (range: string) => void
  /** Called when user changes the therapeutic area filter */
  onTherapeuticAreaChange?: (area: string | null) => void
  /** Called when user saves a new view */
  onSaveView?: (name: string, filters: SavedViewFilters) => void
  /** Called when user loads a saved view */
  onLoadView?: (viewId: string) => void
  /** Called when user deletes a saved view */
  onDeleteView?: (viewId: string) => void
  /** Called when user exports data as PDF */
  onExportPdf?: () => void
  /** Called when user exports data as Excel */
  onExportExcel?: () => void
  /** Called when user clicks to compare against their company */
  onCompareWithMyCompany?: (competitorId: string) => void
}
