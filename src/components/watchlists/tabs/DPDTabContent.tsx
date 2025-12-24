// =============================================================================
// DPD Tab Content
// =============================================================================
// Displays Drug Product Database results in a watchlist tabbed view
// Supports client-side filtering with persisted filter state

import { useState, useMemo } from 'react'
import { Database, Package } from 'lucide-react'
import type { UnifiedDrugProduct } from '../../../lib/api/dpd/transformers'
import { type DPDViewFilters, DEFAULT_DPD_STATUS_FILTER } from '../../../lib/hooks/useWatchlistStorage'
import { DPDFilterPanel } from '../DPDFilterPanel'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DPDTabContentProps {
  products: UnifiedDrugProduct[]
  isLoading: boolean
  filters?: DPDViewFilters
  onFiltersChange?: (filters: DPDViewFilters) => void
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

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

// Status styles by category
const statusStylesByCategory: Record<string, { bg: string; text: string; dot: string }> = {
  active: {
    bg: 'bg-mint-100 dark:bg-mint-900/30',
    text: 'text-mint-700 dark:text-mint-300',
    dot: 'bg-mint-500',
  },
  inactive: {
    bg: 'bg-neutral-100 dark:bg-neutral-700',
    text: 'text-neutral-600 dark:text-neutral-400',
    dot: 'bg-neutral-400',
  },
  pending: {
    bg: 'bg-tan-100 dark:bg-tan-900/30',
    text: 'text-tan-700 dark:text-tan-300',
    dot: 'bg-tan-500',
  },
}

// -----------------------------------------------------------------------------
// Product Card Component
// -----------------------------------------------------------------------------

function ProductCard({ product }: { product: UnifiedDrugProduct }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusStyle = statusStylesByCategory[product.statusCategory] ?? statusStylesByCategory.inactive
  const primaryIngredient = product.activeIngredients[0]

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {product.brandName}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                DIN: {product.din}
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {product.statusName}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">Ingredient</span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {primaryIngredient?.name ?? 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">Manufacturer</span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {product.companyName}
            </p>
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-3 bg-neutral-50 dark:bg-neutral-800/50">
          {/* All Ingredients */}
          {product.activeIngredients.length > 0 && (
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Active Ingredients
              </span>
              <div className="mt-1 space-y-1">
                {product.activeIngredients.map((ai, idx) => (
                  <p key={idx} className="text-sm text-neutral-700 dark:text-neutral-300">
                    {ai.name} {ai.strength}{ai.strengthUnit}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Routes & Forms */}
          <div className="grid grid-cols-2 gap-3">
            {product.routes.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Routes
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.routes.map((route, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300">
                      {route.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.forms.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Forms
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.forms.map((form, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300">
                      {form.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ATC Classification */}
          {product.atcCode && (
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                ATC Classification
              </span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                <span className="font-mono">{product.atcCode}</span>
                {product.atcDescription && ` - ${product.atcDescription}`}
              </p>
            </div>
          )}

          {/* Last Updated */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Last updated: {formatDate(product.lastUpdated)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Client-Side Filtering (Status Only - View Filter)
// -----------------------------------------------------------------------------

/**
 * Apply view-only status filter to products
 * Route/Form filtering is now done server-side via criteria
 * Status defaults to Approved (1) + Marketed (2) if not specified
 */
function applyFilters(products: UnifiedDrugProduct[], filters: DPDViewFilters | undefined): UnifiedDrugProduct[] {
  // Get status filter - default to Approved + Marketed if not specified
  const statusFilter = filters?.statusFilter ?? DEFAULT_DPD_STATUS_FILTER

  // If no status filter (user cleared it), show all
  if (!statusFilter || statusFilter.length === 0) {
    return products
  }

  // Filter by status code
  return products.filter(p => statusFilter.includes(p.statusCode))
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function DPDTabContent({ products, isLoading, filters, onFiltersChange }: DPDTabContentProps) {
  // Apply client-side filters
  const filteredProducts = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading drug products...
          </p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          No drug products found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
          No products in the Drug Product Database match your watchlist criteria.
        </p>
      </div>
    )
  }

  const isFiltered = filteredProducts.length !== products.length

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
      {onFiltersChange && (
        <DPDFilterPanel
          filters={filters}
          onChange={onFiltersChange}
          resultCount={products.length}
          filteredCount={filteredProducts.length}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Package className="w-4 h-4" />
        <span>
          {filteredProducts.length}
          {isFiltered && ` of ${products.length}`}
          {' '}product{filteredProducts.length !== 1 ? 's' : ''}
          {isFiltered ? ' (filtered)' : ' found'}
        </span>
      </div>

      {/* No Matches After Filtering */}
      {filteredProducts.length === 0 && products.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <Database className="w-10 h-10 text-neutral-400 mb-3" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            No products match your filters
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            Try adjusting or clearing your filter criteria
          </p>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard key={product.drugCode} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
