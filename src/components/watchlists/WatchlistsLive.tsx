// =============================================================================
// Watchlists (Live API Version)
// =============================================================================
// Manages user watchlists with criteria that query the live Health Canada API

import { useState } from 'react'
import { Plus, Search, Eye, Bell, X, Loader2, Info } from 'lucide-react'
import {
  useWatchlistStorage,
  hasValidPrimarySearch,
  MIN_SEARCH_LENGTH,
  type WatchlistLive,
  type WatchlistCriteriaLive
} from '../../lib/hooks'
import { WatchlistCardLive } from './WatchlistCardLive'
import { IngredientAutocomplete } from './IngredientAutocomplete'
import { BrandAutocomplete } from './BrandAutocomplete'
import { CompanyAutocomplete } from './CompanyAutocomplete'
import { RouteAutocomplete } from './RouteAutocomplete'
import { FormAutocomplete } from './FormAutocomplete'

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

  // Form state
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newSearchTerm, setNewSearchTerm] = useState('')
  const [newIngredient, setNewIngredient] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [newForm, setNewForm] = useState('')

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
    setNewSearchTerm('')
    setNewIngredient('')
    setNewCompany('')
    setNewRoute('')
    setNewForm('')
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (watchlist: WatchlistLive) => {
    setEditingWatchlist(watchlist)
    setNewName(watchlist.name)
    setNewDescription(watchlist.description)
    setNewSearchTerm(watchlist.criteria.searchTerm || '')
    setNewIngredient(watchlist.criteria.ingredientName || '')
    setNewCompany(watchlist.criteria.companyNameFilter || '')
    setNewRoute(watchlist.criteria.routeNameFilter || '')
    setNewForm(watchlist.criteria.formNameFilter || '')
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
    setShowCreateModal(false)
    setEditingWatchlist(null)
    resetForm()
  }

  const handleSave = () => {
    const criteria: WatchlistCriteriaLive = {
      searchTerm: newSearchTerm.trim() || null,
      ingredientName: newIngredient.trim() || null,
      companyNameFilter: newCompany.trim() || null,
      routeNameFilter: newRoute.trim() || null,
      formNameFilter: newForm.trim() || null,
    }

    // Validate primary search before saving
    if (!hasValidPrimarySearch(criteria)) {
      return
    }

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

  const isModalOpen = showCreateModal || editingWatchlist !== null

  // Build criteria object to check validation
  const currentCriteria: WatchlistCriteriaLive = {
    searchTerm: newSearchTerm.trim() || null,
    ingredientName: newIngredient.trim() || null,
    companyNameFilter: newCompany.trim() || null,
    routeNameFilter: newRoute.trim() || null,
    formNameFilter: newForm.trim() || null,
  }
  const hasValidSearch = hasValidPrimarySearch(currentCriteria)

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
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
                  <div>
                    <label className="block text-sm font-medium text-primary-800 dark:text-primary-200">
                      Primary Search (Required)
                    </label>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                      At least one field below must have {MIN_SEARCH_LENGTH}+ characters. These search the Health Canada API directly.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <BrandAutocomplete
                    value={newSearchTerm}
                    onChange={setNewSearchTerm}
                    placeholder="e.g., Tylenol, Advil, Lipitor"
                    label="Brand Name"
                  />

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                    <span className="text-xs text-neutral-400 uppercase">or</span>
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                  </div>

                  <IngredientAutocomplete
                    value={newIngredient}
                    onChange={setNewIngredient}
                    placeholder="e.g., Cefazolin, Metformin, Ibuprofen"
                    label="Active Ingredient"
                  />
                </div>
              </div>

              {/* Optional Filters Section */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Optional Filters
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  These filters are applied after fetching results from the API. They narrow down the search results.
                </p>

                <div className="space-y-3">
                  <CompanyAutocomplete
                    value={newCompany}
                    onChange={setNewCompany}
                    placeholder="e.g., APOTEX INC, PFIZER"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RouteAutocomplete
                      value={newRoute}
                      onChange={setNewRoute}
                      placeholder="e.g., Oral, Intravenous"
                    />

                    <FormAutocomplete
                      value={newForm}
                      onChange={setNewForm}
                      placeholder="e.g., Tablet, Capsule"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-5 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
              {!hasValidSearch && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Enter brand name or ingredient ({MIN_SEARCH_LENGTH}+ chars)
                </p>
              )}
              {hasValidSearch && <div />}
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newName || !hasValidSearch}
                  className="
                    px-5 py-2.5
                    bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700
                    text-white disabled:text-neutral-500 dark:disabled:text-neutral-500
                    font-medium rounded-xl
                    transition-colors
                    disabled:cursor-not-allowed
                  "
                >
                  {editingWatchlist ? 'Save Changes' : 'Create Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
