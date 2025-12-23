// =============================================================================
// Health Canada API Response Types
// =============================================================================
// These types match the exact structure of Health Canada's API responses.
// Documentation: https://health-products.canada.ca/api/documentation/dpd-documentation-en.html
// Documentation: https://health-products.canada.ca/api/documentation/noc-documentation-en.html

// -----------------------------------------------------------------------------
// Drug Product Database (DPD) API Response Types
// Base URL: https://health-products.canada.ca/api/drug/
// -----------------------------------------------------------------------------

/**
 * DPD Drug Product Response
 * Endpoint: /drugproduct/
 * Params: id (drug_code), din, brandname, status (1-15)
 */
export interface DPDDrugProductResponse {
  drug_code: number
  class_name: string
  drug_identification_number: string
  brand_name: string
  descriptor: string
  pediatric_flag: string
  accession_number: string
  number_of_ais: string
  last_update_date: string
  ai_group_no: string
  company_code: number
  company_name: string
  company_type: string
  suite_number: string
  street_name: string
  city_name: string
  province: string
  country: string
  postal_code: string
  post_office_box: string
}

/**
 * DPD Active Ingredient Response
 * Endpoint: /activeingredient/
 * Params: id (drug_code), ingredientname
 */
export interface DPDActiveIngredientResponse {
  drug_code: number
  active_ingredient_code: number
  ingredient_name: string
  ingredient_supplied_ind: string
  strength: string
  strength_unit: string
  strength_type: string
  dosage_value: string
  dosage_unit: string
  notes: string
  ingredient_f: string
  strength_unit_f: string
  strength_type_f: string
  dosage_unit_f: string
}

/**
 * DPD Route of Administration Response
 * Endpoint: /route/
 * Params: id (drug_code), active
 */
export interface DPDRouteResponse {
  drug_code: number
  route_of_administration_code: number
  route_of_administration_name: string
  route_of_administration_name_f: string
}

/**
 * DPD Pharmaceutical Form Response
 * Endpoint: /form/
 * Params: id (drug_code), active
 */
export interface DPDFormResponse {
  drug_code: number
  pharmaceutical_form_code: number
  pharmaceutical_form_name: string
  pharmaceutical_form_name_f: string
}

/**
 * DPD Product Status Response
 * Endpoint: /status/
 * Params: id (drug_code)
 * Note: Returns a single object when queried with id, not an array
 */
export interface DPDStatusResponse {
  drug_code: number
  status: string
  history_date: string
  original_market_date: string | null
  external_status_code: number
  expiration_date: string | null
  lot_number: string
}

/**
 * DPD Therapeutic Class Response
 * Endpoint: /therapeuticclass/
 * Params: id (drug_code)
 */
export interface DPDTherapeuticClassResponse {
  drug_code: number
  tc_atc_number: string
  tc_atc: string
  tc_atc_f: string
  tc_ahfs_number: string
  tc_ahfs: string
  tc_ahfs_f: string
}

/**
 * DPD Schedule Response
 * Endpoint: /schedule/
 * Params: id (drug_code), active
 */
export interface DPDScheduleResponse {
  drug_code: number
  schedule_name: string
  schedule_name_f: string
}

/**
 * DPD Company Response
 * Endpoint: /company/
 * Params: id (company_code)
 */
export interface DPDCompanyResponse {
  company_code: number
  company_name: string
  company_type: string
  suite_number: string
  street_name: string
  city_name: string
  province_name: string
  country_name: string
  postal_code: string
  post_office_box: string
}

/**
 * DPD Packaging Response
 * Endpoint: /packaging/
 * Params: id (drug_code)
 */
export interface DPDPackagingResponse {
  drug_code: number
  upc: string
  package_size_unit: string
  package_type: string
  package_size: string
  product_information: string
  package_size_unit_f: string
  package_type_f: string
}

/**
 * DPD Pharmaceutical Standard Response
 * Endpoint: /pharmaceuticalstd/
 * Params: id (drug_code)
 */
export interface DPDPharmaceuticalStdResponse {
  drug_code: number
  pharmaceutical_std: string
}

/**
 * DPD Veterinary Species Response
 * Endpoint: /veterinaryspecies/
 * Params: id (drug_code)
 */
export interface DPDVeterinarySpeciesResponse {
  drug_code: number
  vet_species_name: string
  vet_species_name_f: string
}

// -----------------------------------------------------------------------------
// Notice of Compliance (NOC) API Response Types
// Base URL: https://health-products.canada.ca/api/notice-of-compliance/
// -----------------------------------------------------------------------------

/**
 * NOC Main Response
 * Endpoint: /noticeofcompliancemain/
 * Params: id (noc_number), lang, type
 */
