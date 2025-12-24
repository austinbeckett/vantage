// =============================================================================
// Watchlist Detail (Live API Version)
// =============================================================================
// Shows tabbed view of DPD, NOC, and GSUR results matching watchlist criteria

import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Pencil, Trash2, Loader2, AlertCircle, RefreshCw, Filter, X, Database, FileCheck, FileSearch } from 'lucide-react'
import {
  useWatchlistStorage,
  hasValidPrimarySearch,
  MIN_SEARCH_LENGTH,
  type WatchlistCriteriaLive,
  type CachedCounts,
  type DPDViewFilters
} from '../lib/hooks'
import { useWatchlistTabbedData, extractSeenEntriesFromTabbed } from '../lib/api/watchlist'
import { WatchlistTabbedView } from '../components/watchlists/WatchlistTabbedView'
import { getStatusName } from '../lib/api/status-codes'
import { IngredientAutocomplete } from '../components/watchlists/IngredientAutocomplete'
import { BrandAutocomplete } from '../components/watchlists/BrandAutocomplete'
import { RouteAutocomplete } from '../components/watchlists/RouteAutocomplete'
import { FormAutocomplete } from '../components/watchlists/FormAutocomplete'
import { SearchConfirmationModal } from '../components/watchlists/SearchConfirmationModal'
import { searchDrugProductsByBrandName, searchActiveIngredientsByName } from '../lib/api/dpd/endpoints'
import type { ApiError } from '../lib/api/client'

