// =============================================================================
// Live Search & Discovery Component
// =============================================================================
// Uses real Health Canada API data instead of sample data

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, LayoutGrid, List, ChevronDown, Loader2, AlertCircle, Database, Package } from 'lucide-react'
import { useUnifiedSearch, SEARCH_LIMITS } from '../../lib/api/unified/queries'
import { useBrandSearch } from '../../lib/api/dpd/queries'
import { getStatusOptions } from '../../lib/api/status-codes'
import { API_CONFIG } from '../../lib/api/constants'
import type { UnifiedDrugProduct } from '../../lib/api/dpd/transformers'
import { FilterBadge } from './FilterBadge'
import { DrugProductCardLive } from './DrugProductCardLive'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ActiveFilter {
  type: 'ingredient' | 'manufacturer' | 'route' | 'form' | 'status'
  value: string
  label: string
}

interface SearchAndDiscoveryLiveProps {
  onAddToWatchlist?: (product: UnifiedDrugProduct) => void
  onViewHistory?: (product: UnifiedDrugProduct) => void
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function SearchAndDiscoveryLive({
  onAddToWatchlist,
  onViewHistory,
}: SearchAndDiscoveryLiveProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card')
  const [expandedDrugCode, setExpandedDrugCode] = useState<number | null>(null)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter dropdown state
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [selectedForm, setSelectedForm] = useState<string>('')

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteQuery, setAutocompleteQuery] = useState('')
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch brand suggestions for autocomplete
  const { data: brandData, isLoading: brandLoading } = useBrandSearch(autocompleteQuery)

