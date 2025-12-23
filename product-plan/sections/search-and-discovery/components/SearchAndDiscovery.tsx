import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, LayoutGrid, List, ChevronDown, X } from 'lucide-react'
import type { SearchAndDiscoveryProps, ActiveFilter } from '../types'
import { FilterBadge } from './FilterBadge'
import { DrugProductCard } from './DrugProductCard'
import { DrugProductRow } from './DrugProductRow'

export function SearchAndDiscovery({
  drugProducts,
  activeIngredients,
  manufacturers,
  routesOfAdministration,
  dosageForms,
  productStatuses,
  onSearch,
  onAttributeSelect,
  onFilterRemove,
  onAddToWatchlist,
  onViewHistory,
  onExpand,
  onCollapse,
  onViewToggle
}: SearchAndDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter dropdowns state
  const [selectedIngredient, setSelectedIngredient] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedForm, setSelectedForm] = useState('')

  // Create lookup maps
  const ingredientMap = useMemo(() => new Map(activeIngredients.map(i => [i.id, i])), [activeIngredients])
  const manufacturerMap = useMemo(() => new Map(manufacturers.map(m => [m.id, m])), [manufacturers])
  const routeMap = useMemo(() => new Map(routesOfAdministration.map(r => [r.id, r])), [routesOfAdministration])
  const formMap = useMemo(() => new Map(dosageForms.map(f => [f.id, f])), [dosageForms])
  const statusMap = useMemo(() => new Map(productStatuses.map(s => [s.id, s])), [productStatuses])

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return drugProducts.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const ingredient = ingredientMap.get(product.activeIngredientId)
        const mfr = manufacturerMap.get(product.manufacturerId)

        const matchesSearch =
          product.productName.toLowerCase().includes(query) ||
          product.din.includes(query) ||
          ingredient?.name.toLowerCase().includes(query) ||
          mfr?.name.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Active filters
      for (const filter of activeFilters) {
        if (filter.type === 'activeIngredient' && product.activeIngredientId !== filter.id) return false
        if (filter.type === 'manufacturer' && product.manufacturerId !== filter.id) return false
        if (filter.type === 'route' && product.routeId !== filter.id) return false
        if (filter.type === 'dosageForm' && product.dosageFormId !== filter.id) return false
      }

      return true
    })
  }, [drugProducts, searchQuery, activeFilters, ingredientMap, manufacturerMap])

  // Get related products for a given product (same active ingredient)
  const getRelatedProducts = (productId: string, ingredientId: string) => {
    return drugProducts.filter(p => p.id !== productId && p.activeIngredientId === ingredientId)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  // Handle filter from dropdown
  const handleDropdownFilter = () => {
    const newFilters: ActiveFilter[] = []

    if (selectedIngredient) {
      const ing = ingredientMap.get(selectedIngredient)
      if (ing) newFilters.push({ type: 'activeIngredient', id: ing.id, label: ing.name })
    }
    if (selectedManufacturer) {
      const mfr = manufacturerMap.get(selectedManufacturer)
      if (mfr) newFilters.push({ type: 'manufacturer', id: mfr.id, label: mfr.name })
    }
    if (selectedRoute) {
      const route = routeMap.get(selectedRoute)
      if (route) newFilters.push({ type: 'route', id: route.id, label: route.name })
    }
    if (selectedForm) {
      const form = formMap.get(selectedForm)
      if (form) newFilters.push({ type: 'dosageForm', id: form.id, label: form.name })
    }

    setActiveFilters(newFilters)
    setShowFilters(false)
  }

  // Handle attribute selection from expanded product
  const handleAttributeSelect = (filter: ActiveFilter) => {
    const exists = activeFilters.some(f => f.type === filter.type && f.id === filter.id)
    if (!exists) {
      setActiveFilters([...activeFilters, filter])
      onAttributeSelect?.(filter)
    }
  }

  // Handle filter removal
  const handleFilterRemove = (filter: ActiveFilter) => {
    setActiveFilters(activeFilters.filter(f => !(f.type === filter.type && f.id === filter.id)))

    // Clear dropdown selection too
    if (filter.type === 'activeIngredient') setSelectedIngredient('')
    if (filter.type === 'manufacturer') setSelectedManufacturer('')
    if (filter.type === 'route') setSelectedRoute('')
    if (filter.type === 'dosageForm') setSelectedForm('')

    onFilterRemove?.(filter)
  }

  // Handle view toggle
  const handleViewToggle = (view: 'table' | 'card') => {
    setViewMode(view)
    onViewToggle?.(view)
  }

  // Handle expand/collapse
  const handleExpand = (id: string) => {
    setExpandedId(id)
    onExpand?.(id)
  }

  const handleCollapse = () => {
    setExpandedId(null)
    onCollapse?.(expandedId || '')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Search & Discovery
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Explore Health Canada's unified drug product database
        </p>
      </div>

      {/* Search and controls */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by drug name, DIN, ingredient, or manufacturer..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3.5
                bg-white dark:bg-neutral-800
                
                border border-neutral-200 dark:border-neutral-700
                rounded-xl
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50
                transition-all
              "
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-3
              bg-white dark:bg-neutral-800
              
              border border-neutral-200 dark:border-neutral-700
              rounded-xl
              text-neutral-700 dark:text-neutral-300
              hover:bg-white dark:hover:bg-neutral-800
              transition-all
              ${showFilters ? 'ring-2 ring-primary-500/30 border-primary-500/50' : ''}
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
        {showFilters && (
          <div className="p-5 bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 rounded-xl animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Ingredient */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Active Ingredient
                </label>
                <div className="relative">
                  <select
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="
                      w-full px-4 py-2.5 pr-10
                      bg-white dark:bg-neutral-800
                      border border-neutral-200 dark:border-neutral-700
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Ingredients</option>
                    {activeIngredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Manufacturer
                </label>
                <div className="relative">
                  <select
                    value={selectedManufacturer}
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    className="
                      w-full px-4 py-2.5 pr-10
                      bg-white dark:bg-neutral-800
                      border border-neutral-200 dark:border-neutral-700
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Manufacturers</option>
                    {manufacturers.map(mfr => (
                      <option key={mfr.id} value={mfr.id}>{mfr.name}</option>
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
                      bg-white dark:bg-neutral-800
                      border border-neutral-200 dark:border-neutral-700
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Routes</option>
                    {routesOfAdministration.map(route => (
                      <option key={route.id} value={route.id}>{route.name} ({route.abbreviation})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Dosage Form */}
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
                      bg-white dark:bg-neutral-800
                      border border-neutral-200 dark:border-neutral-700
                      rounded-lg
                      text-neutral-700 dark:text-neutral-300
                      appearance-none
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30
                    "
                  >
                    <option value="">All Forms</option>
                    {dosageForms.map(form => (
                      <option key={form.id} value={form.id}>{form.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => {
                  setSelectedIngredient('')
                  setSelectedManufacturer('')
                  setSelectedRoute('')
                  setSelectedForm('')
                  setActiveFilters([])
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleDropdownFilter}
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
                key={`${filter.type}-${filter.id}`}
                filter={filter}
                onRemove={() => handleFilterRemove(filter)}
              />
            ))}
            {activeFilters.length === 0 && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400 self-center">
                No active filters
              </span>
            )}
          </div>

          {/* View toggle and results count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {filteredProducts.length} results
            </span>

            <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <button
                onClick={() => handleViewToggle('table')}
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
                onClick={() => handleViewToggle('card')}
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
        </div>
      </div>

      {/* Results */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-800  rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            No products found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map(product => {
            const ingredient = ingredientMap.get(product.activeIngredientId)!
            const mfr = manufacturerMap.get(product.manufacturerId)!
            const route = routeMap.get(product.routeId)!
            const form = formMap.get(product.dosageFormId)!
            const status = statusMap.get(product.statusId)!
            const related = getRelatedProducts(product.id, product.activeIngredientId)

            return (
              <DrugProductCard
                key={product.id}
                product={product}
                activeIngredient={ingredient}
                manufacturer={mfr}
                route={route}
                dosageForm={form}
                status={status}
                isExpanded={expandedId === product.id}
                relatedProducts={related}
                onExpand={() => handleExpand(product.id)}
                onCollapse={handleCollapse}
                onAttributeSelect={handleAttributeSelect}
                onAddToWatchlist={() => onAddToWatchlist?.(product.id)}
                onViewHistory={() => onViewHistory?.(product.id)}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800  rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr,140px,140px,100px,100px,100px,44px] gap-4 px-5 py-3 bg-neutral-100/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            <div>Product</div>
            <div>Ingredient</div>
            <div>Manufacturer</div>
            <div>Route</div>
            <div>Status</div>
            <div>Updated</div>
            <div></div>
          </div>

          {/* Table rows */}
          <div>
            {filteredProducts.map(product => {
              const ingredient = ingredientMap.get(product.activeIngredientId)!
              const mfr = manufacturerMap.get(product.manufacturerId)!
              const route = routeMap.get(product.routeId)!
              const form = formMap.get(product.dosageFormId)!
              const status = statusMap.get(product.statusId)!
              const related = getRelatedProducts(product.id, product.activeIngredientId)

              return (
                <DrugProductRow
                  key={product.id}
                  product={product}
                  activeIngredient={ingredient}
                  manufacturer={mfr}
                  route={route}
                  dosageForm={form}
                  status={status}
                  isExpanded={expandedId === product.id}
                  relatedProducts={related}
                  onExpand={() => handleExpand(product.id)}
                  onCollapse={handleCollapse}
                  onAttributeSelect={handleAttributeSelect}
                  onAddToWatchlist={() => onAddToWatchlist?.(product.id)}
                  onViewHistory={() => onViewHistory?.(product.id)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
