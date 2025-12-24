// =============================================================================
// NOC (Notice of Compliance) Search Edge Function
// =============================================================================
// Searches Health Canada's NOC database by medicinal ingredient name
// Uses the official NOC API and caches results for performance
// Docs: https://health-products.canada.ca/api/documentation/noc-documentation-en.html

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface NOCMainResponse {
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
  noc_active_status: string
  noc_reason_supplement: string
  noc_reason_submission: string
  noc_therapeutic_class: string
  noc_last_update_date: string
}

interface NOCIngredientResponse {
  noc_number: number
  noc_pi_din_product_id: number
  noc_pi_medic_ingr_name: string
  noc_pi_strength: number
  noc_pi_unit: string
  noc_pi_basic_unit: string
}

interface NOCDrugProductResponse {
  noc_number: number
  noc_br_brand_id: number
  noc_br_brandname: string
  noc_br_product_id: number
  noc_br_din: string
}

interface NOCSearchResult {
  nocNumber: number
  nocDate: string
  manufacturer: string
  submissionType: string
  submissionClass: string
  therapeuticClass: string
  productType: string
  isNOCWithConditions: boolean
  isSupplement: boolean
  reasonSupplement: string | null
  reasonSubmission: string | null
  // Comparative Reference Product (for generics)
  crpProductName: string | null
  crpCompanyName: string | null
  crpCountryName: string | null
  // Matched ingredients
  matchedIngredients: Array<{
    name: string
    strength: number
    unit: string
  }>
  // Brand names and DINs
  brandNames: string[]
  dins: string[]
}

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

interface CacheData {
  main: Map<number, NOCMainResponse>
  ingredients: NOCIngredientResponse[]
  drugProducts: Map<number, NOCDrugProductResponse[]>
  timestamp: number
}

let cache: CacheData | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function isCacheValid(): boolean {
  return cache !== null && Date.now() - cache.timestamp < CACHE_TTL
}

// -----------------------------------------------------------------------------
// API Fetching
// -----------------------------------------------------------------------------

const NOC_API_BASE = 'https://health-products.canada.ca/api/notice-of-compliance'

async function fetchAllNOCData(): Promise<CacheData> {
  console.log('Fetching NOC data from Health Canada API...')
  const startTime = Date.now()

  // Fetch main NOC data and ingredients in parallel
  const [mainResponse, ingredientsResponse, drugProductsResponse] = await Promise.all([
    fetch(`${NOC_API_BASE}/noticeofcompliancemain/?lang=en&type=json`),
    fetch(`${NOC_API_BASE}/medicinalingredient/?lang=en&type=json`),
    fetch(`${NOC_API_BASE}/drugproduct/?lang=en&type=json`),
  ])

  if (!mainResponse.ok || !ingredientsResponse.ok || !drugProductsResponse.ok) {
    throw new Error('Failed to fetch NOC data from Health Canada API')
  }

  const mainData: NOCMainResponse[] = await mainResponse.json()
  const ingredientsData: NOCIngredientResponse[] = await ingredientsResponse.json()
  const drugProductsData: NOCDrugProductResponse[] = await drugProductsResponse.json()

  // Index main data by NOC number
  const mainMap = new Map<number, NOCMainResponse>()
  for (const item of mainData) {
    mainMap.set(item.noc_number, item)
  }

  // Index drug products by NOC number
  const drugProductsMap = new Map<number, NOCDrugProductResponse[]>()
  for (const item of drugProductsData) {
    if (!drugProductsMap.has(item.noc_number)) {
      drugProductsMap.set(item.noc_number, [])
    }
    drugProductsMap.get(item.noc_number)!.push(item)
  }

  const elapsed = Date.now() - startTime
  console.log(`Fetched ${mainData.length} NOC entries, ${ingredientsData.length} ingredients, ${drugProductsData.length} drug products in ${elapsed}ms`)

  return {
    main: mainMap,
    ingredients: ingredientsData,
    drugProducts: drugProductsMap,
    timestamp: Date.now(),
  }
}

async function ensureCache(): Promise<CacheData> {
  if (!isCacheValid()) {
    cache = await fetchAllNOCData()
  }
  return cache!
}

// -----------------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------------

function searchByIngredient(
  data: CacheData,
  ingredientQuery: string,
  limit: number = 100
): NOCSearchResult[] {
  const query = ingredientQuery.toUpperCase().trim()
  if (query.length < 3) {
    return []
  }

  // Find all ingredients matching the query
  const matchingIngredients = data.ingredients.filter(ing =>
    ing.noc_pi_medic_ingr_name.toUpperCase().includes(query)
  )

  // Group by NOC number
  const nocIngredientMap = new Map<number, NOCIngredientResponse[]>()
  for (const ing of matchingIngredients) {
    if (!nocIngredientMap.has(ing.noc_number)) {
      nocIngredientMap.set(ing.noc_number, [])
    }
    nocIngredientMap.get(ing.noc_number)!.push(ing)
  }

  // Build results with main NOC data
  const results: NOCSearchResult[] = []

  for (const [nocNumber, ingredients] of nocIngredientMap) {
    const main = data.main.get(nocNumber)
    if (!main) continue

    // Get drug products for this NOC
    const drugProducts = data.drugProducts.get(nocNumber) || []
    const brandNames = [...new Set(drugProducts.map(dp => dp.noc_br_brandname).filter(Boolean))]
    const dins = [...new Set(drugProducts.map(dp => dp.noc_br_din).filter(Boolean))]

    results.push({
      nocNumber: main.noc_number,
      nocDate: main.noc_date,
      manufacturer: main.noc_manufacturer_name,
      submissionType: main.noc_on_submission_type,
      submissionClass: main.noc_submission_class,
      therapeuticClass: main.noc_therapeutic_class,
      productType: main.noc_product_type,
      isNOCWithConditions: main.noc_status_with_conditions === 'Y',
      isSupplement: main.noc_is_suppliment === 'Y',
      reasonSupplement: main.noc_reason_supplement || null,
      reasonSubmission: main.noc_reason_submission || null,
      crpProductName: main.noc_crp_product_name || null,
      crpCompanyName: main.noc_crp_company_name || null,
      crpCountryName: main.noc_crp_country_name || null,
      matchedIngredients: ingredients.map(ing => ({
        name: ing.noc_pi_medic_ingr_name,
        strength: ing.noc_pi_strength,
        unit: ing.noc_pi_unit,
      })),
      brandNames,
      dins,
    })
  }

  // Sort by NOC date (newest first) and limit results
  results.sort((a, b) => new Date(b.nocDate).getTime() - new Date(a.nocDate).getTime())

  return results.slice(0, limit)
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const url = new URL(req.url)
    const ingredient = url.searchParams.get('ingredient')
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)

    if (!ingredient || ingredient.trim().length < 3) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Ingredient parameter must be at least 3 characters',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Ensure cache is populated
    const data = await ensureCache()

    // Search
    const results = searchByIngredient(data, ingredient, limit)

    console.log(`Search for "${ingredient}" returned ${results.length} results`)

    return new Response(JSON.stringify(results), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache response for 5 minutes
      },
    })
  } catch (error) {
    console.error('NOC search error:', error)

    return new Response(
      JSON.stringify({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
