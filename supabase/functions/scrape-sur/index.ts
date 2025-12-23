// =============================================================================
// SUR (Submissions Under Review) Scraper
// =============================================================================
// Supabase Edge Function to scrape Health Canada's SUR HTML page
// Source: https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/submissions-under-review.html

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

const SUR_URL = 'https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/submissions-under-review.html'

interface SUREntry {
  medicinal_ingredients: string
  year_month_accepted: string
  therapeutic_area: string
  company_sponsor_name: string
  submission_class: string
}

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
    console.log('Fetching SUR page...')

    // Fetch the HTML page
    const response = await fetch(SUR_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VantageBot/1.0; +https://vantage.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch SUR page: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`Received ${html.length} bytes of HTML`)

    // Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    // Find data tables - SUR page may have multiple tables
    // One for submissions under review, one for completed submissions
    const tables = doc.querySelectorAll('table')
    const allEntries: SUREntry[] = []

    for (const table of tables) {
      const headers = table.querySelectorAll('th')
      const headerTexts = Array.from(headers).map(th => th.textContent?.toLowerCase() || '')

      // Check if this is a SUR-related table
      const hasMedicinalIngredient = headerTexts.some(h =>
        h.includes('medicinal ingredient') || h.includes('drug')
      )

      if (!hasMedicinalIngredient) continue

      // Determine column positions based on headers
      let ingredientCol = 0
      let dateCol = 1
      let areaCol = 2
      let companyCol = 3
      let classCol = 4

      headerTexts.forEach((text, idx) => {
        if (text.includes('medicinal ingredient') || text.includes('drug name')) {
          ingredientCol = idx
        } else if (text.includes('year') || text.includes('month') || text.includes('accept')) {
          dateCol = idx
        } else if (text.includes('therapeutic') || text.includes('area')) {
          areaCol = idx
        } else if (text.includes('company') || text.includes('sponsor')) {
          companyCol = idx
        } else if (text.includes('class') || text.includes('submission')) {
          classCol = idx
        }
      })

      // Extract rows
      const rows = table.querySelectorAll('tbody tr')

      for (const row of rows) {
        const cells = row.querySelectorAll('td')

        if (cells.length >= 3) {
          const entry: SUREntry = {
            medicinal_ingredients: cells[ingredientCol]?.textContent?.trim() || '',
            year_month_accepted: cells[dateCol]?.textContent?.trim() || '',
            therapeutic_area: cells[areaCol]?.textContent?.trim() || '',
            company_sponsor_name: cells[companyCol]?.textContent?.trim() || 'Not available',
            submission_class: cells[classCol]?.textContent?.trim() || 'Not available',
          }

          // Only add if we have at least the medicinal ingredient
          if (entry.medicinal_ingredients) {
            allEntries.push(entry)
          }
        }
      }
    }

    // If no entries found from table parsing, try alternative approach
    if (allEntries.length === 0) {
      console.log('No entries found via table parsing, trying alternative approach...')

      // Look for any table with multiple rows
      for (const table of tables) {
        const rows = table.querySelectorAll('tbody tr')

        for (const row of rows) {
          const cells = row.querySelectorAll('td')

          if (cells.length >= 4) {
            const entry: SUREntry = {
              medicinal_ingredients: cells[0]?.textContent?.trim() || '',
              year_month_accepted: cells[1]?.textContent?.trim() || '',
              therapeutic_area: cells[2]?.textContent?.trim() || '',
              company_sponsor_name: cells[3]?.textContent?.trim() || 'Not available',
              submission_class: cells[4]?.textContent?.trim() || 'Not available',
            }

            if (entry.medicinal_ingredients && !entry.medicinal_ingredients.includes('Medicinal')) {
              allEntries.push(entry)
            }
          }
        }
      }
    }

    console.log(`Extracted ${allEntries.length} SUR entries`)

    return new Response(JSON.stringify(allEntries), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('SUR scraper error:', error)

    return new Response(
      JSON.stringify({
        error: 'Failed to scrape SUR data',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