export default function WatchlistDetailLive() {
  const { id } = useParams()

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)

  // Form state - Primary search and notification-scope filters
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newSearchTerm, setNewSearchTerm] = useState('')
  const [newIngredient, setNewIngredient] = useState('')
  // Route/Form filters (notification scope - apply to DPD and NOC)
  const [newRoutes, setNewRoutes] = useState<string[]>([])
  const [newForms, setNewForms] = useState<string[]>([])

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

  const { getWatchlist, toggleNotifications, deleteWatchlist, updateWatchlist, markAsViewed, updateCachedCounts, updateDPDViewFilters, isLoaded } = useWatchlistStorage()
  const watchlist = id ? getWatchlist(id) : undefined

  // Check if watchlist has valid primary search criteria
  const hasValidSearch = watchlist ? hasValidPrimarySearch(watchlist.criteria) : false

  // Use the watchlist tabbed data hook
  const {
    data: tabbedData,
    isLoading,
    error,
    refetch,
  } = useWatchlistTabbedData(
    id || '',
    watchlist?.criteria || { searchTerm: null, ingredientName: null, routeFilter: null, formFilter: null },
    watchlist?.lastViewedAt || null,
    watchlist?.seenEntries || { dpd: [], noc: [], gsur: [] },
    hasValidSearch && !!watchlist
  )

  // Track the last processed data to avoid infinite loops
  const lastProcessedRef = useRef<string | null>(null)

  // Mark as viewed and update cached counts when data loads
  useEffect(() => {
    if (tabbedData && id) {
      // Create a key based on the data to avoid reprocessing the same data
      const dataKey = `${id}-${tabbedData.lastFetched}`

      if (lastProcessedRef.current === dataKey) {
        return // Already processed this data
      }
      lastProcessedRef.current = dataKey

      // Extract seen entries from current data
      const seenEntries = extractSeenEntriesFromTabbed(tabbedData)

      // Update watchlist with seen entries and counts
      markAsViewed(id, seenEntries)

      const totalNewCount = tabbedData.dpd.newCount + tabbedData.noc.newCount + tabbedData.gsur.newCount
      const cachedCounts: CachedCounts = {
        dpd: tabbedData.dpd.count,
        noc: tabbedData.noc.count,
        gsur: tabbedData.gsur.count,
        newSinceLastView: totalNewCount,
        lastUpdated: new Date().toISOString(),
      }
      updateCachedCounts(id, cachedCounts)
    }
  }, [tabbedData, id, markAsViewed, updateCachedCounts])

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

  // Build criteria labels - primary search + route/form (notification scope)
  const searchLabels: { type: string; label: string }[] = []

  // Primary search criteria
  if (watchlist.criteria.searchTerm) {
    // Handle multiple brand names separated by "|"
    const brandNames = watchlist.criteria.searchTerm.split('|').map(s => s.trim())
    brandNames.forEach(name => {
      searchLabels.push({ type: 'search', label: `Product: "${name}"` })
    })
  }
  if (watchlist.criteria.ingredientName) {
    // Handle multiple ingredients separated by "|"
    const ingredients = watchlist.criteria.ingredientName.split('|').map(s => s.trim())
    ingredients.forEach(name => {
      searchLabels.push({ type: 'ingredient', label: `Ingredient: ${name}` })
    })
  }

  // Route/Form filters (notification scope - part of search criteria)
  watchlist.criteria.routeFilter?.forEach(route => {
    searchLabels.push({ type: 'route', label: `Route: ${route}` })
  })
  watchlist.criteria.formFilter?.forEach(form => {
    searchLabels.push({ type: 'form', label: `Form: ${form}` })
  })

  // DPD View Filter - only status now (view-only, does not affect notifications)
  const hasActiveStatusFilter = watchlist.dpdViewFilters?.statusFilter && watchlist.dpdViewFilters.statusFilter.length > 0

  const handleToggleNotifications = () => {
    toggleNotifications(watchlist.id)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      deleteWatchlist(watchlist.id)
      window.location.href = '/watchlists'
    }
  }

  // Handle DPD view filter changes (for client-side filtering in DPD tab)
  const handleDPDViewFiltersChange = (filters: DPDViewFilters) => {
    if (id) {
      updateDPDViewFilters(id, filters)
    }
  }

  // Edit modal handlers
  const resetForm = () => {
    setNewName('')
    setNewDescription('')
    setNewSearchTerm('')
    setNewIngredient('')
    setNewRoutes([])
    setNewForms([])
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
    setNewSearchTerm(watchlist.criteria.searchTerm || '')
    setNewIngredient(watchlist.criteria.ingredientName || '')
    // Route/Form filters (notification scope)
    setNewRoutes(watchlist.criteria.routeFilter || [])
    setNewForms(watchlist.criteria.formFilter || [])
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

    const criteria: WatchlistCriteriaLive = {
      searchTerm: searchTerm || null,
      ingredientName: ingredientTerm || null,
      routeFilter: newRoutes.length > 0 ? newRoutes : null,
      formFilter: newForms.length > 0 ? newForms : null,
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
    searchTerm: newSearchTerm.trim() || null,
    ingredientName: newIngredient.trim() || null,
    routeFilter: newRoutes.length > 0 ? newRoutes : null,
    formFilter: newForms.length > 0 ? newForms : null,
  }
  const hasValidEditSearch = hasValidPrimarySearch(currentEditCriteria)

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
            {searchLabels.map((criteria, idx) => {
              let colorClasses = 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              switch (criteria.type) {
                case 'search':
                  colorClasses = 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  break
                case 'ingredient':
                  colorClasses = 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                  break
                case 'route':
                  colorClasses = 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
                  break
                case 'form':
                  colorClasses = 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
                  break
              }
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${colorClasses}`}
                >
                  {criteria.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Status Filter Info (view-only) */}
        {hasActiveStatusFilter && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Filter className="w-3 h-3" />
              DPD view:
            </span>
            {watchlist.dpdViewFilters?.statusFilter?.map((status, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300"
              >
                {getStatusName(status)}
              </span>
            ))}
            <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
              (view only)
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          {/* Source Counts */}
          <div className="flex items-center gap-2">
            {tabbedData && (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  <Database className="w-3 h-3" />
                  {tabbedData.dpd.count} products
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300">
                  <FileCheck className="w-3 h-3" />
                  {tabbedData.noc.count} approvals
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300">
                  <FileSearch className="w-3 h-3" />
                  {tabbedData.gsur.count} filings
                </span>
              </>
            )}
            {isLoading && (
              <span className="text-neutral-400">Loading...</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
            Live from Health Canada
          </span>
          <span>
            Created {new Date(watchlist.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Results - Tabbed View */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error-800 dark:text-error-200">
                  Failed to load data
                </p>
                <p className="text-xs text-error-600 dark:text-error-400 mt-1">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invalid Search Criteria */}
        {!isLoading && !hasValidSearch && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 mx-auto text-tan-400 dark:text-tan-500 mb-3" />
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Invalid Search Criteria
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              This watchlist needs a product name or ingredient with at least {MIN_SEARCH_LENGTH} characters
              to search the Health Canada databases. Edit the watchlist to add valid search criteria.
            </p>
            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Edit Watchlist
            </button>
          </div>
        )}

        {/* Tabbed View */}
        {hasValidSearch && (
          <WatchlistTabbedView
            data={tabbedData}
            isLoading={isLoading}
            dpdViewFilters={watchlist.dpdViewFilters}
            onDPDViewFiltersChange={handleDPDViewFiltersChange}
          />
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

              {/* Optional Route/Form Filters Section */}
              <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Narrow by Route or Form <span className="text-neutral-400 dark:text-neutral-500">(optional)</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <RouteAutocomplete
                    value={newRoutes}
                    onChange={setNewRoutes}
                    label="Route"
                  />
                  <FormAutocomplete
                    value={newForms}
                    onChange={setNewForms}
                    label="Dosage Form"
                  />
                </div>
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
