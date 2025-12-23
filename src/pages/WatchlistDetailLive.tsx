// =============================================================================
// Watchlist Detail (Live API Version)
// =============================================================================
// Shows products matching a watchlist's criteria from live Health Canada API

import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Filter } from 'lucide-react'
import { useWatchlistStorage, hasValidPrimarySearch, MIN_SEARCH_LENGTH, getPrimarySearchQuery, getSearchType } from '../lib/hooks'
import { useUnifiedSearch, SEARCH_LIMITS, useProductByDIN } from '../lib/api/unified/queries'
import { DrugProductCardLive } from '../components/search/DrugProductCardLive'
import { getStatusName } from '../lib/api/status-codes'

const PRODUCTS_PER_PAGE = 50

export default function WatchlistDetailLive() {
  const { id } = useParams()
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)

  const { getWatchlist, toggleNotifications, deleteWatchlist, isLoaded } = useWatchlistStorage()
  const watchlist = id ? getWatchlist(id) : undefined

  // Determine search type based on which field was filled
  const searchTypeValue = useMemo(() => {
    if (!watchlist) return 'none'
    return getSearchType(watchlist.criteria)
  }, [watchlist])

  // Build search query from criteria - only use API-supported fields
  const searchQuery = useMemo(() => {
    if (!watchlist) return ''
    // For DIN search, the query is the DIN
    if (searchTypeValue === 'din') {
      return watchlist.criteria.din?.trim() || ''
    }
    return getPrimarySearchQuery(watchlist.criteria)
  }, [watchlist, searchTypeValue])

  // Check if watchlist has valid primary search criteria
  const hasValidSearch = watchlist ? hasValidPrimarySearch(watchlist.criteria) : false
  const isDINSearch = searchTypeValue === 'din'

  // Determine the search type for unified search (brand/ingredient/auto)
  const unifiedSearchType = useMemo((): 'brand' | 'ingredient' | 'auto' => {
    if (searchTypeValue === 'ingredient') return 'ingredient'
    if (searchTypeValue === 'brand') return 'brand'
    return 'auto'
  }, [searchTypeValue])

  // Use the unified search hook for brand/ingredient searches
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useUnifiedSearch(
    isDINSearch ? '' : searchQuery,
    hasValidSearch && !isDINSearch,
    unifiedSearchType,
    SEARCH_LIMITS.WATCHLIST
  )

  // Use the DIN search hook for DIN-based watchlists
  const {
    data: dinProduct,
    isLoading: isDINLoading,
    error: dinError,
    refetch: refetchDIN,
  } = useProductByDIN(isDINSearch && hasValidSearch ? searchQuery : null)

  // Combine loading/error states
  const isLoading = isDINSearch ? isDINLoading : isSearchLoading
  const error = isDINSearch ? dinError : searchError
  const refetch = isDINSearch ? refetchDIN : refetchSearch

  // Filter results based on post-search filter criteria (client-side only)
  const matchingProducts = useMemo(() => {
    if (!watchlist) return []

    // For DIN search, we get a single product
    if (isDINSearch) {
      return dinProduct ? [dinProduct] : []
    }

    // For brand/ingredient search, filter the results
    if (!searchResults?.products) return []

    return searchResults.products.filter(product => {
      // Route filter (exact match)
      if (watchlist.criteria.routeNameFilter) {
        const routeMatch = product.routes.some(r =>
          r.name.toLowerCase() === watchlist.criteria.routeNameFilter!.toLowerCase()
        )
        if (!routeMatch) return false
      }

      // Company filter (partial match)
      if (watchlist.criteria.companyNameFilter) {
        const companyMatch = product.companyName
          .toLowerCase()
          .includes(watchlist.criteria.companyNameFilter.toLowerCase())
        if (!companyMatch) return false
      }

      // Status filter (exact match on status code)
      if (watchlist.criteria.statusFilter !== null && watchlist.criteria.statusFilter !== undefined) {
        if (product.statusCode !== watchlist.criteria.statusFilter) return false
      }

      // Form filter (exact match)
      if (watchlist.criteria.formNameFilter) {
        const formMatch = product.forms.some(f =>
          f.name.toLowerCase() === watchlist.criteria.formNameFilter!.toLowerCase()
        )
        if (!formMatch) return false
      }

      // Class filter (partial match on className)
      if (watchlist.criteria.classFilter) {
        const classMatch = product.className
          .toLowerCase()
          .includes(watchlist.criteria.classFilter.toLowerCase())
        if (!classMatch) return false
      }

      // Schedule filter (exact match on any schedule)
      if (watchlist.criteria.scheduleFilter) {
        const scheduleMatch = product.schedules.some(s =>
          s.toLowerCase() === watchlist.criteria.scheduleFilter!.toLowerCase()
        )
        if (!scheduleMatch) return false
      }

      // ATC filter (prefix match on atcCode)
      if (watchlist.criteria.atcFilter) {
        const atcMatch = product.atcCode?.toUpperCase().startsWith(
          watchlist.criteria.atcFilter.toUpperCase()
        )
        if (!atcMatch) return false
      }

      return true
    })
  }, [searchResults, watchlist, isDINSearch, dinProduct])

  // Check if any filters are active
  const hasActiveFilters = watchlist && (
    watchlist.criteria.routeNameFilter ||
    watchlist.criteria.companyNameFilter ||
    watchlist.criteria.statusFilter !== null ||
    watchlist.criteria.formNameFilter ||
    watchlist.criteria.classFilter ||
    watchlist.criteria.scheduleFilter ||
    watchlist.criteria.atcFilter
  )

  // Pagination: only show visibleCount products at a time
  const visibleProducts = useMemo(() => {
    return matchingProducts.slice(0, visibleCount)
  }, [matchingProducts, visibleCount])

  const hasMoreProducts = matchingProducts.length > visibleCount
  const remainingCount = matchingProducts.length - visibleCount

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PRODUCTS_PER_PAGE)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!watchlist) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          Watchlist not found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          The watchlist you're looking for doesn't exist.
        </p>
        <Link
          to="/watchlists"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Watchlists
        </Link>
      </div>
    )
  }

  // Build criteria labels - separate primary search from filters
  const searchLabels: { type: string; label: string; isFilter: boolean }[] = []
  const filterLabels: { type: string; label: string; isFilter: boolean }[] = []

  // Primary search criteria (API-supported)
  if (watchlist.criteria.din) {
    searchLabels.push({ type: 'din', label: `DIN: ${watchlist.criteria.din}`, isFilter: false })
  }
  if (watchlist.criteria.searchTerm) {
    searchLabels.push({ type: 'search', label: `Product: "${watchlist.criteria.searchTerm}"`, isFilter: false })
  }
  if (watchlist.criteria.ingredientName) {
    searchLabels.push({ type: 'ingredient', label: `Ingredient: ${watchlist.criteria.ingredientName}`, isFilter: false })
  }

  // Primary filters (always visible in UI)
  if (watchlist.criteria.routeNameFilter) {
    filterLabels.push({ type: 'route', label: watchlist.criteria.routeNameFilter, isFilter: true })
  }
  if (watchlist.criteria.companyNameFilter) {
    filterLabels.push({ type: 'company', label: watchlist.criteria.companyNameFilter, isFilter: true })
  }

  // Advanced filters
  if (watchlist.criteria.statusFilter !== null && watchlist.criteria.statusFilter !== undefined) {
    filterLabels.push({ type: 'status', label: getStatusName(watchlist.criteria.statusFilter), isFilter: true })
  }
  if (watchlist.criteria.formNameFilter) {
    filterLabels.push({ type: 'form', label: watchlist.criteria.formNameFilter, isFilter: true })
  }
  if (watchlist.criteria.classFilter) {
    filterLabels.push({ type: 'class', label: watchlist.criteria.classFilter, isFilter: true })
  }
  if (watchlist.criteria.scheduleFilter) {
    filterLabels.push({ type: 'schedule', label: watchlist.criteria.scheduleFilter, isFilter: true })
  }
  if (watchlist.criteria.atcFilter) {
    filterLabels.push({ type: 'atc', label: `ATC: ${watchlist.criteria.atcFilter}`, isFilter: true })
  }

  const handleToggleNotifications = () => {
    toggleNotifications(watchlist.id)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      deleteWatchlist(watchlist.id)
      window.location.href = '/watchlists'
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/watchlists"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Watchlists</span>
        </Link>
      </div>

      {/* Watchlist Header */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {watchlist.name}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {watchlist.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
              title="Refresh results"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleToggleNotifications}
              className={`
                p-2 rounded-lg transition-colors
                ${watchlist.notificationsActive
                  ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-neutral-400 bg-neutral-100 dark:bg-neutral-800'
                }
              `}
              title={watchlist.notificationsActive ? 'Notifications on' : 'Notifications paused'}
            >
              {watchlist.notificationsActive ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>
            <Link
              to="/watchlists"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <Pencil className="w-5 h-5" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Criteria Tags */}
        {searchLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {searchLabels.map((criteria, idx) => (
              <span
                key={idx}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
                  ${criteria.type === 'din'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-mono'
                    : criteria.type === 'search'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                  }
                `}
              >
                {criteria.label}
              </span>
            ))}
          </div>
        )}

        {/* Filter Tags */}
        {filterLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Filter className="w-3 h-3" />
              Filters:
            </span>
            {filterLabels.map((criteria, idx) => {
              let colorClasses = 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              switch (criteria.type) {
                case 'route':
                  colorClasses = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                  break
                case 'company':
                  colorClasses = 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  break
                case 'status':
                  colorClasses = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  break
                case 'form':
                  colorClasses = 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  break
                case 'class':
                  colorClasses = 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                  break
                case 'schedule':
                  colorClasses = 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  break
                case 'atc':
                  colorClasses = 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-mono'
                  break
              }
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${colorClasses}`}
                >
                  {criteria.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">
              {isLoading ? '...' : matchingProducts.length}
            </strong> matching products
            {hasActiveFilters && searchResults?.products && searchResults.products.length > matchingProducts.length && (
              <span className="text-xs ml-1">
                (of {searchResults.products.length} from API)
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
            Live from Health Canada
          </span>
          <span>
            Created {new Date(watchlist.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Matching Products
        </h2>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Failed to load products
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400">
                Searching Health Canada database...
              </p>
            </div>
          </div>
        )}

        {/* Invalid Search Criteria */}
        {!isLoading && !hasValidSearch && (
          <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-400 dark:text-amber-500 mb-3" />
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Invalid Search Criteria
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              This watchlist needs a valid DIN (8 digits), or a product name or ingredient with at least {MIN_SEARCH_LENGTH} characters
              to search the Health Canada API. Edit the watchlist to add valid search criteria.
            </p>
            <Link
              to="/watchlists"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Edit Watchlist
            </Link>
          </div>
        )}

        {/* Empty Results */}
        {!isLoading && hasValidSearch && matchingProducts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400">
              No products currently match this watchlist's criteria.
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                Try removing some filters to see more results.
              </p>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && matchingProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleProducts.map(product => (
                <DrugProductCardLive
                  key={product.drugCode}
                  product={product}
                  isExpanded={expandedProductId === product.drugCode}
                  onExpand={() => setExpandedProductId(product.drugCode)}
                  onCollapse={() => setExpandedProductId(null)}
                  onAddToWatchlist={() => {
                    console.log('Add to watchlist:', product.drugCode)
                  }}
                  onViewHistory={() => {
                    console.log('View history:', product.drugCode)
                  }}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Load More ({remainingCount} remaining)
                </button>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Showing {visibleProducts.length} of {matchingProducts.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
