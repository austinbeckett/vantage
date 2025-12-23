// =============================================================================
// GSUR (Generic Submissions Under Review) Scraper
// =============================================================================
// Supabase Edge Function to scrape Health Canada's GSUR HTML page
// Source: https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/generic-submissions-under-review.html

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

const GSUR_URL = 'https://www.canada.ca/en/health-canada/services/drug-health-product-review-approval/generic-submissions-under-review.html'

interface GSUREntry {
  medicinal_ingredients: string
  company_name: string
  therapeutic_area: string
  year_month_accepted: string
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
    console.log('Fetching GSUR page...')

    // Fetch the HTML page
    const response = await fetch(GSUR_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VantageBot/1.0; +https://vantage.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch GSUR page: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`Received ${html.length} bytes of HTML`)

    // Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    // Find the main data table
    // The GSUR table typically has class "table" or is within a specific container
    const tables = doc.querySelectorAll('table')
    let dataTable: Element | null = null

    // Look for a table that has the expected columns
    for (const table of tables) {
      const headers = table.querySelectorAll('th')
      const headerTexts = Array.from(headers).map(th => th.textContent?.toLowerCase() || '')

      // Check if this table has the GSUR columns
      if (
        headerTexts.some(h => h.includes('medicinal ingredient')) &&
        headerTexts.some(h => h.includes('company') || h.includes('sponsor'))
      ) {
        dataTable = table as Element
        break
      }
    }

    if (!dataTable) {
      // Fallback: just use the first table with tbody rows
      for (const table of tables) {
        const rows = table.querySelectorAll('tbody tr')
        if (rows.length > 0) {
          dataTable = table as Element
          break
        }
      }
    }

    if (!dataTable) {
      console.warn('No GSUR table found')
      return new Response(JSON.stringify([]), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Extract rows
    const rows = dataTable.querySelectorAll('tbody tr')
    const entries: GSUREntry[] = []

    for (const row of rows) {
      const cells = row.querySelectorAll('td')

      if (cells.length >= 4) {
        const entry: GSUREntry = {
          medicinal_ingredients: cells[0]?.textContent?.trim() || '',
          company_name: cells[1]?.textContent?.trim() || 'Not available',
          therapeutic_area: cells[2]?.textContent?.trim() || '',
          year_month_accepted: cells[3]?.textContent?.trim() || '',
        }

        // Only add if we have at least the medicinal ingredient
        if (entry.medicinal_ingredients) {
          entries.push(entry)
        }
      }
    }

    console.log(`Extracted ${entries.length} GSUR entries`)

    return new Response(JSON.stringify(entries), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('GSUR scraper error:', error)

    return new Response(
      JSON.stringify({
        error: 'Failed to scrape GSUR data',
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
