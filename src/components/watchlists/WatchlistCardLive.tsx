// =============================================================================
// Watchlist Card (Live API Version)
// =============================================================================
// Displays a single watchlist with its criteria

import { Eye, Bell, BellOff, Pencil, Trash2, Search, Building2, Route, Pill, Filter, Hash, Activity, Tag, Calendar, Dna } from 'lucide-react'
import type { WatchlistLive } from '../../lib/hooks'
import { getStatusName } from '../../lib/api/status-codes'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface WatchlistCardLiveProps {
  watchlist: WatchlistLive
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleNotifications?: () => void
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function WatchlistCardLive({
  watchlist,
  onView,
  onEdit,
  onDelete,
  onToggleNotifications,
}: WatchlistCardLiveProps) {
  // Primary search criteria (API-supported)
  const searchLabels: { type: string; label: string; icon: React.ReactNode }[] = []
  // Post-search filters (client-side)
  const filterLabels: { type: string; label: string; icon: React.ReactNode }[] = []

  // DIN is a primary search criterion
  if (watchlist.criteria.din) {
    searchLabels.push({
      type: 'din',
      label: `DIN: ${watchlist.criteria.din}`,
      icon: <Hash className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.searchTerm) {
    searchLabels.push({
      type: 'search',
      label: `"${watchlist.criteria.searchTerm}"`,
      icon: <Search className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.ingredientName) {
    searchLabels.push({
      type: 'ingredient',
      label: watchlist.criteria.ingredientName,
      icon: <Pill className="w-3 h-3" />,
    })
  }
  // Primary filters
  if (watchlist.criteria.companyNameFilter) {
    filterLabels.push({
      type: 'company',
      label: watchlist.criteria.companyNameFilter,
      icon: <Building2 className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.routeNameFilter) {
    filterLabels.push({
      type: 'route',
      label: watchlist.criteria.routeNameFilter,
      icon: <Route className="w-3 h-3" />,
    })
  }
  // Advanced filters
  if (watchlist.criteria.statusFilter) {
    filterLabels.push({
      type: 'status',
      label: getStatusName(watchlist.criteria.statusFilter),
      icon: <Activity className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.formNameFilter) {
    filterLabels.push({
      type: 'form',
      label: watchlist.criteria.formNameFilter,
      icon: <Pill className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.classFilter) {
    filterLabels.push({
      type: 'class',
      label: watchlist.criteria.classFilter,
      icon: <Tag className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.scheduleFilter) {
    filterLabels.push({
      type: 'schedule',
      label: watchlist.criteria.scheduleFilter,
      icon: <Calendar className="w-3 h-3" />,
    })
  }
  if (watchlist.criteria.atcFilter) {
    filterLabels.push({
      type: 'atc',
      label: watchlist.criteria.atcFilter,
      icon: <Dna className="w-3 h-3" />,
    })
  }

  const hasFilters = filterLabels.length > 0

  return (
    <div className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {watchlist.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
              {watchlist.description}
            </p>
          </div>
          <button
            onClick={onToggleNotifications}
            className={`
              p-2 rounded-lg transition-colors shrink-0
              ${watchlist.notificationsActive
                ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                : 'text-neutral-400 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }
            `}
            title={watchlist.notificationsActive ? 'Notifications on' : 'Notifications paused'}
          >
            {watchlist.notificationsActive ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search Criteria Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {searchLabels.map((criteria, idx) => (
            <span
              key={idx}
              className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                ${criteria.type === 'din'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : criteria.type === 'search'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                }
              `}
            >
              {criteria.icon}
              <span className="truncate max-w-[120px]">{criteria.label}</span>
            </span>
          ))}
        </div>

        {/* Filter Tags */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-0.5">
              <Filter className="w-2.5 h-2.5" />
            </span>
            {filterLabels.map((criteria, idx) => {
              const colorClass =
                criteria.type === 'company' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : criteria.type === 'route' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : criteria.type === 'status' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : criteria.type === 'form' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : criteria.type === 'class' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                : criteria.type === 'schedule' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : criteria.type === 'atc' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400';
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClass}`}
                >
                  {criteria.icon}
                  <span className="truncate max-w-[80px]">{criteria.label}</span>
                </span>
              )
            })}
          </div>
        )}

        <div className="mb-2" />

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            Created {new Date(watchlist.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Results
        </button>
        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
        <button
          onClick={onEdit}
          className="flex items-center justify-center p-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