  // Get unique brand suggestions
  const brandSuggestions = useMemo(() => {
    if (!brandData?.brands) return []
    return brandData.brands.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    ).slice(0, 10) // Limit to 10 suggestions
  }, [brandData])

  // Handle click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounce search query
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    // Simple debounce for autocomplete
    setTimeout(() => {
      setAutocompleteQuery(value.trim())
    }, 200)
    // Debounce for main search
    setTimeout(() => {
      setDebouncedQuery(value)
    }, 300)

    // Show autocomplete if we have enough characters
    if (value.trim().length >= API_CONFIG.MIN_SEARCH_LENGTH) {
      setShowAutocomplete(true)
    } else {
      setShowAutocomplete(false)
    }
  }

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (brand: string) => {
    setSearchQuery(brand)
    setDebouncedQuery(brand)
    setShowAutocomplete(false)
    searchInputRef.current?.focus()
  }

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    isFetching,
  } = useUnifiedSearch(debouncedQuery, debouncedQuery.length >= API_CONFIG.MIN_SEARCH_LENGTH, 'auto', SEARCH_LIMITS.DEFAULT)


  // Get status options for filter
  const statusOptions = useMemo(() => getStatusOptions(), [])

  // Extract unique routes and forms from results for filter dropdowns
  const { uniqueRoutes, uniqueForms } = useMemo(() => {
    const products = searchResults?.products ?? []
    const routes = new Set<string>()
    const forms = new Set<string>()

    products.forEach(p => {
      p.routes.forEach(r => routes.add(r.name))
      p.forms.forEach(f => forms.add(f.name))
    })

    return {
      uniqueRoutes: Array.from(routes).sort(),
      uniqueForms: Array.from(forms).sort(),
    }
  }, [searchResults?.products])

  // Apply client-side filters to results
  const filteredProducts = useMemo(() => {
    let products = searchResults?.products ?? []

    for (const filter of activeFilters) {
      switch (filter.type) {
        case 'status':
          products = products.filter(p => p.statusCode === parseInt(filter.value))
          break
        case 'route':
          products = products.filter(p =>
            p.routes.some(r => r.name.toLowerCase() === filter.value.toLowerCase())
          )
          break
        case 'form':
          products = products.filter(p =>
            p.forms.some(f => f.name.toLowerCase() === filter.value.toLowerCase())
          )
          break
        case 'manufacturer':
          products = products.filter(p =>
            p.companyName.toLowerCase().includes(filter.value.toLowerCase())
          )
          break
        case 'ingredient':
          products = products.filter(p =>
            p.activeIngredients.some(ai =>
              ai.name.toLowerCase().includes(filter.value.toLowerCase())
            )
          )
          break
      }
    }

    return products
  }, [searchResults?.products, activeFilters])

  // Handle filter application from dropdown
  const handleApplyFilters = () => {
    const newFilters: ActiveFilter[] = []

    if (selectedStatus) {
      const statusInfo = statusOptions.find(s => s.value === parseInt(selectedStatus))
      if (statusInfo) {
        newFilters.push({
          type: 'status',
          value: selectedStatus,
          label: statusInfo.label,
        })
      }
    }

    if (selectedRoute) {
      newFilters.push({
        type: 'route',
        value: selectedRoute,
        label: selectedRoute,
      })
    }

    if (selectedForm) {
      newFilters.push({
        type: 'form',
        value: selectedForm,
        label: selectedForm,
      })
    }

    setActiveFilters(newFilters)
    setShowFilters(false)
  }

  // Handle filter removal
  const handleFilterRemove = (filter: ActiveFilter) => {
    setActiveFilters(activeFilters.filter(f => !(f.type === filter.type && f.value === filter.value)))

    // Clear corresponding dropdown
    if (filter.type === 'status') setSelectedStatus('')
    if (filter.type === 'route') setSelectedRoute('')
    if (filter.type === 'form') setSelectedForm('')
  }

  // Handle attribute click from expanded product
  const handleAttributeSelect = (filter: ActiveFilter) => {
    const exists = activeFilters.some(f => f.type === filter.type && f.value === filter.value)
    if (!exists) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  // Handle expand/collapse
  const handleExpand = (drugCode: number) => {
    setExpandedDrugCode(drugCode)
  }

  const handleCollapse = () => {
    setExpandedDrugCode(null)
  }

  // Find related products
  const getRelatedProducts = (product: UnifiedDrugProduct) => {
    const primaryIngredient = product.activeIngredients[0]?.name.toLowerCase()
    if (!primaryIngredient) return []

    return filteredProducts.filter(p =>
      p.drugCode !== product.drugCode &&
      p.activeIngredients.some(ai => ai.name.toLowerCase() === primaryIngredient)
    )
  }

  // Check if we should show the empty state
  const showEmptyState = debouncedQuery.length < API_CONFIG.MIN_SEARCH_LENGTH
  const showNoResults = !showEmptyState && !isLoading && filteredProducts.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Search & Discovery
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Search Health Canada's Drug Product Database in real-time
        </p>
      </div>

      {/* Data source indicator */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <Database className="w-3.5 h-3.5" />
        <span>Connected to Health Canada DPD API</span>
        {isFetching && (
          <span className="flex items-center gap-1 text-primary-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            Fetching...
          </span>
        )}
      </div>

      {/* Search and controls */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative" ref={searchContainerRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by drug name, DIN, or ingredient (min 3 characters)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= API_CONFIG.MIN_SEARCH_LENGTH && brandSuggestions.length > 0) {
                  setShowAutocomplete(true)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowAutocomplete(false)
                }
                if (e.key === 'Enter') {
                  setShowAutocomplete(false)
                }
              }}
              className="
                w-full pl-12 pr-4 py-3.5
                bg-white dark:bg-neutral-800
                border border-neutral-200 dark:border-neutral-700
                rounded-xl
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                transition-all
              "
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
            )}

            {/* Autocomplete suggestions dropdown */}
            {showAutocomplete && brandSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
                <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {brandSuggestions.length} brand suggestion{brandSuggestions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {brandSuggestions.map((brand, idx) => (
                    <button
                      key={`${brand}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(brand)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        flex items-center gap-2
                        hover:bg-primary-50 dark:hover:bg-primary-900/20
                        transition-colors
                        ${searchQuery.toLowerCase() === brand.toLowerCase()
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-neutral-700 dark:text-neutral-300'
                        }
                      `}
                    >
                      <Package className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                      <span className="truncate">{brand}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading suggestions */}
            {showAutocomplete && brandLoading && brandSuggestions.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading suggestions...
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={showEmptyState}
            className={`
              flex items-center gap-2 px-4 py-3
              bg-white dark:bg-neutral-800
              border border-neutral-200 dark:border-neutral-700
              rounded-xl
              text-neutral-700 dark:text-neutral-300
              hover:bg-neutral-50 dark:hover:bg-neutral-750
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${showFilters ? 'ring-2 ring-primary-500/30 border-primary-500' : ''}
            `}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter dropdowns panel */}
        {showFilters && !showEmptyState && (
          <div className="p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="
                      w-full px-4 py-2.5 pr-10
                      bg-white dark:bg-neutral-700
                      border border-neutral-200 dark:border-neutral-600
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Route */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Route of Administration
                </label>
                <div className="relative">
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="
                      w-full px-4 py-2.5 pr-10
                      bg-white dark:bg-neutral-700
                      border border-neutral-200 dark:border-neutral-600
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Routes</option>
                    {uniqueRoutes.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Form */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Dosage Form
                </label>
                <div className="relative">
                  <select
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                    className="
                      w-full px-4 py-2.5 pr-10
                      bg-white dark:bg-neutral-700
                      border border-neutral-200 dark:border-neutral-600
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Forms</option>
                    {uniqueForms.map(form => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => {
                  setSelectedStatus('')
                  setSelectedRoute('')
                  setSelectedForm('')
                  setActiveFilters([])
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active filters and view toggle */}
        <div className="flex items-center justify-between gap-4">
          {/* Active filter badges */}
          <div className="flex-1 flex flex-wrap gap-2 min-h-[36px]">
            {activeFilters.map(filter => (
              <FilterBadge
                key={`${filter.type}-${filter.value}`}
                filter={{ type: filter.type as any, id: filter.value, label: filter.label }}
                onRemove={() => handleFilterRemove(filter)}
              />
            ))}
            {activeFilters.length === 0 && !showEmptyState && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400 self-center">
                No active filters
              </span>
            )}
          </div>

          {/* View toggle and results count */}
          {!showEmptyState && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {filteredProducts.length} results
              </span>

              <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`
                    p-2.5
                    ${viewMode === 'table'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }
                    transition-colors
                  `}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`
                    p-2.5
                    ${viewMode === 'card'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }
                    transition-colors
                  `}
                  title="Card view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {/* Empty state - need to search first */}
      {showEmptyState && (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/10 flex items-center justify-center">
            <Search className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Start searching
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Enter at least 3 characters to search Health Canada's Drug Product Database.
            You can search by drug name, DIN, or active ingredient.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !showEmptyState && (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary-500 animate-spin" />
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Searching Health Canada Database
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Fetching results from the DPD API...
          </p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-error-200 dark:border-error-900">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-error-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Search failed
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            {error instanceof Error ? error.message : 'Unable to fetch results from Health Canada API. Please try again.'}
          </p>
          <button
            onClick={() => setDebouncedQuery(searchQuery)}
            className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No results */}
      {showNoResults && !isError && (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            No products found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Results grid */}
      {!showEmptyState && !isLoading && !isError && filteredProducts.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map(product => (
            <DrugProductCardLive
              key={product.drugCode}
              product={product}
              isExpanded={expandedDrugCode === product.drugCode}
              relatedProducts={getRelatedProducts(product)}
              onExpand={() => handleExpand(product.drugCode)}
              onCollapse={handleCollapse}
              onAttributeSelect={handleAttributeSelect}
              onAddToWatchlist={() => onAddToWatchlist?.(product)}
              onViewHistory={() => onViewHistory?.(product)}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {!showEmptyState && !isLoading && !isError && filteredProducts.length > 0 && viewMode === 'table' && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr,140px,140px,100px,100px,100px] gap-4 px-5 py-3 bg-neutral-100 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            <div>Product</div>
            <div>Ingredient</div>
            <div>Manufacturer</div>
            <div>Route</div>
            <div>Status</div>
            <div>Updated</div>
          </div>

          {/* Table rows */}
          <div>
            {filteredProducts.map(product => (
              <div
                key={product.drugCode}
                className="grid grid-cols-[1fr,140px,140px,100px,100px,100px] gap-4 px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                onClick={() => handleExpand(product.drugCode)}
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {product.brandName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    DIN: {product.din}
                  </p>
                </div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                  {product.activeIngredients[0]?.name ?? '-'}
                </div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                  {product.companyName}
                </div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                  {product.routes[0]?.name ?? '-'}
                </div>
                <div>
                  <span className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${product.statusCategory === 'active'
                      ? 'bg-secondary-500/10 text-secondary-700 dark:text-secondary-300'
                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                    }
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      product.statusCategory === 'active' ? 'bg-secondary-500' : 'bg-neutral-400'
                    }`} />
                    {product.statusName}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {product.lastUpdated}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GSUR/SUR results if available */}
      {searchResults && (searchResults.gsurMatches.length > 0 || searchResults.surMatches.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Submissions Under Review
          </h2>

          {searchResults.gsurMatches.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lavender-500" />
                Generic Submissions (GSUR) - {searchResults.gsurMatches.length} matches
              </h3>
              <div className="space-y-2">
                {searchResults.gsurMatches.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="text-sm p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {entry.medicinal_ingredients}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                      {entry.company_name} • {entry.therapeutic_area} • Accepted {entry.year_month_accepted}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.surMatches.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-azure-500" />
                New Drug Submissions (SUR) - {searchResults.surMatches.length} matches
              </h3>
              <div className="space-y-2">
                {searchResults.surMatches.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="text-sm p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {entry.medicinal_ingredients}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                      {entry.company_sponsor_name} • {entry.therapeutic_area} • {entry.submission_class} • Accepted {entry.year_month_accepted}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
