import { Bell, BellOff, MoreHorizontal, Pencil, Trash2, Eye, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { WatchlistCardProps } from '../../types/watchlists'

export function WatchlistCard({
  watchlist,
  activeIngredients,
  manufacturers,
  routesOfAdministration,
  dosageForms,
  onView,
  onEdit,
  onDelete,
  onToggleNotifications
}: WatchlistCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const criteriaLabels: { type: string; label: string }[] = []

  if (watchlist.criteria.searchTerm) {
    criteriaLabels.push({ type: 'search', label: `"${watchlist.criteria.searchTerm}"` })
  }
  if (watchlist.criteria.activeIngredientId) {
    const ing = activeIngredients.find(i => i.id === watchlist.criteria.activeIngredientId)
    if (ing) criteriaLabels.push({ type: 'ingredient', label: ing.name })
  }
  if (watchlist.criteria.manufacturerId) {
    const mfr = manufacturers.find(m => m.id === watchlist.criteria.manufacturerId)
    if (mfr) criteriaLabels.push({ type: 'manufacturer', label: mfr.name })
  }
  if (watchlist.criteria.routeId) {
    const route = routesOfAdministration.find(r => r.id === watchlist.criteria.routeId)
    if (route) criteriaLabels.push({ type: 'route', label: route.abbreviation })
  }
  if (watchlist.criteria.dosageFormId) {
    const form = dosageForms.find(f => f.id === watchlist.criteria.dosageFormId)
    if (form) criteriaLabels.push({ type: 'form', label: form.name })
  }

  const hasNewActivity = watchlist.newMatchesCount > 0

  return (
    <div
      className={`
        group relative
        bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        rounded-2xl
        overflow-hidden
        hover:border-primary-500/30 dark:hover:border-primary-500/30
        hover:shadow-lg hover:shadow-primary-500/5
        transition-all duration-300
        ${hasNewActivity ? 'ring-2 ring-secondary-500/20' : ''}
      `}
    >
      {hasNewActivity && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-400 to-secondary-500" />
      )}

      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <button
              onClick={onView}
              className="group/title flex items-center gap-2 text-left"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover/title:text-primary-600 dark:group-hover/title:text-primary-400 transition-colors">
                {watchlist.name}
              </h3>
            </button>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
              {watchlist.description}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="
                p-2 rounded-lg
                text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300
                hover:bg-neutral-100 dark:hover:bg-neutral-800
                transition-colors
              "
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onView?.()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View matches
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit?.()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit criteria
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onToggleNotifications?.()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    {watchlist.notificationsActive ? (
                      <>
                        <BellOff className="w-4 h-4" />
                        Pause notifications
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Resume notifications
                      </>
                    )}
                  </button>
                  <div className="border-t border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete?.()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete watchlist
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {criteriaLabels.map((criteria, idx) => (
            <span
              key={idx}
              className={`
                inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
                ${criteria.type === 'search'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : criteria.type === 'ingredient'
                  ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                  : criteria.type === 'manufacturer'
                  ? 'bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300'
                  : criteria.type === 'route'
                  ? 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
                  : 'bg-lavender-100 dark:bg-lavender-800 text-lavender-600 dark:text-lavender-400'
                }
              `}
            >
              {criteria.label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {watchlist.matchCount}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                {watchlist.matchCount === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {watchlist.newMatchesCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
                <span className="font-medium text-secondary-600 dark:text-secondary-400">
                  {watchlist.newMatchesCount} new
                </span>
              </div>
            )}

            {watchlist.recentUpdatesCount > 0 && watchlist.newMatchesCount === 0 && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {watchlist.recentUpdatesCount} recent {watchlist.recentUpdatesCount === 1 ? 'update' : 'updates'}
              </div>
            )}
          </div>

          <button
            onClick={onToggleNotifications}
            className={`
              p-2 rounded-lg transition-colors
              ${watchlist.notificationsActive
                ? 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
        </div>
      </div>

      {watchlist.recentActivity.length > 0 && (
        <div className="px-5 pb-4 relative z-10">
          <div className="p-3 bg-neutral-50/80 dark:bg-neutral-800/50 rounded-xl">
            <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Latest Activity
            </div>
            <div className="space-y-2">
              {watchlist.recentActivity.slice(0, 2).map(activity => (
                <div key={activity.id} className="flex items-start gap-2">
                  <div className={`
                    w-1.5 h-1.5 rounded-full mt-1.5 shrink-0
                    ${activity.isNew ? 'bg-secondary-500' : 'bg-neutral-400'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                      {activity.drugProductName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {activity.event} · {activity.database}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onView}
        className="absolute inset-0 z-0"
        aria-label={`View ${watchlist.name}`}
      />
    </div>
  )
}
