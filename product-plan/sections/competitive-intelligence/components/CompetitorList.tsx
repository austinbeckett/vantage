import { Building2, TrendingUp, Package, ChevronRight } from 'lucide-react'
import type { Competitor } from '../types'

interface CompetitorListProps {
  competitors: Competitor[]
  onSelectCompetitor?: (competitorId: string) => void
  maxItems?: number
}

export function CompetitorList({
  competitors,
  onSelectCompetitor,
  maxItems = 5,
}: CompetitorListProps) {
  const displayCompetitors = competitors.slice(0, maxItems)

  return (
    <div className="space-y-2">
      {displayCompetitors.map((competitor, index) => (
        <div
          key={competitor.id}
          className="group flex items-center gap-4 p-4 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 border border-transparent hover:border-primary-200/50 dark:hover:border-primary-700/30 transition-all cursor-pointer"
          onClick={() => onSelectCompetitor?.(competitor.id)}
        >
          {/* Rank indicator */}
          <div className="w-8 h-8 rounded-lg bg-neutral-200/50 dark:bg-neutral-700/50 flex items-center justify-center text-sm font-bold text-neutral-500 dark:text-neutral-400">
            {index + 1}
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {competitor.name}
              </p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {competitor.headquarters}
            </p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Package className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {competitor.marketedProducts}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Products
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp className="w-3.5 h-3.5 text-secondary-500" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {competitor.recentApprovals}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Approvals
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                {competitor.marketShare}%
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Share
              </p>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
