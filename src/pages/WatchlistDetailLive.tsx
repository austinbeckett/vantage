// =============================================================================
// Watchlist Detail (Live API Version)
// =============================================================================
// Shows products matching a watchlist's criteria from live Health Canada API

import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Filter, X, ChevronDown } from 'lucide-react'
import {
  useWatchlistStorage,
  hasValidPrimarySearch,
  MIN_SEARCH_LENGTH,
  getPrimarySearchQuery,
  getSearchType,
  type WatchlistCriteriaLive
} from '../lib/hooks'
import { useUnifiedSearch, SEARCH_LIMITS } from '../lib/api/unified/queries'
import { DrugProductCardLive } from '../components/search/DrugProductCardLive'
import { getStatusName } from '../lib/api/status-codes'
import { IngredientAutocomplete } from '../components/watchlists/IngredientAutocomplete'
import { BrandAutocomplete } from '../components/watchlists/BrandAutocomplete'
import { CompanyAutocomplete } from '../components/watchlists/CompanyAutocomplete'
import { RouteAutocomplete } from '../components/watchlists/RouteAutocomplete'
import { FormAutocomplete } from '../components/watchlists/FormAutocomplete'
import { DINInput } from '../components/watchlists/DINInput'
import { StatusSelect } from '../components/watchlists/StatusSelect'
import { ClassAutocomplete } from '../components/watchlists/ClassAutocomplete'
import { ScheduleAutocomplete } from '../components/watchlists/ScheduleAutocomplete'
import { ATCAutocomplete } from '../components/watchlists/ATCAutocomplete'
import { SearchConfirmationModal } from '../components/watchlists/SearchConfirmationModal'
import { searchDrugProductsByBrandName, searchActiveIngredientsByName } from '../lib/api/dpd/endpoints'
import type { ApiError } from '../lib/api/client'

const PRODUCTS_PER_PAGE = 50