export interface NOCMainResponse {
  noc_number: number
  noc_date: string
  noc_manufacturer_name: string
  noc_status_with_conditions: string
  noc_on_submission_type: string
  noc_is_suppliment: string
  noc_submission_class: string
  noc_is_admin: string
  noc_product_type: string
  noc_crp_product_name: string
  noc_crp_company_name: string
  noc_crp_country_name: string
  noc_active_status: number
  noc_reason_supplement: string
  noc_reason_submission: string
  noc_therapeutic_class: string
  noc_last_update_date: string
}

/**
 * NOC Drug Product Response
 * Endpoint: /drugproduct/
 * Params: id (noc_number), lang, type
 */
export interface NOCDrugProductResponse {
  noc_number: number
  noc_br_brand_id: number
  noc_br_brandname: string
  noc_br_product_id: number
  noc_br_din: string
}

/**
 * NOC Medicinal Ingredient Response
 * Endpoint: /medicinalingredient/
 * Params: id (noc_number), lang, type
 */
export interface NOCMedicinalIngredientResponse {
  noc_number: number
  noc_pi_din_product_id: number
  noc_pi_medic_ingr_name: string
  noc_pi_strength: string
  noc_pi_unit: string
  noc_pi_basic_unit: string
}

/**
 * NOC Dosage Form Response
 * Endpoint: /dosageform/
 * Params: id (noc_number), lang, type
 */
export interface NOCDosageFormResponse {
  noc_number: number
  noc_pf_din_product_id: number
  noc_pf_form_name: string
}

/**
 * NOC Route of Administration Response
 * Endpoint: /route/
 * Params: id (noc_number), lang, type
 */
export interface NOCRouteResponse {
  noc_number: number
  noc_pr_din_product_id: number
  noc_pr_route: string
}

/**
 * NOC Veterinary Species Response
 * Endpoint: /vetspecies/
 * Params: id (noc_number), lang, type
 */
export interface NOCVetSpeciesResponse {
  noc_number: number
  vet_species_desc: string
}

// -----------------------------------------------------------------------------
// Web Scraped Data Types (GSUR / SUR)
// These sources do not have APIs and require HTML scraping
// -----------------------------------------------------------------------------

/**
 * Generic Submissions Under Review (GSUR)
 * Source: https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/generic-submissions-under-review.html
 * Updated: Monthly
 */
export interface GSUREntry {
  medicinal_ingredients: string
  company_name: string
  therapeutic_area: string
  year_month_accepted: string // Format: YYYY-MM
}

/**
 * Submissions Under Review (SUR)
 * Source: https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/submissions-under-review.html
 * Updated: Monthly
 */
export interface SUREntry {
  medicinal_ingredients: string
  year_month_accepted: string // Format: YYYY-MM
  therapeutic_area: string
  company_sponsor_name: string
  submission_class: string
}

// -----------------------------------------------------------------------------
// Aggregated Product Data (combines multiple API calls)
// -----------------------------------------------------------------------------

/**
 * Complete DPD product data aggregated from multiple endpoints
 */
export interface CompleteDPDProduct {
  product: DPDDrugProductResponse
  activeIngredients: DPDActiveIngredientResponse[]
  routes: DPDRouteResponse[]
  forms: DPDFormResponse[]
  status: DPDStatusResponse  // Single status object (API returns object, not array)
  therapeuticClass: DPDTherapeuticClassResponse[]
  schedules: DPDScheduleResponse[]
}

/**
 * Complete NOC data aggregated from multiple endpoints
 */
export interface CompleteNOCProduct {
  main: NOCMainResponse
  drugProducts: NOCDrugProductResponse[]
  ingredients: NOCMedicinalIngredientResponse[]
  dosageForms: NOCDosageFormResponse[]
  routes: NOCRouteResponse[]
}

// -----------------------------------------------------------------------------
// API Query Parameters
// -----------------------------------------------------------------------------

export interface DPDDrugProductParams {
  id?: number // drug_code
  din?: string
  brandname?: string
  status?: number // 1-15
  lang?: 'en' | 'fr'
  type?: 'json' | 'xml'
}

export interface DPDActiveIngredientParams {
  id?: number // drug_code
  ingredientname?: string
  lang?: 'en' | 'fr'
  type?: 'json' | 'xml'
}

export interface DPDCommonParams {
  id: number // drug_code
  active?: 'yes'
  lang?: 'en' | 'fr'
  type?: 'json' | 'xml'
}

export interface NOCParams {
  id: number // noc_number
  lang?: 'en' | 'fr'
  type?: 'json' | 'xml'
}
