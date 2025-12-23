// =============================================================================
// Search & Discovery Data Types
// =============================================================================

export interface RegulatoryTimelineEvent {
  date: string
  event: string
  database: 'DPD' | 'NOC' | 'GSUR'
}

export interface DrugProduct {
  id: string
  din: string
  productName: string
  activeIngredientId: string
  manufacturerId: string
  routeId: string
  dosageFormId: string
  atcClassificationId: string
  statusId: string
  strength: string
  lastUpdated: string
  regulatoryTimeline: RegulatoryTimelineEvent[]
}

export interface ActiveIngredient {
  id: string
  name: string
  category: string
}

export interface Manufacturer {
  id: string
  name: string
  country: string
}

export interface RouteOfAdministration {
  id: string
  name: string
  abbreviation: string
}

export interface DosageForm {
  id: string
  name: string
  type: string
}

export interface ATCClassification {
  id: string
  code: string
  description: string
}

export interface ProductStatus {
  id: string
  name: 'Approved' | 'Marketed' | 'Discontinued' | 'Expired'
  description: string
}

export interface ActiveFilter {
  type: 'activeIngredient' | 'manufacturer' | 'route' | 'dosageForm'
  id: string
  label: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface SearchAndDiscoveryProps {
  /** The list of drug products to display */
  drugProducts: DrugProduct[]
  /** Available active ingredients for filtering */
  activeIngredients: ActiveIngredient[]
  /** Available manufacturers for filtering */
  manufacturers: Manufacturer[]
  /** Available routes of administration for filtering */
  routesOfAdministration: RouteOfAdministration[]
  /** Available dosage forms for filtering */
  dosageForms: DosageForm[]
  /** ATC classification codes */
  atcClassifications: ATCClassification[]
  /** Product status options */
  productStatuses: ProductStatus[]
  /** Called when user performs a search query */
  onSearch?: (query: string) => void
  /** Called when user clicks on an attribute to add it as a filter */
  onAttributeSelect?: (filter: ActiveFilter) => void
  /** Called when user removes a filter badge */
  onFilterRemove?: (filter: ActiveFilter) => void
  /** Called when user wants to add a drug to a watchlist */
  onAddToWatchlist?: (drugProductId: string) => void
  /** Called when user wants to view the full regulatory history */
  onViewHistory?: (drugProductId: string) => void
  /** Called when user expands a drug product inline */
  onExpand?: (drugProductId: string) => void
  /** Called when user collapses an expanded drug product */
  onCollapse?: (drugProductId: string) => void
  /** Called when user toggles between table and card view */
  onViewToggle?: (view: 'table' | 'card') => void
}
