// =============================================================================
// AI API Client - Direct Gemini Integration
// =============================================================================
// Calls Gemini API directly from the browser to generate watchlist metadata

import type { WatchlistCriteriaLive } from '../../hooks/useWatchlistStorage'

export interface GeneratedWatchlistMetadata {
  name: string
  description: string
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * Generate watchlist name and description using Gemini AI
 * Falls back to simple generation if the API fails
 */
export async function generateWatchlistMetadata(
  criteria: WatchlistCriteriaLive,
  signal?: AbortSignal
): Promise<GeneratedWatchlistMetadata> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
      console.warn('Gemini API key not configured, using fallback')
      return generateFallbackMetadata(criteria)
    }

    const prompt = buildPrompt(criteria)

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API error: ${response.status}`, errorText)
      return generateFallbackMetadata(criteria)
    }

    const result = await response.json()
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return parseGeneratedMetadata(generatedText, criteria)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error // Re-throw abort errors so callers can handle cancellation
    }
    console.error('Failed to generate AI metadata:', error)
    return generateFallbackMetadata(criteria)
  }
}

/**
 * Build the prompt for Gemini based on watchlist criteria
 * Includes primary search criteria (brand/ingredient) and route/form filters
 */
function buildPrompt(criteria: WatchlistCriteriaLive): string {
  const parts: string[] = []

  if (criteria.ingredientName) {
    const ingredients = criteria.ingredientName.split('|').map(i => i.trim()).join(', ')
    parts.push(`Active ingredient(s): ${ingredients}`)
  }
  if (criteria.searchTerm) {
    const brands = criteria.searchTerm.split('|').map(b => b.trim()).join(', ')
    parts.push(`Brand/product name(s): ${brands}`)
  }
  if (criteria.routeFilter?.length) {
    parts.push(`Route filter(s): ${criteria.routeFilter.join(', ')}`)
  }
  if (criteria.formFilter?.length) {
    parts.push(`Dosage form filter(s): ${criteria.formFilter.join(', ')}`)
  }

  return `Generate a watchlist name and description for a pharmaceutical regulatory monitoring tool.

Criteria:
${parts.join('\n')}

Rules:
- Name: max 40 characters, do NOT include "Health Canada" (it's implied by the app)
- Description: must be a complete sentence, max 120 characters, do NOT truncate mid-word
- Be concise and professional
- Focus on what drug products are being tracked
- IMPORTANT: If route or dosage form filters are specified, incorporate them into the name and/or description (e.g., "IV Ceftriaxone Products" or "Monitoring oral formulations of...")

Respond ONLY with valid JSON (no markdown):
{"name": "Example Name", "description": "Complete sentence here."}`
}

/**
 * Parse the generated text from Gemini into metadata
 */
function parseGeneratedMetadata(text: string, criteria: WatchlistCriteriaLive): GeneratedWatchlistMetadata {
  try {
    // Try to extract JSON from response (handle potential markdown code blocks)
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim()
    }

    // Find the first complete JSON object using bracket matching
    const startIdx = jsonText.indexOf('{')
    if (startIdx !== -1) {
      let braceCount = 0
      let endIdx = startIdx

      for (let i = startIdx; i < jsonText.length; i++) {
        if (jsonText[i] === '{') braceCount++
        if (jsonText[i] === '}') braceCount--
        if (braceCount === 0) {
          endIdx = i
          break
        }
      }

      const jsonString = jsonText.substring(startIdx, endIdx + 1)
      const parsed = JSON.parse(jsonString)
      return {
        name: (parsed.name || '').substring(0, 50) || generateFallbackName(criteria),
        description: (parsed.description || '').substring(0, 150) || generateFallbackDescription(criteria)
      }
    }
  } catch (e) {
    console.error('Failed to parse Gemini response:', e, '\nRaw text:', text)
  }
  return generateFallbackMetadata(criteria)
}

/**
 * Local fallback for when AI is unavailable
 */
function generateFallbackMetadata(criteria: WatchlistCriteriaLive): GeneratedWatchlistMetadata {
  return {
    name: generateFallbackName(criteria),
    description: generateFallbackDescription(criteria),
  }
}

function generateFallbackName(criteria: WatchlistCriteriaLive): string {
  const parts: string[] = []

  // Add route prefix (e.g., "IV" for intravenous)
  if (criteria.routeFilter?.length) {
    const route = criteria.routeFilter[0]
    // Common abbreviations
    if (route.toLowerCase().includes('intravenous')) {
      parts.push('IV')
    } else if (route.toLowerCase().includes('oral')) {
      parts.push('Oral')
    } else if (route.toLowerCase().includes('topical')) {
      parts.push('Topical')
    } else {
      parts.push(route.split(' ')[0]) // First word of route
    }
  }

  // Add main search term
  if (criteria.ingredientName) {
    const firstIngredient = criteria.ingredientName.split('|')[0].trim()
    const capitalized = firstIngredient.charAt(0).toUpperCase() + firstIngredient.slice(1).toLowerCase()
    parts.push(capitalized)
  } else if (criteria.searchTerm) {
    const firstBrand = criteria.searchTerm.split('|')[0].trim()
    parts.push(firstBrand)
  }

  // Add form suffix if specified and no route
  if (criteria.formFilter?.length && !criteria.routeFilter?.length) {
    const form = criteria.formFilter[0]
    parts.push(form.split(' ')[0]) // First word of form
  }

  if (parts.length > 0) {
    return `${parts.join(' ')} Watchlist`.substring(0, 50)
  }

  return `Watchlist ${new Date().toISOString().split('T')[0]}`
}

function generateFallbackDescription(criteria: WatchlistCriteriaLive): string {
  const parts: string[] = []

  // Add route qualifier
  if (criteria.routeFilter?.length) {
    const route = criteria.routeFilter[0].toLowerCase()
    if (route.includes('intravenous')) {
      parts.push('intravenous')
    } else if (route.includes('oral')) {
      parts.push('oral')
    } else {
      parts.push(route)
    }
  }

  // Add form qualifier
  if (criteria.formFilter?.length) {
    parts.push(criteria.formFilter[0].toLowerCase())
  }

  // Add main product identifier
  if (criteria.ingredientName) {
    const ingredients = criteria.ingredientName.split('|').map(i => i.trim())
    parts.push(ingredients.length > 1 ? `${ingredients[0]} and related` : ingredients[0])
  } else if (criteria.searchTerm) {
    const brands = criteria.searchTerm.split('|').map(b => b.trim())
    parts.push(brands.length > 1 ? `${brands[0]} and related` : brands[0])
  }

  if (parts.length > 0) {
    return `Monitoring ${parts.join(' ')} products`.substring(0, 150)
  }

  return 'Monitoring Health Canada drug products'
}
