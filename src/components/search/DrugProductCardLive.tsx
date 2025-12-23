// =============================================================================
// Drug Product Card (Live API Version)
// =============================================================================
// Displays product data from Health Canada API

import { Plus, History, ChevronDown, ChevronUp } from 'lucide-react'
import type { UnifiedDrugProduct } from '../../lib/api/dpd/transformers'

interface ActiveFilter {
  type: 'ingredient' | 'manufacturer' | 'route' | 'form' | 'status'
  value: string
  label: string
}

interface DrugProductCardLiveProps {
  product: UnifiedDrugProduct
  isExpanded?: boolean
  relatedProducts?: UnifiedDrugProduct[]
  onExpand?: () => void
  onCollapse?: () => void
  onAttributeSelect?: (filter: ActiveFilter) => void
  onAddToWatchlist?: () => void
  onViewHistory?: () => void
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  active: {
    bg: 'bg-secondary-500/10 dark:bg-secondary-400/10',
    text: 'text-secondary-700 dark:text-secondary-300',
    dot: 'bg-secondary-500',
  },
  inactive: {
    bg: 'bg-neutral-500/10 dark:bg-neutral-400/10',
    text: 'text-neutral-600 dark:text-neutral-400',
    dot: 'bg-neutral-400',
  },
  pending: {
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
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

function formatIngredientWithStrength(
  ingredient: UnifiedDrugProduct['activeIngredients'][0]
): string {
  if (ingredient.strength && ingredient.strengthUnit) {
    return `${ingredient.name} ${ingredient.strength} ${ingredient.strengthUnit}`
  }
  return ingredient.name
}

export function DrugProductCardLive({
  product,
  isExpanded,
  relatedProducts = [],
  onExpand,
  onCollapse,
  onAttributeSelect,
  onAddToWatchlist,
  onViewHistory,
}: DrugProductCardLiveProps) {
  const statusStyle = statusStyles[product.statusCategory] ?? statusStyles.inactive

  const handleAttributeClick = (
    type: ActiveFilter['type'],
    value: string,
    label: string
  ) => {
    onAttributeSelect?.({ type, value, label })
  }

  const primaryIngredient = product.activeIngredients[0]
  const primaryRoute = product.routes[0]
  const primaryForm = product.forms[0]

  return (
    <div
      className={`
        group relative
        bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        rounded-2xl
        shadow-sm hover:shadow-lg
        transition-all duration-300
        ${isExpanded ? 'ring-2 ring-primary-500/30' : ''}
      `}
    >
      {/* Main content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {product.brandName}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                DIN: {product.din}
              </span>
              {primaryIngredient && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatIngredientWithStrength(primaryIngredient)}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {product.statusName}
          </div>
        </div>

        {/* Quick info grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-sm">
            <span className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
              Ingredient
            </span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {primaryIngredient?.name ?? 'N/A'}
            </p>
          </div>
          <div className="text-sm">
            <span className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
              Manufacturer
            </span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {product.companyName}
            </p>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Updated {formatDate(product.lastUpdated)}
          </span>

          <button
            onClick={isExpanded ? onCollapse : onExpand}
            className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {isExpanded ? (
              <>
                Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                More <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-5 space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Clickable attributes */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Click to filter by attribute
            </h4>
            <div className="flex flex-wrap gap-2">
              {primaryIngredient && (
                <button
                  onClick={() =>
                    handleAttributeClick(
                      'ingredient',
                      primaryIngredient.name,
                      primaryIngredient.name
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20 hover:bg-primary-500/20 hover:border-primary-500/40 transition-all hover:shadow-sm hover:shadow-primary-500/20"
                >
                  {primaryIngredient.name}
                </button>
              )}
              <button
                onClick={() =>
                  handleAttributeClick(
                    'manufacturer',
                    product.companyName,
                    product.companyName
                  )
                }
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary-500/10 text-secondary-700 dark:text-secondary-300 border border-secondary-500/20 hover:bg-secondary-500/20 hover:border-secondary-500/40 transition-all hover:shadow-sm hover:shadow-secondary-500/20"
              >
                {product.companyName}
              </button>
              {primaryRoute && (
                <button
                  onClick={() =>
                    handleAttributeClick('route', primaryRoute.name, primaryRoute.name)
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all hover:shadow-sm hover:shadow-sky-500/20"
                >
                  {primaryRoute.name}
                </button>
              )}
              {primaryForm && (
                <button
                  onClick={() =>
                    handleAttributeClick('form', primaryForm.name, primaryForm.name)
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all hover:shadow-sm hover:shadow-violet-500/20"
                >
                  {primaryForm.name}
                </button>
              )}
            </div>
          </div>

          {/* All Active Ingredients */}
          {product.activeIngredients.length > 1 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                All Active Ingredients ({product.activeIngredients.length})
              </h4>
              <div className="space-y-1">
                {product.activeIngredients.map((ai, idx) => (
                  <div key={idx} className="text-sm text-neutral-700 dark:text-neutral-300">
                    {formatIngredientWithStrength(ai)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Therapeutic Classification */}
          {(product.atcCode || product.atcDescription) && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Therapeutic Classification
              </h4>
              <div className="text-sm">
                {product.atcCode && (
                  <span className="font-mono text-neutral-600 dark:text-neutral-400 mr-2">
                    {product.atcCode}
                  </span>
                )}
                {product.atcDescription && (
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {product.atcDescription}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Schedules */}
          {product.schedules.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Schedule
              </h4>
              <div className="flex flex-wrap gap-1">
                {product.schedules.map((schedule, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  >
                    {schedule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {product.statusHistory.length > 1 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                Status History
              </h4>
              <div className="space-y-2">
                {product.statusHistory.slice(0, 5).map((status, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                      status.isCurrent
                        ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
                        : 'bg-neutral-50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span>Status Code: {status.status}</span>
                    <span className="text-xs">{formatDate(status.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                Related Products ({relatedProducts.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {relatedProducts.slice(0, 3).map(related => (
                  <span
                    key={related.drugCode}
                    className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  >
                    {related.brandName}
                  </span>
                ))}
                {relatedProducts.length > 3 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                    +{relatedProducts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onAddToWatchlist}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium shadow-sm hover:shadow-md hover:shadow-primary-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add to Watchlist
            </button>
            <button
              onClick={onViewHistory}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
            >
              <History className="w-4 h-4" />
              Full History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
