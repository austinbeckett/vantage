import { useState } from 'react'
import {
  Search,
  Building2,
  TrendingUp,
  Clock,
  Award,
  FileDown,
  Bookmark,
  ChevronDown,
  BarChart3,
  Activity,
  PieChart,
} from 'lucide-react'
import type { CompetitiveIntelligenceProps } from '../../types/competitive-intelligence'
import { MetricCard } from './MetricCard'
import { ActivityFeed } from './ActivityFeed'
import { MarketShareChart } from './MarketShareChart'
import { CompetitorList } from './CompetitorList'

export function CompetitiveIntelligence({
  dashboardMetrics,
  activityFeed,
  marketShareByTherapeuticArea,
  marketShareByManufacturer,
  competitors,
  savedViews,
  timeRangeOptions,
  therapeuticAreaOptions,
  onSearch,
  onSelectCompetitor,
  onTimeRangeChange,
  onTherapeuticAreaChange,
  onSaveView,
  onLoadView,
  onExportPdf,
}: CompetitiveIntelligenceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeRange, setSelectedTimeRange] = useState('1yr')
  const [selectedTherapeuticArea, setSelectedTherapeuticArea] = useState<
    string | null
  >(null)
  const [showSavedViews, setShowSavedViews] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
    onTimeRangeChange?.(range)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Competitive Intelligence
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track competitor activity and market trends across the Canadian
              pharmaceutical landscape
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSavedViews(!showSavedViews)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-300/50 dark:hover:border-primary-600/30 transition-colors text-sm font-medium"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Saved Views</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showSavedViews && (
                <div className="absolute right-0 mt-2 w-64 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl z-20">
                  {savedViews.length > 0 ? (
                    <div className="space-y-1">
                      {savedViews.map((view) => (
                        <button
                          key={view.id}
                          onClick={() => {
                            onLoadView?.(view.id)
                            setShowSavedViews(false)
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                            {view.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {view.description}
                          </p>
                        </button>
                      ))}
                      <hr className="my-2 border-neutral-200 dark:border-neutral-700" />
                      <button
                        onClick={() => {
                          onSaveView?.('New View', {
                            timeRange: selectedTimeRange,
                            therapeuticArea: selectedTherapeuticArea || undefined,
                          })
                          setShowSavedViews(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm font-medium"
                      >
                        + Save Current View
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                        No saved views yet
                      </p>
                      <button
                        onClick={() => {
                          onSaveView?.('New View', {
                            timeRange: selectedTimeRange,
                          })
                          setShowSavedViews(false)
                        }}
                        className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                      >
                        Save Current View
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onExportPdf}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-300/50 dark:hover:border-primary-600/30 transition-colors text-sm font-medium"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search competitors or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 dark:focus:border-primary-600 transition-all"
          />
        </form>

        <div className="flex gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 dark:focus:border-primary-600 transition-all cursor-pointer text-sm font-medium"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedTherapeuticArea || ''}
            onChange={(e) => {
              const value = e.target.value || null
              setSelectedTherapeuticArea(value)
              onTherapeuticAreaChange?.(value)
            }}
            className="px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 dark:focus:border-primary-600 transition-all cursor-pointer text-sm font-medium"
          >
            <option value="">All Therapeutic Areas</option>
            {therapeuticAreaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Competitors Tracked"
          value={dashboardMetrics.competitorsTracked}
          icon={<Building2 className="w-4 h-4" />}
        />
        <MetricCard
          label="Recent Approvals"
          value={dashboardMetrics.recentApprovals}
          change={12}
          changeLabel="vs. previous period"
          icon={<Award className="w-4 h-4" />}
          variant="highlight"
        />
        <MetricCard
          label="Pending Reviews"
          value={dashboardMetrics.pendingReviews}
          icon={<Clock className="w-4 h-4" />}
        />
        <MetricCard
          label="Avg. Approval Time"
          value={`${dashboardMetrics.avgApprovalTime} mo`}
          change={-5}
          changeLabel="faster than last year"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Recent Activity
                </h2>
              </div>
              <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                View All
              </button>
            </div>
            <ActivityFeed events={activityFeed} maxItems={5} />
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Top Competitors
                </h2>
              </div>
              <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                Compare All
              </button>
            </div>
            <CompetitorList
              competitors={competitors}
              onSelectCompetitor={onSelectCompetitor}
              maxItems={5}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute -top-2 -left-2 w-16 h-16 bg-primary-400/10 rounded-full blur-2xl" />
            <MarketShareChart
              data={marketShareByTherapeuticArea}
              title="Market Share by Therapeutic Area"
              onSelectSegment={(name) =>
                onTherapeuticAreaChange?.(name === 'Other' ? null : name)
              }
            />
          </div>

          <div className="relative">
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-secondary-400/10 rounded-full blur-2xl" />
            <MarketShareChart
              data={marketShareByManufacturer}
              title="Market Share by Manufacturer"
              onSelectSegment={(name) => {
                const competitor = competitors.find((c) => c.name === name)
                if (competitor) onSelectCompetitor?.(competitor.id)
              }}
            />
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-5 h-5 opacity-80" />
              <h3 className="font-semibold">Your Position</h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              #{dashboardMetrics.myCompanyRank}
            </p>
            <p className="text-primary-100 text-sm">
              in market share among tracked competitors
            </p>
            <div className="mt-4 pt-4 border-t border-primary-400/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-100">Marketed Products</span>
                <span className="font-semibold">
                  {dashboardMetrics.marketedProducts.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
