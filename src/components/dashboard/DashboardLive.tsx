// =============================================================================
// Dashboard (Live API Version)
// =============================================================================
// Displays real-time data from Health Canada APIs where available

import { useState, useMemo } from 'react'
import {
  Eye, Bell, TrendingUp, Database, FileCheck, Plus,
  Filter, Clock, Calendar, AlertCircle, ExternalLink,
  Loader2, RefreshCw, Info
} from 'lucide-react'
import { useGSUR, useSUR } from '../../lib/api/unified/queries'
import type { GSUREntry, SUREntry } from '../../types/health-canada-api'
import type { TimeRange } from '../../types/dashboard'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DashboardLiveProps {
  /** Number of watchlists (from local storage/context) */
  watchlistCount?: number
  /** Number of products tracked across watchlists */
  productsTracked?: number
  /** Called when user wants to navigate to search */
  onNavigateToSearch?: () => void
  /** Called when user wants to view a GSUR/SUR entry */
  onViewSubmission?: (entry: GSUREntry | SUREntry, type: 'GSUR' | 'SUR') => void
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function parseYearMonth(yearMonth: string): Date | null {
  // Format: "YYYY-MM" or variations
  const match = yearMonth.match(/(\d{4})[-/](\d{1,2})/)
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1)
  }
  return null
}

function isWithinMonths(dateStr: string, months: number): boolean {
  const date = parseYearMonth(dateStr)
  if (!date) return false

  const now = new Date()
  const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
  return monthsDiff <= months
}

