// =============================================================================
// Watchlist Detail (Live API Version)
// =============================================================================
// Shows products matching a watchlist's criteria from live Health Canada API

import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Filter } from 'lucide-react'
import { useWatchlistStorage, hasValidPrimarySearch, MIN_SEARCH_LENGTH, getPrimarySearchQuery } from '../lib/hooks'
import { useUnifiedSearch, SEARCH_LIMITS } from '../lib/api/unified/queries'
import { DrugProductCardLive } from '../components/search/DrugProductCardLive'

const PRODUCTS_PER_PAGE = 50

export default function WatchlistDetailLive() {
  const { id } = useParams()
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)

  const { getWatchlist, toggleNotifications, deleteWatchlist, isLoaded } = useWatchlistStorage()
  const watchlist = id ? getWatchlist(id) : undefined

  // Build search query from criteria - only use API-supported fields
  // Health Canada API only supports brandname and ingredientname searches
  const searchQuery = useMemo(() => {
    if (!watchlist) return ''
    return getPrimarySearchQuery(watchlist.criteria)
  }, [watchlist])

  // Determine search type based on which field was filled
  const searchType = useMemo((): 'brand' | 'ingredient' | 'auto' => {
    if (!watchlist) return 'auto'
    // If ingredient is specified, use ingredient search
    if (watchlist.criteria.ingredientName?.trim()) {
      return 'ingredient'
    }
    // If brand/search term is specified, use brand search
    if (watchlist.criteria.searchTerm?.trim()) {
      return 'brand'
    }
    return 'auto'
  }, [watchlist])

  // Check if watchlist has valid primary search criteria
  const hasValidSearch = watchlist ? hasValidPrimarySearch(watchlist.criteria) : false

  // Use the unified search hook with the criteria, correct search type, and high limit for watchlists
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useUnifiedSearch(searchQuery, hasValidSearch, searchType, SEARCH_LIMITS.WATCHLIST)

  // Filter results based on post-search filter criteria (client-side only)
  const matchingProducts = useMemo(() => {
    if (!searchResults?.products || !watchlist) return []

    return searchResults.products.filter(product => {
      // Company filter (applied client-side - API doesn't support company search)
      if (watchlist.criteria.companyNameFilter) {
        const companyMatch = product.companyName
          .toLowerCase()
          .includes(watchlist.criteria.companyNameFilter.toLowerCase())
        if (!companyMatch) return false
      }

      // Route filter (applied client-side - API doesn't support route search)
      if (watchlist.criteria.routeNameFilter) {
        const routeMatch = product.routes.some(r =>
          r.name.toLowerCase().includes(watchlist.criteria.routeNameFilter!.toLowerCase())
        )
        if (!routeMatch) return false
      }

      // Form filter (applied client-side - API doesn't support form search)
      if (watchlist.criteria.formNameFilter) {
        const formMatch = product.forms.some(f =>
          f.name.toLowerCase().includes(watchlist.criteria.formNameFilter!.toLowerCase())
        )
        if (!formMatch) return false
      }

      return true
    })
  }, [searchResults, watchlist])

  // Check if any filters are active
  const hasActiveFilters = watchlist && (
    watchlist.criteria.companyNameFilter ||
    watchlist.criteria.routeNameFilter ||
    watchlist.criteria.formNameFilter
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
  if (watchlist.criteria.searchTerm) {
    searchLabels.push({ type: 'search', label: `Brand: "${watchlist.criteria.searchTerm}"`, isFilter: false })
  }
  if (watchlist.criteria.ingredientName) {
    searchLabels.push({ type: 'ingredient', label: `Ingredient: ${watchlist.criteria.ingredientName}`, isFilter: false })
  }

  // Post-search filters (client-side)
  if (watchlist.criteria.companyNameFilter) {
    filterLabels.push({ type: 'company', label: watchlist.criteria.companyNameFilter, isFilter: true })
  }
  if (watchlist.criteria.routeNameFilter) {
    filterLabels.push({ type: 'route', label: watchlist.criteria.routeNameFilter, isFilter: true })
  }
  if (watchlist.criteria.formNameFilter) {
    filterLabels.push({ type: 'form', label: watchlist.criteria.formNameFilter, isFilter: true })
  }

  const criteriaLabels = [...searchLabels, ...filterLabels]

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
                  ${criteria.type === 'search'
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
            {filterLabels.map((criteria, idx) => (
              <span
                key={idx}
                className={`
                  inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
                  ${criteria.type === 'company'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : criteria.type === 'route'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }
                `}
              >
                {criteria.label}
              </span>
            ))}
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
              This watchlist needs a brand name or ingredient with at least {MIN_SEARCH_LENGTH} characters
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
