// =============================================================================
// NOC Tab Content
// =============================================================================
// Displays Notice of Compliance results in a watchlist tabbed view

import { useState } from 'react'
import { FileCheck, Award, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import type { NOCSearchResult } from '../../../lib/api/noc'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface NOCEntry extends NOCSearchResult {
  isNew: boolean
}

interface NOCTabContentProps {
  entries: NOCEntry[]
  isLoading: boolean
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

// -----------------------------------------------------------------------------
// NOC Card Component
// -----------------------------------------------------------------------------

function NOCCard({ entry }: { entry: NOCEntry }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const brandName = entry.brandNames.length > 0 ? entry.brandNames[0] : `NOC #${entry.nocNumber}`
  const typeLabel = entry.isSupplement ? 'Supplement' : 'New Drug'
  const typeStyle = entry.isSupplement
    ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
    : 'bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300'

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden hover:border-mint-300 dark:hover:border-mint-600 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {brandName}
              </h4>
              {entry.isNew && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500 text-white">
                  <Sparkles className="w-2.5 h-2.5" />
                  NEW
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              {entry.manufacturer}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${typeStyle}`}>
            <Award className="w-3 h-3" />
            {typeLabel}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">NOC Number</span>
            <p className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
              {entry.nocNumber}
            </p>
          </div>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">Approval Date</span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatDate(entry.nocDate)}
            </p>
          </div>
        </div>

        {/* Therapeutic Class */}
        {entry.therapeuticClass && (
          <div className="mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">Therapeutic Class</span>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
              {entry.therapeuticClass}
            </p>
          </div>
        )}

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          {isExpanded ? (
            <>Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>More <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-3 bg-neutral-50 dark:bg-neutral-800/50">
          {/* Submission Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Submission Type
              </span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                {entry.submissionType || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Submission Class
              </span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                {entry.submissionClass || 'N/A'}
              </p>
            </div>
          </div>

          {/* Matched Ingredients */}
          {entry.matchedIngredients.length > 0 && (
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Active Ingredients
              </span>
              <div className="mt-1 space-y-1">
                {entry.matchedIngredients.map((ingredient, idx) => (
                  <p key={idx} className="text-sm text-neutral-700 dark:text-neutral-300">
                    {ingredient.name} {ingredient.strength}{ingredient.unit}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* DINs */}
          {entry.dins.length > 0 && (
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Associated DINs
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {entry.dins.slice(0, 5).map((din, idx) => (
                  <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                    {din}
                  </span>
                ))}
                {entry.dins.length > 5 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-500">
                    +{entry.dins.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Supplement/Submission Reason */}
          {(entry.reasonSupplement || entry.reasonSubmission) && (
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {entry.isSupplement ? 'Reason for Supplement' : 'Reason for Submission'}
              </span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                {entry.reasonSupplement || entry.reasonSubmission}
              </p>
            </div>
          )}

          {/* NOC with Conditions */}
          {entry.isNOCWithConditions && (
            <div className="flex items-center gap-2 text-sm text-tan-700 dark:text-tan-300 bg-tan-100 dark:bg-tan-900/30 px-3 py-2 rounded-lg">
              <FileCheck className="w-4 h-4" />
              NOC with Conditions
            </div>
          )}

          {/* Comparative Reference Product */}
          {entry.crpProductName && (
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Comparative Reference Product
              </span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                {entry.crpProductName}
                {entry.crpCompanyName && ` (${entry.crpCompanyName})`}
                {entry.crpCountryName && ` - ${entry.crpCountryName}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function NOCTabContent({ entries, isLoading }: NOCTabContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading approvals...
          </p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
          <FileCheck className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          No approvals found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
          No Notice of Compliance entries match your watchlist criteria.
        </p>
      </div>
    )
  }

  const newCount = entries.filter(e => e.isNew).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Award className="w-4 h-4" />
        <span>{entries.length} approval{entries.length !== 1 ? 's' : ''} found</span>
        {newCount > 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500 text-white">
            {newCount} new
          </span>
        )}
      </div>

      {/* NOC Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(entry => (
          <NOCCard key={entry.nocNumber} entry={entry} />
        ))}
      </div>
    </div>
  )
}
