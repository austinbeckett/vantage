// =============================================================================
// NOC Data Transformers
// =============================================================================
// Transform Health Canada NOC API responses to application types

import type { CompleteNOCProduct } from '../../../types/health-canada-api'

// -----------------------------------------------------------------------------
// Unified NOC Type (for application use)
// -----------------------------------------------------------------------------

export interface UnifiedNOCProduct {
  // Identifiers
  id: string
  nocNumber: number

  // NOC details
  nocDate: string
  manufacturerName: string
  submissionType: string
  submissionClass: string
  therapeuticClass: string
  isActiveStatus: boolean
  reasonSupplement: string | null
  reasonSubmission: string | null
  isStatusWithConditions: boolean
  isSupplement: boolean
  isAdmin: boolean
  productType: string

  // Comparative Reference Product (CRP)
  crpProductName: string | null
  crpCompanyName: string | null
  crpCountryName: string | null

  // Associated drug products
  drugProducts: Array<{
    brandId: number
    brandName: string
    productId: number
    din: string
  }>

  // Medicinal ingredients
  ingredients: Array<{
    din: string
    name: string
    strength: string
    unit: string
  }>

  // Dosage forms
  dosageForms: Array<{
    din: string
    formName: string
  }>

  // Routes of administration
  routes: Array<{
    din: string
    route: string
  }>

  // Metadata
  lastUpdated: string
  source: 'NOC'
}

/**
 * Transform a complete NOC product (from multiple API calls) to unified format
 */
export function transformCompleteNOCProduct(
  data: CompleteNOCProduct
): UnifiedNOCProduct {
  const { main, drugProducts, ingredients, dosageForms, routes } = data

  return {
    // Identifiers
    id: `noc-${main.noc_number}`,
    nocNumber: main.noc_number,

    // NOC details
    nocDate: main.noc_date,
    manufacturerName: main.noc_manufacturer_name,
    submissionType: main.noc_on_submission_type,
    submissionClass: main.noc_submission_class,
    therapeuticClass: main.noc_therapeutic_class,
    isActiveStatus: main.noc_active_status === 1,
    reasonSupplement: main.noc_reason_supplement || null,
    reasonSubmission: main.noc_reason_submission || null,
    isStatusWithConditions: main.noc_status_with_conditions === 'Y',
    isSupplement: main.noc_is_suppliment === 'Y',
    isAdmin: main.noc_is_admin === 'Y',
    productType: main.noc_product_type,

    // Comparative Reference Product
    crpProductName: main.noc_crp_product_name || null,
    crpCompanyName: main.noc_crp_company_name || null,
    crpCountryName: main.noc_crp_country_name || null,

    // Drug products
    drugProducts: drugProducts.map(dp => ({
      brandId: dp.noc_br_brand_id,
      brandName: dp.noc_br_brandname,
      productId: dp.noc_br_product_id,
      din: dp.noc_br_din,
    })),

    // Ingredients
    ingredients: ingredients.map(i => ({
      din: String(i.noc_pi_din_product_id),
      name: i.noc_pi_medic_ingr_name,
      strength: i.noc_pi_strength,
      unit: i.noc_pi_unit,
    })),

    // Dosage forms
    dosageForms: dosageForms.map(df => ({
      din: String(df.noc_pf_din_product_id),
      formName: df.noc_pf_form_name,
    })),

    // Routes
    routes: routes.map(r => ({
      din: String(r.noc_pr_din_product_id),
      route: r.noc_pr_route,
    })),

    // Metadata
    lastUpdated: main.noc_last_update_date,
    source: 'NOC',
  }
}

/**
 * Get unique DINs from an NOC product
 */
export function getNOCDINs(product: UnifiedNOCProduct): string[] {
  return [...new Set(product.drugProducts.map(dp => dp.din))]
}

/**
 * Get unique ingredients from an NOC product
 */
export function getNOCIngredientNames(product: UnifiedNOCProduct): string[] {
  return [...new Set(product.ingredients.map(i => i.name))]
}

/**
 * Get unique routes from an NOC product
 */
export function getNOCRouteNames(product: UnifiedNOCProduct): string[] {
  return [...new Set(product.routes.map(r => r.route))]
}

/**
 * Get unique dosage forms from an NOC product
 */
export function getNOCFormNames(product: UnifiedNOCProduct): string[] {
  return [...new Set(product.dosageForms.map(df => df.formName))]
}

/**
 * Check if NOC is for a generic drug (has CRP info)
 */
export function isGenericNOC(product: UnifiedNOCProduct): boolean {
  return product.crpProductName !== null
}

/**
 * Format NOC date for display
 */
export function formatNOCDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}
