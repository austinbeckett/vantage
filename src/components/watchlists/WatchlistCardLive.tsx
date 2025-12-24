// =============================================================================
// Watchlist Card (Live API Version)
// =============================================================================
// Displays a single watchlist with its criteria

import { Eye, Bell, BellOff, Pencil, Trash2, Search, Route, Pill, Loader2, Database, FileCheck, FileSearch, Sparkles } from 'lucide-react'
import type { WatchlistLive } from '../../lib/hooks'

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
  // Search criteria labels (notification-scope)
  const criteriaLabels: { type: string; label: string; icon: React.ReactNode }[] = []

  // Brand name search
  if (watchlist.criteria.searchTerm) {
    const brandNames = watchlist.criteria.searchTerm.split('|').map(s => s.trim())
    brandNames.forEach(name => {
      criteriaLabels.push({
        type: 'search',
        label: `"${name}"`,
        icon: <Search className="w-3 h-3" />,
      })
    })
  }

  // Ingredient name search
  if (watchlist.criteria.ingredientName) {
    const ingredients = watchlist.criteria.ingredientName.split('|').map(s => s.trim())
    ingredients.forEach(name => {
      criteriaLabels.push({
        type: 'ingredient',
        label: name,
        icon: <Pill className="w-3 h-3" />,
      })
    })
  }

  // Route filter (notification-scope)
  watchlist.criteria.routeFilter?.forEach(route => {
    criteriaLabels.push({
      type: 'route',
      label: route,
      icon: <Route className="w-3 h-3" />,
    })
  })

  // Form filter (notification-scope)
  watchlist.criteria.formFilter?.forEach(form => {
    criteriaLabels.push({
      type: 'form',
      label: form,
      icon: <Pill className="w-3 h-3" />,
    })
  })

  return (
    <div className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {watchlist.isGeneratingMetadata ? (
              <>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                  <h3 className="font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                    Generating name...
                  </h3>
                </div>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-2 italic">
                  AI is creating a name and description based on your criteria
                </p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {watchlist.name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                  {watchlist.description}
                </p>
              </>
            )}
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

        {/* Criteria Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {criteriaLabels.map((criteria, idx) => {
            const colorClass =
              criteria.type === 'search'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : criteria.type === 'ingredient'
                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                : criteria.type === 'route'
                ? 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
                : criteria.type === 'form'
                ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${colorClass}`}
              >
                {criteria.icon}
                <span className="truncate max-w-[120px]">{criteria.label}</span>
              </span>
            )
          })}
        </div>

        {/* Source Counts (when available) */}
        {watchlist.cachedCounts && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              <Database className="w-2.5 h-2.5" />
              {watchlist.cachedCounts.dpd}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300">
              <FileCheck className="w-2.5 h-2.5" />
              {watchlist.cachedCounts.noc}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300">
              <FileSearch className="w-2.5 h-2.5" />
              {watchlist.cachedCounts.gsur}
            </span>
            {watchlist.cachedCounts.newSinceLastView > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500 text-white">
                <Sparkles className="w-2.5 h-2.5" />
                {watchlist.cachedCounts.newSinceLastView} new
              </span>
            )}
          </div>
        )}

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
          disabled={watchlist.isGeneratingMetadata}
          className={`
            flex items-center justify-center p-3 transition-colors
            ${watchlist.isGeneratingMetadata
              ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
            }
          `}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          disabled={watchlist.isGeneratingMetadata}
          className={`
            flex items-center justify-center p-3 transition-colors
            ${watchlist.isGeneratingMetadata
              ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
              : 'text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20'
            }
          `}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
