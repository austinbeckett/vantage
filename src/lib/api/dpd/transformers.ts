// =============================================================================
// DPD Data Transformers
// =============================================================================
// Transform Health Canada DPD API responses to application types

import type { CompleteDPDProduct } from '../../../types/health-canada-api'
import { getStatusInfo, parseStatusCode } from '../status-codes'

// -----------------------------------------------------------------------------
// Unified Drug Product Type (for application use)
// -----------------------------------------------------------------------------

export interface UnifiedDrugProduct {
  // Identifiers
  id: string
  drugCode: number
  din: string

  // Basic info
  brandName: string
  descriptor: string
  className: string

  // Company
  companyCode: number
  companyName: string

  // Active ingredients (can be multiple)
  activeIngredients: Array<{
    name: string
    strength: string
    strengthUnit: string
    dosageValue: string
    dosageUnit: string
  }>

  // Routes of administration (can be multiple)
  routes: Array<{
    code: number
    name: string
  }>

  // Pharmaceutical forms (can be multiple)
  forms: Array<{
    code: number
    name: string
  }>

  // Status
  statusCode: number
  statusName: string
  statusCategory: 'active' | 'inactive' | 'pending'
  statusDate: string | null

  // Status history
  statusHistory: Array<{
    status: string
    date: string
    isCurrent: boolean
  }>

  // Therapeutic classification
  atcCode: string | null
  atcDescription: string | null
  ahfsCode: string | null
  ahfsDescription: string | null

  // Schedules
  schedules: string[]

  // Metadata
  lastUpdated: string
  source: 'DPD'
  numberOfActiveIngredients: number
}

/**
 * Transform a complete DPD product (from multiple API calls) to unified format
 */
export function transformCompleteDPDProduct(
  data: CompleteDPDProduct
): UnifiedDrugProduct {
  const { product, activeIngredients, routes, forms, status, therapeuticClass, schedules } = data

  // Get status info from the single status object
  const statusCode = status?.external_status_code ?? 0
  const statusInfo = getStatusInfo(statusCode)

  // Build status history (now just one entry since API returns single status)
  const statusHistory = status ? [{
    status: status.status,
    date: status.history_date,
    isCurrent: true,
  }] : []

  // Get ATC/AHFS codes
  const atc = therapeuticClass[0]

  return {
    // Identifiers
    id: `dpd-${product.drug_code}`,
    drugCode: product.drug_code,
    din: product.drug_identification_number,

    // Basic info
    brandName: product.brand_name,
    descriptor: product.descriptor || '',
    className: product.class_name || '',

    // Company
    companyCode: product.company_code,
    companyName: product.company_name,

    // Active ingredients
    activeIngredients: activeIngredients.map(ai => ({
      name: ai.ingredient_name,
      strength: ai.strength,
      strengthUnit: ai.strength_unit,
      dosageValue: ai.dosage_value,
      dosageUnit: ai.dosage_unit,
    })),

    // Routes
    routes: routes.map(r => ({
      code: r.route_of_administration_code,
      name: r.route_of_administration_name,
    })),

    // Forms
    forms: forms.map(f => ({
      code: f.pharmaceutical_form_code,
      name: f.pharmaceutical_form_name,
    })),

    // Status
    statusCode,
    statusName: statusInfo?.name ?? 'Unknown',
    statusCategory: statusInfo?.category ?? 'inactive',
    statusDate: status?.history_date ?? null,

    // Status history
    statusHistory,

    // Therapeutic classification
    atcCode: atc?.tc_atc_number ?? null,
    atcDescription: atc?.tc_atc ?? null,
    ahfsCode: atc?.tc_ahfs_number ?? null,
    ahfsDescription: atc?.tc_ahfs ?? null,

    // Schedules
    schedules: schedules.map(s => s.schedule_name),

    // Metadata
    lastUpdated: product.last_update_date,
    source: 'DPD',
    numberOfActiveIngredients: parseInt(product.number_of_ais) || activeIngredients.length,
  }
}

/**
 * Transform basic drug product response (without additional data)
 * Used for search results before expanding
 */
export function transformBasicDPDProduct(
  product: CompleteDPDProduct['product']
): Partial<UnifiedDrugProduct> {
  return {
    id: `dpd-${product.drug_code}`,
    drugCode: product.drug_code,
    din: product.drug_identification_number,
    brandName: product.brand_name,
    descriptor: product.descriptor || '',
    className: product.class_name || '',
    companyCode: product.company_code,
    companyName: product.company_name,
    lastUpdated: product.last_update_date,
    source: 'DPD',
    numberOfActiveIngredients: parseInt(product.number_of_ais) || 0,
  }
}

/**
 * Format active ingredient with strength for display
 */
export function formatActiveIngredient(
  ingredient: UnifiedDrugProduct['activeIngredients'][0]
): string {
  if (ingredient.strength && ingredient.strengthUnit) {
    return `${ingredient.name} ${ingredient.strength} ${ingredient.strengthUnit}`
  }
  return ingredient.name
}

/**
 * Format all active ingredients for display
 */
export function formatActiveIngredients(
  ingredients: UnifiedDrugProduct['activeIngredients']
): string {
  return ingredients.map(formatActiveIngredient).join(', ')
}

/**
 * Get primary active ingredient name
 */
export function getPrimaryIngredient(
  product: UnifiedDrugProduct
): string {
  return product.activeIngredients[0]?.name ?? 'Unknown'
}

/**
 * Get primary route of administration
 */
export function getPrimaryRoute(
  product: UnifiedDrugProduct
): string {
  return product.routes[0]?.name ?? 'Unknown'
}

/**
 * Get primary pharmaceutical form
 */
export function getPrimaryForm(
  product: UnifiedDrugProduct
): string {
  return product.forms[0]?.name ?? 'Unknown'
}

/**
 * Check if product is currently marketed
 */
export function isMarketed(product: UnifiedDrugProduct): boolean {
  return product.statusCode === 2
}

/**
 * Check if product is approved but not yet marketed
 */
export function isApprovedNotMarketed(product: UnifiedDrugProduct): boolean {
  return product.statusCode === 1
}

/**
 * Check if product is discontinued (any cancelled status)
 */
export function isDiscontinued(product: UnifiedDrugProduct): boolean {
  return product.statusCode >= 3 && product.statusCode <= 15
}