function formatYearMonth(yearMonth: string): string {
  const date = parseYearMonth(yearMonth)
  if (!date) return yearMonth

  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short' })
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DashboardLive({
  watchlistCount = 0,
  productsTracked = 0,
  onNavigateToSearch,
  onViewSubmission,
}: DashboardLiveProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState<'all' | 'GSUR' | 'SUR'>('all')

  // Fetch real data from Health Canada
  const {
    data: gsurData = [],
    isLoading: gsurLoading,
    error: gsurError,
    refetch: refetchGSUR
  } = useGSUR()

  const {
    data: surData = [],
    isLoading: surLoading,
    error: surError,
    refetch: refetchSUR
  } = useSUR()

  const isLoading = gsurLoading || surLoading
  const hasError = gsurError || surError

  // Filter submissions based on time range
  const filteredSubmissions = useMemo(() => {
    const months = timeRange === '24h' ? 1 : timeRange === '7d' ? 1 : 3

    const gsurFiltered = gsurData
      .filter(entry => isWithinMonths(entry.year_month_accepted, months))
      .map(entry => ({ ...entry, _type: 'GSUR' as const }))

    const surFiltered = surData
      .filter(entry => isWithinMonths(entry.year_month_accepted, months))
      .map(entry => ({ ...entry, _type: 'SUR' as const }))

    let combined = [...gsurFiltered, ...surFiltered]

    // Apply database filter
    if (selectedDatabase === 'GSUR') {
      combined = combined.filter(item => item._type === 'GSUR')
    } else if (selectedDatabase === 'SUR') {
      combined = combined.filter(item => item._type === 'SUR')
    }

    // Sort by acceptance date (most recent first)
    return combined.sort((a, b) => {
      const dateA = parseYearMonth(a.year_month_accepted)?.getTime() || 0
      const dateB = parseYearMonth(b.year_month_accepted)?.getTime() || 0
      return dateB - dateA
    })
  }, [gsurData, surData, timeRange, selectedDatabase])

  // Calculate stats
  const stats = useMemo(() => {
    const recentGsurCount = gsurData.filter(e => isWithinMonths(e.year_month_accepted, 3)).length
    const recentSurCount = surData.filter(e => isWithinMonths(e.year_month_accepted, 3)).length

    return {
      totalWatchlists: watchlistCount,
      totalProductsTracked: productsTracked,
      totalGSUR: gsurData.length,
      totalSUR: surData.length,
      recentGSUR: recentGsurCount,
      recentSUR: recentSurCount,
      totalSubmissionsUnderReview: gsurData.length + surData.length,
    }
  }, [gsurData, surData, watchlistCount, productsTracked])

  // Get unique therapeutic areas for the sidebar
  const therapeuticAreas = useMemo(() => {
    const areas = new Map<string, number>()

    gsurData.forEach(entry => {
      const area = entry.therapeutic_area || 'Unspecified'
      areas.set(area, (areas.get(area) || 0) + 1)
    })

    surData.forEach(entry => {
      const area = entry.therapeutic_area || 'Unspecified'
      areas.set(area, (areas.get(area) || 0) + 1)
    })

    return Array.from(areas.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [gsurData, surData])

  const handleRefresh = () => {
    refetchGSUR()
    refetchSUR()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Real-time regulatory submissions from Health Canada
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Watchlists */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalWatchlists}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Watchlists
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Under Review */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalSubmissionsUnderReview}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Under review
              </div>
            </div>
          </div>
        </div>

        {/* GSUR Submissions */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalGSUR}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                GSUR entries
              </div>
            </div>
          </div>
        </div>

        {/* SUR Submissions */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-azure-100 dark:bg-azure-900/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-azure-600 dark:text-azure-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalSUR}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                SUR entries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Activity Mini Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg">
          <span className="text-xs font-medium text-lavender-700 dark:text-lavender-300">GSUR</span>
          <span className="text-xs text-lavender-600 dark:text-lavender-400">
            {stats.recentGSUR} recent (3mo)
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-azure-50 dark:bg-azure-900/20 rounded-lg">
          <span className="text-xs font-medium text-azure-700 dark:text-azure-300">SUR</span>
          <span className="text-xs text-azure-600 dark:text-azure-400">
            {stats.recentSUR} recent (3mo)
          </span>
        </div>
        <button
          onClick={onNavigateToSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
        >
          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
            Search DPD
          </span>
          <ExternalLink className="w-3 h-3 text-primary-600 dark:text-primary-400" />
        </button>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error-800 dark:text-error-200">
                Failed to load some data
              </p>
              <p className="text-xs text-error-600 dark:text-error-400 mt-1">
                {gsurError ? 'GSUR data unavailable. ' : ''}
                {surError ? 'SUR data unavailable. ' : ''}
                Using cached data if available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Feed - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold font-serif text-neutral-900 dark:text-neutral-100">
                Submissions Under Review
              </h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
                {filteredSubmissions.length} shown
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                transition-colors
                ${showFilters
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="flex items-center gap-2">
            {(['24h', '7d', '30d'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${timeRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }
                `}
              >
                {range === '24h' ? '1 Month' : range === '7d' ? '2 Months' : '3 Months'}
              </button>
            ))}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Database Source
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'GSUR', 'SUR'] as const).map(db => (
                    <button
                      key={db}
                      onClick={() => setSelectedDatabase(db)}
                      className={`
                        px-2 py-1 rounded text-xs font-medium transition-colors
                        ${selectedDatabase === db
                          ? db === 'GSUR'
                            ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
                            : db === 'SUR'
                            ? 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
                            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                        }
                      `}
                    >
                      {db === 'all' ? 'All Sources' : db}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          )}

          {/* Submission Items */}
          {!isLoading && (
            <div className="space-y-3">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <Clock className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No submissions match your filters
                  </p>
                </div>
              ) : (
                filteredSubmissions.slice(0, 15).map((item, idx) => (
                  <div
                    key={`${item._type}-${idx}`}
                    className="group relative bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Source Icon */}
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                          ${item._type === 'GSUR'
                            ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400'
                            : 'bg-azure-100 dark:bg-azure-900/30 text-azure-600 dark:text-azure-400'
                          }
                        `}>
                          {item._type === 'GSUR' ? (
                            <FileCheck className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <button
                                onClick={() => onViewSubmission?.(item, item._type)}
                                className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left"
                              >
                                {item.medicinal_ingredients}
                              </button>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                                {item._type === 'GSUR'
                                  ? `Generic submission by ${(item as GSUREntry & { _type: 'GSUR' }).company_name}`
                                  : `New drug submission by ${(item as SUREntry & { _type: 'SUR' }).company_sponsor_name}`
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                item._type === 'GSUR'
                                  ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
                                  : 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
                              }`}>
                                {item._type}
                              </span>
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Accepted: {formatYearMonth(item.year_month_accepted)}
                            </span>
                            <span>{item.therapeutic_area}</span>
                            {'submission_class' in item && item.submission_class && (
                              <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">
                                {item.submission_class}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {filteredSubmissions.length > 15 && (
                <div className="text-center py-3">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Showing 15 of {filteredSubmissions.length} submissions
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info Card */}
          <div className="p-4 bg-azure-50 dark:bg-azure-900/20 border border-azure-200 dark:border-azure-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-azure-600 dark:text-azure-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-azure-800 dark:text-azure-200">
                  Live Data Sources
                </p>
                <p className="text-xs text-azure-600 dark:text-azure-400 mt-1">
                  GSUR and SUR data is fetched directly from Health Canada.
                  DPD product searches are available in the Search page.
                </p>
              </div>
            </div>
          </div>

          {/* Therapeutic Areas */}
          <div>
            <h2 className="text-lg font-semibold font-serif text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary-500" />
              Therapeutic Areas
            </h2>

            <div className="space-y-2">
              {therapeuticAreas.map(([area, count]) => (
                <div
                  key={area}
                  className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                      {area}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full shrink-0 ml-2">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={onNavigateToSearch}
                className="w-full flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Search DPD Products
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Data Sources
            </h3>
            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-lavender-500" />
                <span>GSUR: Generic Submissions Under Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-azure-500" />
                <span>SUR: Submissions Under Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-500" />
                <span>DPD: Drug Product Database (via Search)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
