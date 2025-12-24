// =============================================================================
// GSUR Tab Content
// =============================================================================
// Displays Generic Submissions Under Review results in a watchlist tabbed view

import { FileSearch, Building2, Calendar, Sparkles, Beaker } from 'lucide-react'
import type { GSUREntry } from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface GSUREntryWithMeta extends GSUREntry {
  isNew: boolean
  id: string
}

interface GSURTabContentProps {
  entries: GSUREntryWithMeta[]
  isLoading: boolean
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function formatYearMonth(yearMonth: string): string {
  try {
    // yearMonth is in format YYYY-MM
    const [year, month] = yearMonth.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
    })
  } catch {
    return yearMonth
  }
}

// -----------------------------------------------------------------------------
// GSUR Card Component
// -----------------------------------------------------------------------------

function GSURCard({ entry }: { entry: GSUREntryWithMeta }) {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 hover:border-tan-300 dark:hover:border-tan-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
              {entry.medicinal_ingredients}
            </h4>
            {entry.isNew && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500 text-white shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                NEW
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300 shrink-0">
          <FileSearch className="w-3 h-3" />
          GSUR
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-2.5">
        {/* Company */}
        <div className="flex items-start gap-2">
          <Building2 className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block">Company</span>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {entry.company_name}
            </p>
          </div>
        </div>

        {/* Therapeutic Area */}
        <div className="flex items-start gap-2">
          <Beaker className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block">Therapeutic Area</span>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 line-clamp-2">
              {entry.therapeutic_area || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Acceptance Date */}
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block">Accepted</span>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {formatYearMonth(entry.year_month_accepted)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function GSURTabContent({ entries, isLoading }: GSURTabContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-tan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading generic submissions...
          </p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
          <FileSearch className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          No generic submissions found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
          No Generic Submissions Under Review match your watchlist criteria.
        </p>
      </div>
    )
  }

  const newCount = entries.filter(e => e.isNew).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <FileSearch className="w-4 h-4" />
        <span>{entries.length} submission{entries.length !== 1 ? 's' : ''} found</span>
        {newCount > 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500 text-white">
            {newCount} new
          </span>
        )}
      </div>

      {/* GSUR Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(entry => (
          <GSURCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