export default function WatchlistDetailLive() {
  const { id } = useParams()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Form state - Primary search
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDIN, setNewDIN] = useState('')
  const [newSearchTerm, setNewSearchTerm] = useState('')
  const [newIngredient, setNewIngredient] = useState('')

  // Form state - Filters (all support multi-select)
  const [newRoute, setNewRoute] = useState<string[]>([])
  const [newCompany, setNewCompany] = useState<string[]>([])
  const [newStatus, setNewStatus] = useState<number[]>([])
  const [newForm, setNewForm] = useState<string[]>([])
  const [newClass, setNewClass] = useState<string[]>([])
  const [newSchedule, setNewSchedule] = useState<string[]>([])
  const [newATC, setNewATC] = useState<string[]>([])

  // Search confirmation modal state
  const [isSearching, setIsSearching] = useState(false)
  const [searchErrorMsg, setSearchErrorMsg] = useState<string | null>(null)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [confirmationSearchType, setConfirmationSearchType] = useState<'brand' | 'ingredient'>('brand')
  const [confirmationSearchTerm, setConfirmationSearchTerm] = useState('')
  const [confirmationResults, setConfirmationResults] = useState<string[]>([])
  const [pendingCriteria, setPendingCriteria] = useState<WatchlistCriteriaLive | null>(null)

  // Abort controller for cancelling in-flight API requests
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const { getWatchlist, toggleNotifications, deleteWatchlist, updateWatchlist, isLoaded } = useWatchlistStorage()
  const watchlist = id ? getWatchlist(id) : undefined

  // Determine search type based on which field was filled
  const searchTypeValue = useMemo(() => {
    if (!watchlist) return 'none'
    return getSearchType(watchlist.criteria)
  }, [watchlist])

  // Build search query from criteria - only use API-supported fields
  const searchQuery = useMemo(() => {
    if (!watchlist) return ''
    return getPrimarySearchQuery(watchlist.criteria)
  }, [watchlist])

  // Check if watchlist has valid primary search criteria
  const hasValidSearch = watchlist ? hasValidPrimarySearch(watchlist.criteria) : false

  // Determine the search type for unified search (brand/ingredient/auto)
  const unifiedSearchType = useMemo((): 'brand' | 'ingredient' | 'auto' => {
    if (searchTypeValue === 'ingredient') return 'ingredient'
    if (searchTypeValue === 'brand') return 'brand'
    return 'auto'
  }, [searchTypeValue])

  // Use the unified search hook for brand/ingredient searches
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useUnifiedSearch(
    searchQuery,
    hasValidSearch,
    unifiedSearchType,
    SEARCH_LIMITS.WATCHLIST
  )

  // Filter results based on post-search filter criteria (client-side only)
  const matchingProducts = useMemo(() => {
    if (!watchlist) return []
    if (!searchResults?.products) return []

    return searchResults.products.filter(product => {
      // Route filter - match ANY selected route (OR logic)
      if (watchlist.criteria.routeNameFilter?.length) {
        const routeMatch = product.routes.some(r =>
          watchlist.criteria.routeNameFilter!.some(filter =>
            filter.toLowerCase() === r.name.toLowerCase()
          )
        )
        if (!routeMatch) return false
      }

      // Company filter - match ANY selected company (OR logic, partial match)
      if (watchlist.criteria.companyNameFilter?.length) {
        const companyMatch = watchlist.criteria.companyNameFilter.some(filter =>
          product.companyName.toLowerCase().includes(filter.toLowerCase())
        )
        if (!companyMatch) return false
      }

      // Status filter - match ANY selected status (OR logic)
      if (watchlist.criteria.statusFilter?.length) {
        if (!watchlist.criteria.statusFilter.includes(product.statusCode)) return false
      }

      // Form filter - match ANY selected form (OR logic)
      if (watchlist.criteria.formNameFilter?.length) {
        const formMatch = product.forms.some(f =>
          watchlist.criteria.formNameFilter!.some(filter =>
            filter.toLowerCase() === f.name.toLowerCase()
          )
        )
        if (!formMatch) return false
      }

      // Class filter - match ANY selected class (OR logic, partial match)
      if (watchlist.criteria.classFilter?.length) {
        const classMatch = watchlist.criteria.classFilter.some(filter =>
          product.className.toLowerCase().includes(filter.toLowerCase())
        )
        if (!classMatch) return false
      }

      // Schedule filter - match ANY selected schedule (OR logic)
      if (watchlist.criteria.scheduleFilter?.length) {
        const scheduleMatch = product.schedules.some(s =>
          watchlist.criteria.scheduleFilter!.some(filter =>
            filter.toLowerCase() === s.toLowerCase()
          )
        )
        if (!scheduleMatch) return false
      }

      // ATC filter - match ANY selected ATC prefix (OR logic)
      if (watchlist.criteria.atcFilter?.length) {
        const atcMatch = watchlist.criteria.atcFilter.some(filter =>
          product.atcCode?.toUpperCase().startsWith(filter.toUpperCase())
        )
        if (!atcMatch) return false
      }

      return true
    })
  }, [searchResults, watchlist])

  // Check if any filters are active
  const hasActiveFilters = watchlist && (
    (watchlist.criteria.routeNameFilter?.length ?? 0) > 0 ||
    (watchlist.criteria.companyNameFilter?.length ?? 0) > 0 ||
    (watchlist.criteria.statusFilter?.length ?? 0) > 0 ||
    (watchlist.criteria.formNameFilter?.length ?? 0) > 0 ||
    (watchlist.criteria.classFilter?.length ?? 0) > 0 ||
    (watchlist.criteria.scheduleFilter?.length ?? 0) > 0 ||
    (watchlist.criteria.atcFilter?.length ?? 0) > 0
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
    // Handle multiple brand names separated by "|"
    const brandNames = watchlist.criteria.searchTerm.split('|').map(s => s.trim())
    brandNames.forEach(name => {
      searchLabels.push({ type: 'search', label: `Product: "${name}"`, isFilter: false })
    })
  }
  if (watchlist.criteria.ingredientName) {
    // Handle multiple ingredients separated by "|"
    const ingredients = watchlist.criteria.ingredientName.split('|').map(s => s.trim())
    ingredients.forEach(name => {
      searchLabels.push({ type: 'ingredient', label: `Ingredient: ${name}`, isFilter: false })
    })
  }

  // Filter labels (all arrays now)
  watchlist.criteria.routeNameFilter?.forEach(route => {
    filterLabels.push({ type: 'route', label: route, isFilter: true })
  })
  watchlist.criteria.companyNameFilter?.forEach(company => {
    filterLabels.push({ type: 'company', label: company, isFilter: true })
  })
  watchlist.criteria.statusFilter?.forEach(status => {
    filterLabels.push({ type: 'status', label: getStatusName(status), isFilter: true })
  })
  watchlist.criteria.formNameFilter?.forEach(form => {
    filterLabels.push({ type: 'form', label: form, isFilter: true })
  })
  watchlist.criteria.classFilter?.forEach(cls => {
    filterLabels.push({ type: 'class', label: cls, isFilter: true })
  })
  watchlist.criteria.scheduleFilter?.forEach(schedule => {
    filterLabels.push({ type: 'schedule', label: schedule, isFilter: true })
  })
  watchlist.criteria.atcFilter?.forEach(atc => {
    filterLabels.push({ type: 'atc', label: `ATC: ${atc}`, isFilter: true })
  })

  const handleToggleNotifications = () => {
    toggleNotifications(watchlist.id)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      deleteWatchlist(watchlist.id)
      window.location.href = '/watchlists'
    }
  }

  // Edit modal handlers
  const resetForm = () => {
    setNewName('')
    setNewDescription('')
    setNewDIN('')
    setNewSearchTerm('')
    setNewIngredient('')
    setNewRoute([])
    setNewCompany([])
    setNewStatus([])
    setNewForm([])
    setNewClass([])
    setNewSchedule([])
    setNewATC([])
    setShowFilters(false)
    setIsSearching(false)
    setSearchErrorMsg(null)
    setConfirmationModalOpen(false)
    setConfirmationResults([])
    setPendingCriteria(null)
  }

  const handleOpenEdit = () => {
    if (!watchlist) return
    setNewName(watchlist.name)
    setNewDescription(watchlist.description)
    // Primary search
    setNewDIN(watchlist.criteria.din || '')
    setNewSearchTerm(watchlist.criteria.searchTerm || '')
    setNewIngredient(watchlist.criteria.ingredientName || '')
    // Filters (all arrays)
    setNewRoute(watchlist.criteria.routeNameFilter || [])
    setNewCompany(watchlist.criteria.companyNameFilter || [])
    setNewStatus(watchlist.criteria.statusFilter || [])
    setNewForm(watchlist.criteria.formNameFilter || [])
    setNewClass(watchlist.criteria.classFilter || [])
    setNewSchedule(watchlist.criteria.scheduleFilter || [])
    setNewATC(watchlist.criteria.atcFilter || [])
    // Show filters if any are set
    const hasFilters = (watchlist.criteria.routeNameFilter?.length ?? 0) > 0 ||
      (watchlist.criteria.companyNameFilter?.length ?? 0) > 0 ||
      (watchlist.criteria.statusFilter?.length ?? 0) > 0 ||
      (watchlist.criteria.formNameFilter?.length ?? 0) > 0 ||
      (watchlist.criteria.classFilter?.length ?? 0) > 0 ||
      (watchlist.criteria.scheduleFilter?.length ?? 0) > 0 ||
      (watchlist.criteria.atcFilter?.length ?? 0) > 0
    setShowFilters(hasFilters)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    abortControllerRef.current?.abort()
    setShowEditModal(false)
    resetForm()
  }

  const handleSaveEdit = async () => {
    if (!watchlist) return

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    const searchTerm = newSearchTerm.trim()
    const ingredientTerm = newIngredient.trim()
    const dinTerm = newDIN.trim()

    const criteria: WatchlistCriteriaLive = {
      din: dinTerm || null,
      searchTerm: searchTerm || null,
      ingredientName: ingredientTerm || null,
      routeNameFilter: newRoute.length > 0 ? newRoute : null,
      companyNameFilter: newCompany.length > 0 ? newCompany : null,
      statusFilter: newStatus.length > 0 ? newStatus : null,
      formNameFilter: newForm.length > 0 ? newForm : null,
      classFilter: newClass.length > 0 ? newClass : null,
      scheduleFilter: newSchedule.length > 0 ? newSchedule : null,
      atcFilter: newATC.length > 0 ? newATC : null,
    }

    if (!hasValidPrimarySearch(criteria)) {
      return
    }

    // If brand search term entered, validate via API
    if (searchTerm.length >= MIN_SEARCH_LENGTH) {
      setIsSearching(true)
      setSearchErrorMsg(null)

      try {
        const results = await searchDrugProductsByBrandName(searchTerm, { signal })
        if (signal.aborted) return

        const uniqueBrands = [...new Set(results.map(p => p.brand_name).filter(Boolean))]

        if (uniqueBrands.length === 0) {
          setSearchErrorMsg(`No products found matching "${searchTerm}"`)
          setIsSearching(false)
          return
        }

        if (uniqueBrands.length === 1) {
          criteria.searchTerm = uniqueBrands[0]
          finalizeEdit(criteria)
          return
        }

        setConfirmationSearchType('brand')
        setConfirmationSearchTerm(searchTerm)
        setConfirmationResults(uniqueBrands)
        setPendingCriteria(criteria)
        setConfirmationModalOpen(true)
        setIsSearching(false)
        return
      } catch (error) {
        if (error instanceof Error && (error as ApiError).isAborted) return
        setSearchErrorMsg('Failed to search products. Please try again.')
        setIsSearching(false)
        return
      }
    }

    // If ingredient term entered, validate via API
    if (ingredientTerm.length >= MIN_SEARCH_LENGTH) {
      setIsSearching(true)
      setSearchErrorMsg(null)

      try {
        const results = await searchActiveIngredientsByName(ingredientTerm, { signal })
        if (signal.aborted) return

        const uniqueIngredients = [...new Set(results.map(i => i.ingredient_name).filter(Boolean))]

        if (uniqueIngredients.length === 0) {
          setSearchErrorMsg(`No ingredients found matching "${ingredientTerm}"`)
          setIsSearching(false)
          return
        }

        if (uniqueIngredients.length === 1) {
          criteria.ingredientName = uniqueIngredients[0]
          finalizeEdit(criteria)
          return
        }

        setConfirmationSearchType('ingredient')
        setConfirmationSearchTerm(ingredientTerm)
        setConfirmationResults(uniqueIngredients)
        setPendingCriteria(criteria)
        setConfirmationModalOpen(true)
        setIsSearching(false)
        return
      } catch (error) {
        if (error instanceof Error && (error as ApiError).isAborted) return
        setSearchErrorMsg('Failed to search ingredients. Please try again.')
        setIsSearching(false)
        return
      }
    }
  }

  const finalizeEdit = (criteria: WatchlistCriteriaLive) => {
    if (!watchlist) return
    setIsSearching(false)
    updateWatchlist(watchlist.id, {
      name: newName,
      description: newDescription,
      criteria,
    })
    closeEditModal()
  }

  const handleConfirmSelection = (selectedValues: string[]) => {
    if (!pendingCriteria || selectedValues.length === 0) return

    const finalCriteria = { ...pendingCriteria }
    const joinedValue = selectedValues.join('|')
    if (confirmationSearchType === 'brand') {
      finalCriteria.searchTerm = joinedValue
    } else {
      finalCriteria.ingredientName = joinedValue
    }

    setConfirmationModalOpen(false)
    finalizeEdit(finalCriteria)
  }

  const handleCloseConfirmation = () => {
    setConfirmationModalOpen(false)
    setConfirmationResults([])
    setPendingCriteria(null)
  }

  // Build criteria object to check validation for the edit form
  const currentEditCriteria: WatchlistCriteriaLive = {
    din: newDIN.trim() || null,
    searchTerm: newSearchTerm.trim() || null,
    ingredientName: newIngredient.trim() || null,
    routeNameFilter: newRoute.length > 0 ? newRoute : null,
    companyNameFilter: newCompany.length > 0 ? newCompany : null,
    statusFilter: newStatus.length > 0 ? newStatus : null,
    formNameFilter: newForm.length > 0 ? newForm : null,
    classFilter: newClass.length > 0 ? newClass : null,
    scheduleFilter: newSchedule.length > 0 ? newSchedule : null,
    atcFilter: newATC.length > 0 ? newATC : null,
  }
  const hasValidEditSearch = hasValidPrimarySearch(currentEditCriteria)

  const hasFiltersSet = newRoute.length > 0 ||
    newCompany.length > 0 ||
    newStatus.length > 0 ||
    newForm.length > 0 ||
    newClass.length > 0 ||
    newSchedule.length > 0 ||
    newATC.length > 0

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
            <button
              onClick={handleOpenEdit}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              title="Edit watchlist"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
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
                    ? 'bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300 font-mono'
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
                  colorClasses = 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
                  break
                case 'company':
                  colorClasses = 'bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300'
                  break
                case 'status':
                  colorClasses = 'bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300'
                  break
                case 'form':
                  colorClasses = 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
                  break
                case 'class':
                  colorClasses = 'bg-mint-200 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300'
                  break
                case 'schedule':
                  colorClasses = 'bg-lavender-200 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
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
          <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error-800 dark:text-error-200">
                  Failed to load products
                </p>
                <p className="text-xs text-error-600 dark:text-error-400 mt-1">
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
            <AlertCircle className="w-12 h-12 mx-auto text-tan-400 dark:text-tan-500 mb-3" />
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Invalid Search Criteria
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              This watchlist needs a product name or ingredient with at least {MIN_SEARCH_LENGTH} characters
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
              {visibleProducts.map((product, index) => (
                <DrugProductCardLive
                  key={`${product.drugCode}-${index}`}
                  product={product}
                  isExpanded={expandedIndex === index}
                  onExpand={() => setExpandedIndex(index)}
                  onCollapse={() => setExpandedIndex(null)}
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-800/60"
            onClick={closeEditModal}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Edit Watchlist
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Watchlist Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Cefazolin IV Products"
                  className="
                    w-full px-4 py-3
                    bg-white dark:bg-neutral-800
                    border border-neutral-200 dark:border-neutral-700
                    rounded-xl
                    text-neutral-900 dark:text-neutral-100
                    placeholder:text-neutral-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of what you're monitoring"
                  className="
                    w-full px-4 py-3
                    bg-white dark:bg-neutral-800
                    border border-neutral-200 dark:border-neutral-700
                    rounded-xl
                    text-neutral-900 dark:text-neutral-100
                    placeholder:text-neutral-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30
                  "
                />
              </div>

              {/* Primary Search Section */}
              <div className="space-y-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Choose a molecule to monitor
                </p>

                {/* Active Ingredient */}
                <IngredientAutocomplete
                  value={newIngredient}
                  onChange={setNewIngredient}
                  label="Active Ingredient"
                />

                {/* Product Name */}
                <BrandAutocomplete
                  value={newSearchTerm}
                  onChange={setNewSearchTerm}
                  label="Product Name"
                />
              </div>

              {/* Filters Section (Collapsible) */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Filters
                    {hasFiltersSet && (
                      <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                        (active)
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      showFilters ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showFilters && (
                  <div className="p-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2 fade-in duration-150">
                    {/* Row 1: Route & Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <RouteAutocomplete
                        value={newRoute}
                        onChange={setNewRoute}
                      />

                      <CompanyAutocomplete
                        value={newCompany}
                        onChange={setNewCompany}
                      />
                    </div>

                    {/* Row 2: Status & Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <StatusSelect
                        value={newStatus}
                        onChange={setNewStatus}
                      />

                      <FormAutocomplete
                        value={newForm}
                        onChange={setNewForm}
                        label="Dosage Form"
                      />
                    </div>

                    {/* Row 3: Class & Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ClassAutocomplete
                        value={newClass}
                        onChange={setNewClass}
                      />

                      <ScheduleAutocomplete
                        value={newSchedule}
                        onChange={setNewSchedule}
                      />
                    </div>

                    {/* Row 4: ATC Code & DIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ATCAutocomplete
                        value={newATC}
                        onChange={setNewATC}
                      />

                      <DINInput
                        value={newDIN}
                        onChange={setNewDIN}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-5 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
              <div className="flex-1">
                {isSearching && (
                  <p className="text-xs text-azure-600 dark:text-azure-400">
                    Searching Health Canada database... First-time searches may take up to 60 seconds.
                  </p>
                )}
                {searchErrorMsg && !isSearching && (
                  <p className="text-xs text-error-600 dark:text-error-400">
                    {searchErrorMsg}
                  </p>
                )}
                {!hasValidEditSearch && !searchErrorMsg && !isSearching && (
                  <p className="text-xs text-tan-600 dark:text-tan-400">
                    Enter a Product Name or Ingredient ({MIN_SEARCH_LENGTH}+ characters)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeEditModal}
                  disabled={isSearching}
                  className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!newName || !hasValidEditSearch || isSearching}
                  className="
                    px-5 py-2.5
                    bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700
                    text-white disabled:text-neutral-500 dark:disabled:text-neutral-500
                    font-medium rounded-xl
                    transition-colors
                    disabled:cursor-not-allowed
                    flex items-center gap-2
                  "
                >
                  {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSearching ? 'Searching...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Confirmation Modal */}
      <SearchConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmSelection}
        searchType={confirmationSearchType}
        searchTerm={confirmationSearchTerm}
        results={confirmationResults}
      />
    </div>
  )
}
