// =============================================================================
// Watchlists (Live API Version)
// =============================================================================
// Manages user watchlists with criteria that query the live Health Canada API

import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Eye, Bell, X, Loader2, ChevronDown } from 'lucide-react'
import {
  useWatchlistStorage,
  hasValidPrimarySearch,
  MIN_SEARCH_LENGTH,
  MIN_DIN_LENGTH,
  type WatchlistLive,
  type WatchlistCriteriaLive
} from '../../lib/hooks'
import { WatchlistCardLive } from './WatchlistCardLive'
import { IngredientAutocomplete } from './IngredientAutocomplete'
import { BrandAutocomplete } from './BrandAutocomplete'
import { CompanyAutocomplete } from './CompanyAutocomplete'
import { RouteAutocomplete } from './RouteAutocomplete'
import { FormAutocomplete } from './FormAutocomplete'
import { DINInput } from './DINInput'
import { StatusSelect } from './StatusSelect'
import { ClassAutocomplete } from './ClassAutocomplete'
import { ScheduleAutocomplete } from './ScheduleAutocomplete'
import { ATCAutocomplete } from './ATCAutocomplete'
import { SearchConfirmationModal } from './SearchConfirmationModal'
import { searchDrugProductsByBrandName, searchActiveIngredientsByName } from '../../lib/api/dpd/endpoints'
import type { ApiError } from '../../lib/api/client'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface WatchlistsLiveProps {
  onView?: (id: string) => void
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function WatchlistsLive({ onView }: WatchlistsLiveProps) {
  const {
    watchlists,
    isLoaded,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    toggleNotifications,
  } = useWatchlistStorage()

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWatchlist, setEditingWatchlist] = useState<WatchlistLive | null>(null)

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
  const [showFilters, setShowFilters] = useState(false)

  // Search confirmation modal state
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
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

  const filteredWatchlists = watchlists.filter(wl => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      wl.name.toLowerCase().includes(query) ||
      wl.description.toLowerCase().includes(query) ||
      wl.criteria.searchTerm?.toLowerCase().includes(query)
    )
  })

  const activeNotifications = watchlists.filter(wl => wl.notificationsActive).length

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
    // Reset confirmation modal state
    setIsSearching(false)
    setSearchError(null)
    setConfirmationModalOpen(false)
    setConfirmationResults([])
    setPendingCriteria(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (watchlist: WatchlistLive) => {
    setEditingWatchlist(watchlist)
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
  }

  const handleToggleNotifications = (id: string) => {
    toggleNotifications(id)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      deleteWatchlist(id)
    }
  }

  const closeModal = () => {
    // Cancel any in-flight request when closing modal
    abortControllerRef.current?.abort()
    setShowCreateModal(false)
    setEditingWatchlist(null)
    resetForm()
  }

  const handleSave = async () => {
    // Cancel any previous in-flight request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    const searchTerm = newSearchTerm.trim()
    const ingredientTerm = newIngredient.trim()
    const dinTerm = newDIN.trim()

    const criteria: WatchlistCriteriaLive = {
      // Primary search
      din: dinTerm || null,
      searchTerm: searchTerm || null,
      ingredientName: ingredientTerm || null,
      // Filters (arrays, only include if non-empty)
      routeNameFilter: newRoute.length > 0 ? newRoute : null,
      companyNameFilter: newCompany.length > 0 ? newCompany : null,
      statusFilter: newStatus.length > 0 ? newStatus : null,
      formNameFilter: newForm.length > 0 ? newForm : null,
      classFilter: newClass.length > 0 ? newClass : null,
      scheduleFilter: newSchedule.length > 0 ? newSchedule : null,
      atcFilter: newATC.length > 0 ? newATC : null,
    }

    // Validate primary search before saving
    if (!hasValidPrimarySearch(criteria)) {
      return
    }

    // If DIN is provided and valid, skip API validation (exact match)
    if (dinTerm.length >= MIN_DIN_LENGTH) {
      finalizeWatchlist(criteria)
      return
    }

    // If brand search term entered, validate via API
    if (searchTerm.length >= MIN_SEARCH_LENGTH) {
      setIsSearching(true)
      setSearchError(null)

      try {
        const results = await searchDrugProductsByBrandName(searchTerm, { signal })

        // Check if request was aborted
        if (signal.aborted) return

        // Extract unique brand names
        const uniqueBrands = [...new Set(results.map(p => p.brand_name).filter(Boolean))]

        if (uniqueBrands.length === 0) {
          setSearchError(`No products found matching "${searchTerm}"`)
          setIsSearching(false)
          return
        }

        if (uniqueBrands.length === 1) {
          // Single match - auto-select and create
          criteria.searchTerm = uniqueBrands[0]
          finalizeWatchlist(criteria)
          return
        }

        // Multiple matches - show confirmation modal
        setConfirmationSearchType('brand')
        setConfirmationSearchTerm(searchTerm)
        setConfirmationResults(uniqueBrands)
        setPendingCriteria(criteria)
        setConfirmationModalOpen(true)
        setIsSearching(false)
        return
      } catch (error) {
        // Ignore abort errors - user cancelled or component unmounted
        if (error instanceof Error && (error as ApiError).isAborted) {
          return
        }
        console.error('Brand search failed:', error)
        setSearchError('Failed to search products. Please try again.')
        setIsSearching(false)
        return
      }
    }

    // If ingredient term entered, validate via API
    if (ingredientTerm.length >= MIN_SEARCH_LENGTH) {
      setIsSearching(true)
      setSearchError(null)

      try {
        const results = await searchActiveIngredientsByName(ingredientTerm, { signal })

        // Check if request was aborted
        if (signal.aborted) return
        // Extract unique ingredient names
        const uniqueIngredients = [...new Set(results.map(i => i.ingredient_name).filter(Boolean))]

        if (uniqueIngredients.length === 0) {
          setSearchError(`No ingredients found matching "${ingredientTerm}"`)
          setIsSearching(false)
          return
        }

        if (uniqueIngredients.length === 1) {
          // Single match - auto-select and create
          criteria.ingredientName = uniqueIngredients[0]
          finalizeWatchlist(criteria)
          return
        }

        // Multiple matches - show confirmation modal
        setConfirmationSearchType('ingredient')
        setConfirmationSearchTerm(ingredientTerm)
        setConfirmationResults(uniqueIngredients)
        setPendingCriteria(criteria)
        setConfirmationModalOpen(true)
        setIsSearching(false)
        return
      } catch (error) {
        // Ignore abort errors - user cancelled or component unmounted
        if (error instanceof Error && (error as ApiError).isAborted) {
          return
        }
        console.error('Ingredient search failed:', error)
        setSearchError('Failed to search ingredients. Please try again.')
        setIsSearching(false)
        return
      }
    }
  }

  const finalizeWatchlist = (criteria: WatchlistCriteriaLive) => {
    setIsSearching(false)
    if (editingWatchlist) {
      updateWatchlist(editingWatchlist.id, {
        name: newName,
        description: newDescription,
        criteria,
      })
    } else {
      createWatchlist(newName, newDescription, criteria)
    }
    closeModal()
  }

  const handleConfirmSelection = (selectedValues: string[]) => {
    if (!pendingCriteria || selectedValues.length === 0) return

    const finalCriteria = { ...pendingCriteria }
    // Join multiple selections with "|" delimiter
    const joinedValue = selectedValues.join('|')
    if (confirmationSearchType === 'brand') {
      finalCriteria.searchTerm = joinedValue
    } else {
      finalCriteria.ingredientName = joinedValue
    }

    setConfirmationModalOpen(false)
    finalizeWatchlist(finalCriteria)
  }

  const handleCloseConfirmation = () => {
    setConfirmationModalOpen(false)
    setConfirmationResults([])
    setPendingCriteria(null)
  }

  const isModalOpen = showCreateModal || editingWatchlist !== null

  // Build criteria object to check validation
  const currentCriteria: WatchlistCriteriaLive = {
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
  const hasValidSearch = hasValidPrimarySearch(currentCriteria)

  // Check if any filters are set
  const hasFiltersSet = newRoute.length > 0 ||
    newCompany.length > 0 ||
    newStatus.length > 0 ||
    newForm.length > 0 ||
    newClass.length > 0 ||
    newSchedule.length > 0 ||
    newATC.length > 0

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Watchlists
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor regulatory changes across Health Canada databases
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="
            flex items-center gap-2 px-5 py-2.5
            bg-primary-500 hover:bg-primary-600
            text-white font-medium
            rounded-xl
            shadow-lg shadow-primary-500/20
            hover:shadow-primary-500/30
            transition-all
          "
        >
          <Plus className="w-5 h-5" />
          New Watchlist
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {watchlists.length}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Total watchlists
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-azure-100 dark:bg-azure-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-azure-600 dark:text-azure-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {activeNotifications}/{watchlists.length}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Active alerts
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Live
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                API Status
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search watchlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Watchlist Grid */}
      {filteredWatchlists.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          {watchlists.length === 0 ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                No watchlists yet
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Create a watchlist to start monitoring regulatory changes
              </p>
              <button
                onClick={handleCreate}
                className="
                  inline-flex items-center gap-2 px-5 py-2.5
                  bg-primary-500 hover:bg-primary-600
                  text-white font-medium
                  rounded-xl
                  transition-colors
                "
              >
                <Plus className="w-5 h-5" />
                Create Watchlist
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                No matches found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                Try a different search term
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWatchlists.map(watchlist => (
            <WatchlistCardLive
              key={watchlist.id}
              watchlist={watchlist}
              onView={() => onView?.(watchlist.id)}
              onEdit={() => handleEdit(watchlist)}
              onDelete={() => handleDelete(watchlist.id)}
              onToggleNotifications={() => handleToggleNotifications(watchlist.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-800/60"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {editingWatchlist ? 'Edit Watchlist' : 'Create Watchlist'}
              </h2>
              <button
                onClick={closeModal}
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
                {searchError && !isSearching && (
                  <p className="text-xs text-error-600 dark:text-error-400">
                    {searchError}
                  </p>
                )}
                {!hasValidSearch && !searchError && !isSearching && (
                  <p className="text-xs text-tan-600 dark:text-tan-400">
                    Enter a Product Name or Ingredient ({MIN_SEARCH_LENGTH}+ characters)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  disabled={isSearching}
                  className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newName || !hasValidSearch || isSearching}
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
                  {isSearching ? 'Searching...' : (editingWatchlist ? 'Save Changes' : 'Create Watchlist')}
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
