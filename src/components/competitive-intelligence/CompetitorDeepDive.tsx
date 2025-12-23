import { useState } from 'react'
import {
  ArrowLeft,
  MapPin,
  Package,
  TrendingUp,
  Clock,
  PieChart,
  Calendar,
  CheckCircle2,
  FileUp,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import type { Competitor } from '../../types/competitive-intelligence'

interface CompetitorDeepDiveProps {
  competitor: Competitor
  allCompetitors: Competitor[]
  onBack?: () => void
  onCompareWith?: (competitorId: string) => void
  onViewProduct?: (productName: string) => void
}

const activityIcons = {
  approval: CheckCircle2,
  submission: FileUp,
  discontinuation: CheckCircle2,
  status_change: TrendingUp,
}

const activityColors = {
  approval: 'text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-900/30',
  submission: 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30',
  discontinuation: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  status_change: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
}

const portfolioColors = [
  '#de7356',
  '#6b8455',
  '#fb923c',
  '#14b8a6',
  '#f6b5a3',
  '#84cc16',
]

export function CompetitorDeepDive({
  competitor,
  allCompetitors,
  onBack,
  onCompareWith,
  onViewProduct,
}: CompetitorDeepDiveProps) {
  const [selectedCompareId, setSelectedCompareId] = useState<string | null>(null)

  const maxPortfolioCount = Math.max(
    ...competitor.portfolioByTherapeuticArea.map((p) => p.count)
  )

  const compareCompetitor = selectedCompareId
    ? allCompetitors.find((c) => c.id === selectedCompareId)
    : null

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Overview</span>
      </button>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {competitor.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {competitor.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-neutral-500 dark:text-neutral-400">
                <MapPin className="w-4 h-4" />
                <span>{competitor.headquarters}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Compare with:
            </span>
            <select
              value={selectedCompareId || ''}
              onChange={(e) => {
                const id = e.target.value || null
                setSelectedCompareId(id)
                if (id) onCompareWith?.(id)
              }}
              className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
            >
              <option value="">Select competitor...</option>
              {allCompetitors
                .filter((c) => c.id !== competitor.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Total Products"
          value={competitor.totalProducts}
          compareValue={compareCompetitor?.totalProducts}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Marketed"
          value={competitor.marketedProducts}
          compareValue={compareCompetitor?.marketedProducts}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending Approvals"
          value={competitor.pendingApprovals}
          compareValue={compareCompetitor?.pendingApprovals}
        />
        <StatCard
          icon={<PieChart className="w-5 h-5" />}
          label="Market Share"
          value={`${competitor.marketShare}%`}
          compareValue={compareCompetitor ? `${compareCompetitor.marketShare}%` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Portfolio by Therapeutic Area
            </h2>
          </div>

          <div className="space-y-3">
            {competitor.portfolioByTherapeuticArea.map((item, index) => (
              <div key={item.area}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {item.area}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.count}
                  </span>
                </div>
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / maxPortfolioCount) * 100}%`,
                      backgroundColor: portfolioColors[index % portfolioColors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Activity
            </h2>
          </div>

          <div className="space-y-3">
            {competitor.recentActivity.map((activity, index) => {
              const Icon = activityIcons[activity.type] || TrendingUp
              const colorClass = activityColors[activity.type] || activityColors.status_change

              return (
                <button
                  key={index}
                  onClick={() => onViewProduct?.(activity.product)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                      {activity.product}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {activity.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Monthly Activity
            </h2>
          </div>

          <div className="flex items-end gap-4" style={{ height: '192px' }}>
            {competitor.timeline.map((month) => {
              const maxActivity = Math.max(
                ...competitor.timeline.map((m) => m.approvals + m.submissions)
              )
              const total = month.approvals + month.submissions
              const barHeight = (total / maxActivity) * 160

              return (
                <div key={month.date} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-lg overflow-hidden flex flex-col"
                    style={{ height: `${barHeight}px` }}
                  >
                    <div
                      className="w-full bg-secondary-500"
                      style={{ height: `${(month.approvals / total) * 100}%` }}
                    />
                    <div
                      className="w-full bg-primary-500"
                      style={{ height: `${(month.submissions / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    {month.date.split('-')[1]}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-secondary-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Approvals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Submissions</span>
            </div>
          </div>
        </div>
      </div>

      {compareCompetitor && (
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/40 dark:to-primary-900/20 border border-primary-200/50 dark:border-primary-700/30">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Comparison: {competitor.name} vs {compareCompetitor.name}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CompareMetric
              label="Avg Approval Time"
              value1={`${competitor.avgApprovalTime} mo`}
              value2={`${compareCompetitor.avgApprovalTime} mo`}
              lowerIsBetter
            />
            <CompareMetric
              label="Recent Approvals"
              value1={competitor.recentApprovals}
              value2={compareCompetitor.recentApprovals}
            />
            <CompareMetric
              label="Recent Submissions"
              value1={competitor.recentSubmissions}
              value2={compareCompetitor.recentSubmissions}
            />
            <CompareMetric
              label="Market Share"
              value1={`${competitor.marketShare}%`}
              value2={`${compareCompetitor.marketShare}%`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  compareValue?: number | string
}

function StatCard({ icon, label, value, compareValue }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
        {compareValue !== undefined && (
          <span className="text-sm text-neutral-400 dark:text-neutral-500 mb-1">
            vs {compareValue}
          </span>
        )}
      </div>
    </div>
  )
}

interface CompareMetricProps {
  label: string
  value1: number | string
  value2: number | string
  lowerIsBetter?: boolean
}

function CompareMetric({ label, value1, value2, lowerIsBetter }: CompareMetricProps) {
  const num1 = typeof value1 === 'number' ? value1 : parseFloat(value1)
  const num2 = typeof value2 === 'number' ? value2 : parseFloat(value2)

  const isValue1Better = lowerIsBetter ? num1 < num2 : num1 > num2
  const isValue2Better = lowerIsBetter ? num2 < num1 : num2 > num1

  return (
    <div className="text-center">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-lg font-bold ${
            isValue1Better
              ? 'text-secondary-600 dark:text-secondary-400'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          {value1}
        </span>
        <span className="text-neutral-300 dark:text-neutral-600">vs</span>
        <span
          className={`text-lg font-bold ${
            isValue2Better
              ? 'text-secondary-600 dark:text-secondary-400'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          {value2}
        </span>
      </div>
    </div>
  )
}
