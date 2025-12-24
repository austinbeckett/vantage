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

// Status styles keyed by status code for precise styling
const statusStylesByCode: Record<number, { bg: string; text: string; dot: string; border: string }> = {
  1: { // Approved
    bg: 'bg-mint-100 dark:bg-mint-900/30',
    text: 'text-mint-700 dark:text-mint-300',
    dot: 'bg-mint-500',
    border: 'border border-mint-200 dark:border-mint-700/50',
  },
  2: { // Marketed
    bg: 'bg-secondary-100 dark:bg-secondary-900/30',
    text: 'text-secondary-700 dark:text-secondary-300',
    dot: 'bg-secondary-500',
    border: 'border border-secondary-200 dark:border-secondary-700/50',
  },
}

// Fallback styles by category
const statusStylesByCategory: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  active: {
    bg: 'bg-mint-100 dark:bg-mint-900/30',
    text: 'text-mint-700 dark:text-mint-300',
    dot: 'bg-mint-500',
    border: 'border border-mint-200 dark:border-mint-700/50',
  },
  inactive: {
    bg: 'bg-neutral-100 dark:bg-neutral-700',
    text: 'text-neutral-600 dark:text-neutral-400',
    dot: 'bg-neutral-400',
    border: 'border border-neutral-200 dark:border-neutral-600',
  },
  pending: {
    bg: 'bg-tan-100 dark:bg-tan-900/30',
    text: 'text-tan-700 dark:text-tan-300',
    dot: 'bg-tan-500',
    border: 'border border-tan-200 dark:border-tan-700/50',
  },
}

function getStatusStyle(statusCode: number, statusCategory: string) {
  // First try to get style by specific status code
  if (statusStylesByCode[statusCode]) {
    return statusStylesByCode[statusCode]
  }
  // Fall back to category-based styling
  return statusStylesByCategory[statusCategory] ?? statusStylesByCategory.inactive
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
  const statusStyle = getStatusStyle(product.statusCode, product.statusCategory)

  const handleAttributeClick = (
    type: ActiveFilter['type'],
    value: string,
    label: string
  ) => {
    onAttributeSelect?.({ type, value, label })
  }

  const primaryIngredient = product.activeIngredients[0]

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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/50 hover:bg-primary-200 dark:hover:bg-primary-900/50 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
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
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300 border border-tan-200 dark:border-tan-700/50 hover:bg-tan-200 dark:hover:bg-tan-900/50 hover:border-tan-300 dark:hover:border-tan-600 transition-all"
              >
                {product.companyName}
              </button>
              {product.routes.map((route, idx) => (
                <button
                  key={`route-${idx}`}
                  onClick={() =>
                    handleAttributeClick('route', route.name, route.name)
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300 border border-azure-200 dark:border-azure-700/50 hover:bg-azure-200 dark:hover:bg-azure-900/50 hover:border-azure-300 dark:hover:border-azure-600 transition-all"
                >
                  {route.name}
                </button>
              ))}
              {product.forms.map((form, idx) => (
                <button
                  key={`form-${idx}`}
                  onClick={() =>
                    handleAttributeClick('form', form.name, form.name)
                  }
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300 border border-lavender-200 dark:border-lavender-700/50 hover:bg-lavender-200 dark:hover:bg-lavender-900/50 hover:border-lavender-300 dark:hover:border-lavender-600 transition-all"
                >
                  {form.name}
                </button>
              ))}
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
