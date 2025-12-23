// =============================================================================
// Data Types
// =============================================================================

export interface WatchlistCriteria {
  searchTerm: string | null
  activeIngredientId: string | null
  manufacturerId: string | null
  routeId: string | null
  dosageFormId: string | null
}

export interface RecentActivity {
  id: string
  drugProductId: string
  drugProductName: string
  event: string
  database: 'DPD' | 'NOC' | 'GSUR'
  date: string
  isNew: boolean
}

export interface Watchlist {
  id: string
  name: string
  description: string
  criteria: WatchlistCriteria
  notificationsActive: boolean
  matchCount: number
  newMatchesCount: number
  recentUpdatesCount: number
  createdAt: string
  lastUpdated: string
  recentActivity: RecentActivity[]
  matchingProductIds: string[]
}

export interface ActiveIngredient {
  id: string
  name: string
}

export interface Manufacturer {
  id: string
  name: string
}

export interface RouteOfAdministration {
  id: string
  name: string
  abbreviation: string
}

export interface DosageForm {
  id: string
  name: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface WatchlistsProps {
  watchlists: Watchlist[]
  activeIngredients: ActiveIngredient[]
  manufacturers: Manufacturer[]
  routesOfAdministration: RouteOfAdministration[]
  dosageForms: DosageForm[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleNotifications?: (id: string) => void
  onCreate?: () => void
}

export interface WatchlistCardProps {
  watchlist: Watchlist
  activeIngredients: ActiveIngredient[]
  manufacturers: Manufacturer[]
  routesOfAdministration: RouteOfAdministration[]
  dosageForms: DosageForm[]
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleNotifications?: () => void
}
