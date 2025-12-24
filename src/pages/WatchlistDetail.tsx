import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Pencil, Trash2 } from 'lucide-react'
import {
  sampleWatchlists,
  sampleActiveIngredients as watchlistIngredients,
  sampleManufacturers as watchlistManufacturers,
  sampleRoutesOfAdministration as watchlistRoutes,
  sampleDosageForms as watchlistForms
} from '../data/watchlists-sample'
import {
  sampleDrugProducts,
  sampleActiveIngredients,
  sampleManufacturers,
  sampleRoutesOfAdministration,
  sampleDosageForms,
  sampleProductStatuses
} from '../data/search-sample'
import { DrugProductCard } from '../components/search/DrugProductCard'

export default function WatchlistDetail() {
  const { id } = useParams()
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  const watchlist = sampleWatchlists.find(wl => wl.id === id)

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

  const matchingProducts = sampleDrugProducts.filter(product =>
    watchlist.matchingProductIds.includes(product.id)
  )

  const criteriaLabels: { type: string; label: string }[] = []

  if (watchlist.criteria.searchTerm) {
    criteriaLabels.push({ type: 'search', label: `"${watchlist.criteria.searchTerm}"` })
  }
  if (watchlist.criteria.activeIngredientId) {
    const ing = watchlistIngredients.find(i => i.id === watchlist.criteria.activeIngredientId)
    if (ing) criteriaLabels.push({ type: 'ingredient', label: ing.name })
  }
  if (watchlist.criteria.manufacturerId) {
    const mfr = watchlistManufacturers.find(m => m.id === watchlist.criteria.manufacturerId)
    if (mfr) criteriaLabels.push({ type: 'manufacturer', label: mfr.name })
  }
  if (watchlist.criteria.routeId) {
    const route = watchlistRoutes.find(r => r.id === watchlist.criteria.routeId)
    if (route) criteriaLabels.push({ type: 'route', label: route.abbreviation })
  }
  if (watchlist.criteria.dosageFormId) {
    const form = watchlistForms.find(f => f.id === watchlist.criteria.dosageFormId)
    if (form) criteriaLabels.push({ type: 'form', label: form.name })
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link
          to="/watchlists"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Watchlists</span>
        </Link>
      </div>

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
            <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <Pencil className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {criteriaLabels.map((criteria, idx) => (
            <span
              key={idx}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
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

        <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">{watchlist.matchCount}</strong> matching products
          </span>
          {watchlist.newMatchesCount > 0 && (
            <span className="text-secondary-600 dark:text-secondary-400">
              <strong>{watchlist.newMatchesCount}</strong> new this week
            </span>
          )}
          <span>
            Created {new Date(watchlist.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Matching Products
        </h2>

        {matchingProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400">
              No products currently match this watchlist's criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchingProducts.map(product => {
              const activeIngredient = sampleActiveIngredients.find(ai => ai.id === product.activeIngredientId)!
              const manufacturer = sampleManufacturers.find(m => m.id === product.manufacturerId)!
              const route = sampleRoutesOfAdministration.find(r => r.id === product.routeId)!
              const dosageForm = sampleDosageForms.find(df => df.id === product.dosageFormId)!
              const status = sampleProductStatuses.find(s => s.id === product.statusId)!

              return (
                <DrugProductCard
                  key={product.id}
                  product={product}
                  activeIngredient={activeIngredient}
                  manufacturer={manufacturer}
                  route={route}
                  dosageForm={dosageForm}
                  status={status}
                  isExpanded={expandedProductId === product.id}
                  onExpand={() => setExpandedProductId(product.id)}
                  onCollapse={() => setExpandedProductId(null)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
