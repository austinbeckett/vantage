import { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import type {
  TrendData,
  TimeRangeOption,
} from '../../types/competitive-intelligence'

interface TrendAnalysisProps {
  trendData: TrendData
  timeRangeOptions: TimeRangeOption[]
  therapeuticAreaOptions: string[]
  onTimeRangeChange?: (range: string) => void
  onTherapeuticAreaChange?: (area: string | null) => void
}

const chartColors = {
  approvals: '#6b8455',
  submissions: '#de7356',
}

const areaColors = [
  '#de7356',
  '#6b8455',
  '#fb923c',
  '#14b8a6',
  '#f6b5a3',
  '#84cc16',
  '#b8b3a4',
]

export function TrendAnalysis({
  trendData,
  timeRangeOptions,
  therapeuticAreaOptions,
  onTimeRangeChange,
  onTherapeuticAreaChange,
}: TrendAnalysisProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1yr')
  const [selectedTherapeuticArea, setSelectedTherapeuticArea] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    let monthsToShow = 12
    if (selectedTimeRange === '3yr') monthsToShow = 36
    else if (selectedTimeRange === '5yr') monthsToShow = 60
    else if (selectedTimeRange === 'all') monthsToShow = trendData.approvalsByMonth.length

    const approvals = trendData.approvalsByMonth.slice(-monthsToShow)
    const submissions = trendData.submissionsByMonth.slice(-monthsToShow)

    return { approvals, submissions }
  }, [selectedTimeRange, trendData])

  const stats = useMemo(() => {
    const approvals = filteredData.approvals
    const submissions = filteredData.submissions

    const totalApprovals = approvals.reduce((sum, m) => sum + m.count, 0)
    const totalSubmissions = submissions.reduce((sum, m) => sum + m.count, 0)
    const avgApprovals = Math.round(totalApprovals / approvals.length)
    const avgSubmissions = Math.round(totalSubmissions / submissions.length)

    const recentApprovals = approvals.slice(-3).reduce((sum, m) => sum + m.count, 0)
    const previousApprovals = approvals.slice(-6, -3).reduce((sum, m) => sum + m.count, 0)
    const approvalTrend = previousApprovals > 0
      ? Math.round(((recentApprovals - previousApprovals) / previousApprovals) * 100)
      : 0

    const recentSubmissions = submissions.slice(-3).reduce((sum, m) => sum + m.count, 0)
    const previousSubmissions = submissions.slice(-6, -3).reduce((sum, m) => sum + m.count, 0)
    const submissionTrend = previousSubmissions > 0
      ? Math.round(((recentSubmissions - previousSubmissions) / previousSubmissions) * 100)
      : 0

    return {
      totalApprovals,
      totalSubmissions,
      avgApprovals,
      avgSubmissions,
      approvalTrend,
      submissionTrend,
    }
  }, [filteredData])

  const maxMonthlyValue = useMemo(() => {
    const allCounts = [
      ...filteredData.approvals.map((m) => m.count),
      ...filteredData.submissions.map((m) => m.count),
    ]
    return Math.max(...allCounts)
  }, [filteredData])

  const therapeuticAreaData = useMemo(() => {
    if (selectedTherapeuticArea) {
      return trendData.approvalsByTherapeuticArea.filter(
        (item) => item.area === selectedTherapeuticArea
      )
    }
    return trendData.approvalsByTherapeuticArea
  }, [selectedTherapeuticArea, trendData.approvalsByTherapeuticArea])

  const maxAreaValue = useMemo(() => {
    const values: number[] = []
    therapeuticAreaData.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        if (key !== 'area' && typeof value === 'number') {
          values.push(value)
        }
      })
    })
    return Math.max(...values, 1)
  }, [therapeuticAreaData])

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
    onTimeRangeChange?.(range)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          Trend Analysis
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Historical patterns in regulatory submissions and approvals
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <Filter className="w-4 h-4 text-neutral-400" />

        <select
          value={selectedTimeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
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
          className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
        >
          <option value="">All Therapeutic Areas</option>
          {therapeuticAreaOptions.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Approvals"
          value={stats.totalApprovals}
          trend={stats.approvalTrend}
          color="emerald"
        />
        <StatCard
          label="Avg/Month"
          value={stats.avgApprovals}
          subtitle="approvals"
          color="emerald"
        />
        <StatCard
          label="Total Submissions"
          value={stats.totalSubmissions}
          trend={stats.submissionTrend}
          color="amber"
        />
        <StatCard
          label="Avg/Month"
          value={stats.avgSubmissions}
          subtitle="submissions"
          color="amber"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Approvals & Submissions Over Time
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.approvals }} />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Approvals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.submissions }} />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Submissions</span>
            </div>
          </div>
        </div>

        <div className="h-64 relative">
          <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-neutral-400">
            <span>{maxMonthlyValue}</span>
            <span>{Math.round(maxMonthlyValue / 2)}</span>
            <span>0</span>
          </div>

          <div className="ml-10 h-full pb-8 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-neutral-200 dark:border-neutral-700" />
              <div className="border-b border-neutral-200 dark:border-neutral-700" />
              <div className="border-b border-neutral-200 dark:border-neutral-700" />
            </div>

            <div className="absolute inset-0 flex items-end gap-1 pb-6">
              {filteredData.approvals.map((approval, index) => {
                const submission = filteredData.submissions[index]
                const approvalHeight = (approval.count / maxMonthlyValue) * 100
                const submissionHeight = (submission.count / maxMonthlyValue) * 100

                return (
                  <div
                    key={approval.month}
                    className="flex-1 flex gap-px items-end h-full group relative"
                  >
                    <div
                      className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                      style={{
                        height: `${approvalHeight}%`,
                        backgroundColor: chartColors.approvals,
                      }}
                    />
                    <div
                      className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                      style={{
                        height: `${submissionHeight}%`,
                        backgroundColor: chartColors.submissions,
                      }}
                    />

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <p className="font-medium">{formatMonth(approval.month)}</p>
                      <p>Approvals: {approval.count}</p>
                      <p>Submissions: {submission.count}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-neutral-400">
              {filteredData.approvals
                .filter((_, i) => i % Math.ceil(filteredData.approvals.length / 6) === 0)
                .map((m) => (
                  <span key={m.month}>{formatMonth(m.month)}</span>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Approvals by Therapeutic Area
          </h2>
        </div>

        <div className="space-y-4">
          {therapeuticAreaData.map((item) => {
            const years = Object.keys(item).filter((k) => k !== 'area')

            return (
              <div key={item.area}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {item.area}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {years.map((year) => (
                      <span key={year}>
                        {year}: <span className="font-semibold">{item[year]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1">
                  {years.map((year, yearIndex) => {
                    const value = item[year] as number
                    const width = (value / maxAreaValue) * 100

                    return (
                      <div
                        key={year}
                        className="h-6 rounded-sm transition-all hover:opacity-80 flex items-center justify-end pr-2"
                        style={{
                          width: `${width}%`,
                          minWidth: value > 0 ? '24px' : '0',
                          backgroundColor: areaColors[yearIndex % areaColors.length],
                        }}
                      >
                        {width > 15 && (
                          <span className="text-xs font-medium text-white/90">
                            {value}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {['2022', '2023', '2024'].map((year, index) => (
            <div key={year} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: areaColors[index] }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{year}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/40 dark:to-primary-900/20 border border-primary-200/50 dark:border-primary-700/30">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Key Insights
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InsightCard
            title="Approval Velocity"
            description={`Approvals are ${stats.approvalTrend >= 0 ? 'up' : 'down'} ${Math.abs(stats.approvalTrend)}% compared to the previous quarter, with an average of ${stats.avgApprovals} approvals per month.`}
            trend={stats.approvalTrend >= 0 ? 'up' : 'down'}
          />
          <InsightCard
            title="Submission Activity"
            description={`Submission volume is ${stats.submissionTrend >= 0 ? 'increasing' : 'decreasing'} with ${Math.abs(stats.submissionTrend)}% change. Current average is ${stats.avgSubmissions} submissions per month.`}
            trend={stats.submissionTrend >= 0 ? 'up' : 'down'}
          />
          <InsightCard
            title="Top Growing Area"
            description="Antidiabetic products show the strongest year-over-year growth, driven by new SGLT2 inhibitors and GLP-1 receptor agonists."
            trend="up"
          />
          <InsightCard
            title="Market Opportunity"
            description="Immunology and Oncology segments show accelerating approval rates, indicating expanded biosimilar competition."
            trend="up"
          />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  trend?: number
  subtitle?: string
  color: 'emerald' | 'amber'
}

function StatCard({ label, value, trend, subtitle, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'text-secondary-600 dark:text-secondary-400',
    amber: 'text-primary-600 dark:text-primary-400',
  }

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value.toLocaleString()}
        </p>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-sm font-medium ${
              trend >= 0
                ? 'text-secondary-600 dark:text-secondary-400'
                : 'text-error-600 dark:text-error-400'
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
        {subtitle && (
          <span className="text-sm text-neutral-400 dark:text-neutral-500 mb-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

interface InsightCardProps {
  title: string
  description: string
  trend: 'up' | 'down'
}

function InsightCard({ title, description, trend }: InsightCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-primary-200/30 dark:border-primary-700/20">
      <div className="flex items-center gap-2 mb-2">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-secondary-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-error-500" />
        )}
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
