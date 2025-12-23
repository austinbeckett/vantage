import { Plus, History, ChevronDown, ChevronUp } from 'lucide-react'
import type {
  DrugProduct,
  ActiveIngredient,
  Manufacturer,
  RouteOfAdministration,
  DosageForm,
  ProductStatus,
  ActiveFilter
} from '../types'
import { RegulatoryTimeline } from './RegulatoryTimeline'

interface DrugProductRowProps {
  product: DrugProduct
  activeIngredient: ActiveIngredient
  manufacturer: Manufacturer
  route: RouteOfAdministration
  dosageForm: DosageForm
  status: ProductStatus
  isExpanded?: boolean
  relatedProducts?: DrugProduct[]
  onExpand?: () => void
  onCollapse?: () => void
  onAttributeSelect?: (filter: ActiveFilter) => void
  onAddToWatchlist?: () => void
  onViewHistory?: () => void
}

const statusStyles: Record<ProductStatus['name'], { bg: string; text: string; dot: string }> = {
  Approved: {
    bg: 'bg-secondary-500/10 dark:bg-secondary-400/10',
    text: 'text-secondary-700 dark:text-secondary-300',
    dot: 'bg-secondary-500'
  },
  Marketed: {
    bg: 'bg-sky-500/10 dark:bg-sky-400/10',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500'
  },
  Discontinued: {
    bg: 'bg-neutral-500/10 dark:bg-neutral-400/10',
    text: 'text-neutral-600 dark:text-neutral-400',
    dot: 'bg-neutral-400'
  },
  Expired: {
    bg: 'bg-rose-500/10 dark:bg-rose-400/10',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function DrugProductRow({
  product,
  activeIngredient,
  manufacturer,
  route,
  dosageForm,
  status,
  isExpanded,
  relatedProducts = [],
  onExpand,
  onCollapse,
  onAttributeSelect,
  onAddToWatchlist,
  onViewHistory
}: DrugProductRowProps) {
  const statusStyle = statusStyles[status.name]

  const handleAttributeClick = (type: ActiveFilter['type'], id: string, label: string) => {
    onAttributeSelect?.({ type, id, label })
  }

  return (
    <div
      className={`
        group
        bg-white dark:bg-neutral-800
        hover:bg-white dark:hover:bg-neutral-800
        
        border-b border-neutral-200 dark:border-neutral-700
        transition-all duration-200
        ${isExpanded ? 'bg-white dark:bg-neutral-800 shadow-sm' : ''}
      `}
    >
      {/* Main row content */}
      <div
        className="grid grid-cols-[1fr,140px,140px,100px,100px,100px,44px] gap-4 items-center px-5 py-4 cursor-pointer"
        onClick={isExpanded ? onCollapse : onExpand}
      >
        {/* Product name & DIN */}
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {product.productName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {product.din}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {product.strength}
            </span>
          </div>
        </div>

        {/* Active Ingredient */}
        <div className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
          {activeIngredient.name}
        </div>

        {/* Manufacturer */}
        <div className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
          {manufacturer.name}
        </div>

        {/* Route */}
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {route.abbreviation}
        </div>

        {/* Status */}
        <div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {status.name}
          </span>
        </div>

        {/* Date */}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {formatDate(product.lastUpdated)}
        </div>

        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            isExpanded ? onCollapse?.() : onExpand?.()
          }}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-5 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/50 space-y-5">
            {/* Clickable attributes */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                Click to filter by attribute
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAttributeClick('activeIngredient', activeIngredient.id, activeIngredient.name)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20 hover:bg-primary-500/20 hover:border-primary-500/40 transition-all hover:shadow-sm hover:shadow-primary-500/20"
                >
                  {activeIngredient.name}
                </button>
                <button
                  onClick={() => handleAttributeClick('manufacturer', manufacturer.id, manufacturer.name)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary-500/10 text-secondary-700 dark:text-secondary-300 border border-secondary-500/20 hover:bg-secondary-500/20 hover:border-secondary-500/40 transition-all hover:shadow-sm hover:shadow-secondary-500/20"
                >
                  {manufacturer.name}
                </button>
                <button
                  onClick={() => handleAttributeClick('route', route.id, route.name)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all hover:shadow-sm hover:shadow-sky-500/20"
                >
                  {route.abbreviation} ({route.name})
                </button>
                <button
                  onClick={() => handleAttributeClick('dosageForm', dosageForm.id, dosageForm.name)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all hover:shadow-sm hover:shadow-violet-500/20"
                >
                  {dosageForm.name}
                </button>
              </div>
            </div>

            {/* Regulatory Timeline */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                Regulatory Timeline
              </h4>
              <RegulatoryTimeline events={product.regulatoryTimeline} />
            </div>

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  Related Products ({relatedProducts.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedProducts.slice(0, 5).map(related => (
                    <span
                      key={related.id}
                      className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                    >
                      {related.productName}
                    </span>
                  ))}
                  {relatedProducts.length > 5 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400">
                      +{relatedProducts.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onAddToWatchlist}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium shadow-sm hover:shadow-md hover:shadow-primary-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add to Watchlist
              </button>
              <button
                onClick={onViewHistory}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                <History className="w-4 h-4" />
                Full History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
