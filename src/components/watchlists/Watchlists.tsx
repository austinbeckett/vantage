import { useState } from 'react'
import { Plus, Search, Eye, Bell, X } from 'lucide-react'
import type { WatchlistsProps, Watchlist } from '../../types/watchlists'
import { WatchlistCard } from './WatchlistCard'
import { SearchableSelect } from './SearchableSelect'

export function Watchlists({
  watchlists: initialWatchlists,
  activeIngredients,
  manufacturers,
  routesOfAdministration,
  dosageForms,
  onView,
  onEdit,
  onDelete,
  onToggleNotifications,
  onCreate
}: WatchlistsProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(initialWatchlists)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null)

  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newSearchTerm, setNewSearchTerm] = useState('')
  const [newIngredient, setNewIngredient] = useState('')
  const [newManufacturer, setNewManufacturer] = useState('')
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

  const totalMatches = watchlists.reduce((sum, wl) => sum + wl.matchCount, 0)
  const totalNewMatches = watchlists.reduce((sum, wl) => sum + wl.newMatchesCount, 0)
  const activeNotifications = watchlists.filter(wl => wl.notificationsActive).length

  const resetForm = () => {
    setNewName('')
    setNewDescription('')
    setNewSearchTerm('')
    setNewIngredient('')
    setNewManufacturer('')
    setNewRoute('')
    setNewForm('')
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (watchlist: Watchlist) => {
    setEditingWatchlist(watchlist)
    setNewName(watchlist.name)
    setNewDescription(watchlist.description)
    setNewSearchTerm(watchlist.criteria.searchTerm || '')
    setNewIngredient(watchlist.criteria.activeIngredientId || '')
    setNewManufacturer(watchlist.criteria.manufacturerId || '')
    setNewRoute(watchlist.criteria.routeId || '')
    setNewForm(watchlist.criteria.dosageFormId || '')
  }

  const handleToggleNotifications = (id: string) => {
    setWatchlists(prev => prev.map(wl =>
      wl.id === id
        ? { ...wl, notificationsActive: !wl.notificationsActive }
        : wl
    ))
    onToggleNotifications?.(id)
  }

  const handleDelete = (id: string) => {
    setWatchlists(prev => prev.filter(wl => wl.id !== id))
    onDelete?.(id)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingWatchlist(null)
    resetForm()
  }

  const handleSave = () => {
    const now = new Date().toISOString().split('T')[0]

    if (editingWatchlist) {
      setWatchlists(prev => prev.map(wl =>
        wl.id === editingWatchlist.id
          ? {
              ...wl,
              name: newName,
              description: newDescription,
              criteria: {
                searchTerm: newSearchTerm || null,
                activeIngredientId: newIngredient || null,
                manufacturerId: newManufacturer || null,
                routeId: newRoute || null,
                dosageFormId: newForm || null
              },
              lastUpdated: now
            }
          : wl
      ))
      onEdit?.(editingWatchlist.id)
    } else {
      const newWatchlist: Watchlist = {
        id: `wl-${Date.now()}`,
        name: newName,
        description: newDescription,
        criteria: {
          searchTerm: newSearchTerm || null,
          activeIngredientId: newIngredient || null,
          manufacturerId: newManufacturer || null,
          routeId: newRoute || null,
          dosageFormId: newForm || null
        },
        notificationsActive: true,
        matchCount: 0,
        newMatchesCount: 0,
        recentUpdatesCount: 0,
        createdAt: now,
        lastUpdated: now,
        recentActivity: [],
        matchingProductIds: []
      }
      setWatchlists(prev => [newWatchlist, ...prev])
      onCreate?.()
    }
    closeModal()
  }

  const isModalOpen = showCreateModal || editingWatchlist !== null
  const hasCriteria = newSearchTerm || newIngredient || newManufacturer || newRoute || newForm

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalMatches}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Total matches
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
              <span className="text-lg font-bold text-secondary-600 dark:text-secondary-400">+</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalNewMatches}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                New this week
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
      </div>

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
            <WatchlistCard
              key={watchlist.id}
              watchlist={watchlist}
              activeIngredients={activeIngredients}
              manufacturers={manufacturers}
              routesOfAdministration={routesOfAdministration}
              dosageForms={dosageForms}
              onView={() => onView?.(watchlist.id)}
              onEdit={() => handleEdit(watchlist)}
              onDelete={() => handleDelete(watchlist.id)}
              onToggleNotifications={() => handleToggleNotifications(watchlist.id)}
            />
          ))}
        </div>
      )}

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

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Monitoring Criteria
                </label>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Search Term
                    </label>
                    <input
                      type="text"
                      value={newSearchTerm}
                      onChange={(e) => setNewSearchTerm(e.target.value)}
                      placeholder="e.g., metformin, opioid"
                      className="
                        w-full px-4 py-2.5
                        bg-white dark:bg-neutral-800
                        border border-neutral-200 dark:border-neutral-700
                        rounded-lg
                        text-neutral-900 dark:text-neutral-100
                        placeholder:text-neutral-400
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30
                      "
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SearchableSelect
                      label="Ingredient"
                      options={activeIngredients}
                      value={newIngredient}
                      onChange={setNewIngredient}
                      placeholder="Search ingredients..."
                    />

                    <SearchableSelect
                      label="Manufacturer"
                      options={manufacturers}
                      value={newManufacturer}
                      onChange={setNewManufacturer}
                      placeholder="Search manufacturers..."
                    />

                    <SearchableSelect
                      label="Route"
                      options={routesOfAdministration}
                      value={newRoute}
                      onChange={setNewRoute}
                      placeholder="Search routes..."
                    />

                    <SearchableSelect
                      label="Dosage Form"
                      options={dosageForms}
                      value={newForm}
                      onChange={setNewForm}
                      placeholder="Search dosage forms..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newName || !hasCriteria}
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
      )}
    </div>
  )
}
