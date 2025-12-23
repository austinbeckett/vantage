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
  dashboardMetrics: DashboardMetrics
  activityFeed: ActivityEvent[]
  marketShareByTherapeuticArea: MarketShareItem[]
  marketShareByManufacturer: MarketShareItem[]
  competitors: Competitor[]
  pipelineItems: PipelineItem[]
  stageMetrics: StageMetric[]
  trendData: TrendData
  savedViews: SavedView[]
  timeRangeOptions: TimeRangeOption[]
  therapeuticAreaOptions: string[]
  onSearch?: (query: string) => void
  onSelectCompetitor?: (competitorId: string) => void
  onSelectPipelineItem?: (itemId: string) => void
  onTimeRangeChange?: (range: string) => void
  onTherapeuticAreaChange?: (area: string | null) => void
  onSaveView?: (name: string, filters: SavedViewFilters) => void
  onLoadView?: (viewId: string) => void
  onDeleteView?: (viewId: string) => void
  onExportPdf?: () => void
  onExportExcel?: () => void
  onCompareWithMyCompany?: (competitorId: string) => void
}
