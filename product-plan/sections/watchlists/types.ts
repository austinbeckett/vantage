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
  /** The list of watchlists to display */
  watchlists: Watchlist[]
  /** Available active ingredients for filtering */
  activeIngredients: ActiveIngredient[]
  /** Available manufacturers for filtering */
  manufacturers: Manufacturer[]
  /** Available routes of administration for filtering */
  routesOfAdministration: RouteOfAdministration[]
  /** Available dosage forms for filtering */
  dosageForms: DosageForm[]
  /** Called when user wants to view a watchlist's matching products */
  onView?: (id: string) => void
  /** Called when user wants to edit a watchlist's criteria */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a watchlist */
  onDelete?: (id: string) => void
  /** Called when user wants to toggle notifications for a watchlist */
  onToggleNotifications?: (id: string) => void
  /** Called when user wants to create a new watchlist */
  onCreate?: () => void
}

export interface WatchlistCardProps {
  /** The watchlist to display */
  watchlist: Watchlist
  /** Available active ingredients for displaying criteria */
  activeIngredients: ActiveIngredient[]
  /** Available manufacturers for displaying criteria */
  manufacturers: Manufacturer[]
  /** Available routes of administration for displaying criteria */
  routesOfAdministration: RouteOfAdministration[]
  /** Available dosage forms for displaying criteria */
  dosageForms: DosageForm[]
  /** Called when user clicks to view the watchlist */
  onView?: () => void
  /** Called when user wants to edit the watchlist */
  onEdit?: () => void
  /** Called when user wants to delete the watchlist */
  onDelete?: () => void
  /** Called when user toggles notifications */
  onToggleNotifications?: () => void
}

export interface CreateWatchlistModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Available active ingredients for criteria selection */
  activeIngredients: ActiveIngredient[]
  /** Available manufacturers for criteria selection */
  manufacturers: Manufacturer[]
  /** Available routes of administration for criteria selection */
  routesOfAdministration: RouteOfAdministration[]
  /** Available dosage forms for criteria selection */
  dosageForms: DosageForm[]
  /** Called when user saves the new watchlist */
  onSave?: (watchlist: Omit<Watchlist, 'id' | 'matchCount' | 'newMatchesCount' | 'recentUpdatesCount' | 'createdAt' | 'lastUpdated' | 'recentActivity' | 'matchingProductIds'>) => void
  /** Called when user closes the modal */
  onClose?: () => void
}

export interface EditWatchlistModalProps {
  /** The watchlist being edited */
  watchlist: Watchlist
  /** Whether the modal is open */
  isOpen: boolean
  /** Available active ingredients for criteria selection */
  activeIngredients: ActiveIngredient[]
  /** Available manufacturers for criteria selection */
  manufacturers: Manufacturer[]
  /** Available routes of administration for criteria selection */
  routesOfAdministration: RouteOfAdministration[]
  /** Available dosage forms for criteria selection */
  dosageForms: DosageForm[]
  /** Called when user saves the edited watchlist */
  onSave?: (watchlist: Watchlist) => void
  /** Called when user closes the modal */
  onClose?: () => void
}
