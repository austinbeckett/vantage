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
  if (criteria.din) {
    parts.push(`DIN (Drug Identification Number): ${criteria.din}`)
  }
  if (criteria.routeNameFilter?.length) {
    parts.push(`Routes of administration: ${criteria.routeNameFilter.join(', ')}`)
  }
  if (criteria.companyNameFilter?.length) {
    parts.push(`Manufacturer/company: ${criteria.companyNameFilter.join(', ')}`)
  }
  if (criteria.formNameFilter?.length) {
    parts.push(`Dosage forms: ${criteria.formNameFilter.join(', ')}`)
  }
  if (criteria.classFilter?.length) {
    parts.push(`Drug classes: ${criteria.classFilter.join(', ')}`)
  }
  if (criteria.scheduleFilter?.length) {
    parts.push(`Schedules: ${criteria.scheduleFilter.join(', ')}`)
  }
  if (criteria.atcFilter?.length) {
    parts.push(`ATC codes: ${criteria.atcFilter.join(', ')}`)
  }

  return `You are helping a pharmaceutical regulatory professional create a watchlist for monitoring Health Canada drug products.

Based on these search criteria:
${parts.join('\n')}

Generate a concise, professional name (maximum 50 characters) and description (maximum 150 characters) for this watchlist.

The name should be brief but descriptive of what's being monitored.
The description should explain what types of products this watchlist tracks.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"name": "Your Name Here", "description": "Your description here"}`
}

/**
 * Parse the generated text from Gemini into metadata
 */
function parseGeneratedMetadata(text: string, criteria: WatchlistCriteriaLive): GeneratedWatchlistMetadata {
  try {
    // Try to extract JSON from response (handle potential markdown code blocks)
    let jsonText = text

    // Remove markdown code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim()
    }

    // Find JSON object in text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        name: (parsed.name || '').substring(0, 50) || generateFallbackName(criteria),
        description: (parsed.description || '').substring(0, 150) || generateFallbackDescription(criteria)
      }
    }
  } catch (e) {
    console.error('Failed to parse Gemini response:', e)
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
  if (criteria.ingredientName) {
    const firstIngredient = criteria.ingredientName.split('|')[0].trim()
    // Capitalize first letter
    const capitalized = firstIngredient.charAt(0).toUpperCase() + firstIngredient.slice(1).toLowerCase()
    return `${capitalized} Watchlist`.substring(0, 50)
  }
  if (criteria.searchTerm) {
    const firstBrand = criteria.searchTerm.split('|')[0].trim()
    return `${firstBrand} Watchlist`.substring(0, 50)
  }
  if (criteria.din) {
    return `DIN ${criteria.din} Watchlist`
  }
  return `Watchlist ${new Date().toISOString().split('T')[0]}`
}

function generateFallbackDescription(criteria: WatchlistCriteriaLive): string {
  const parts: string[] = []

  if (criteria.ingredientName) {
    const ingredients = criteria.ingredientName.split('|').map(i => i.trim())
    parts.push(ingredients.length > 1 ? `${ingredients[0]} and related ingredients` : ingredients[0])
  } else if (criteria.searchTerm) {
    const brands = criteria.searchTerm.split('|').map(b => b.trim())
    parts.push(brands.length > 1 ? `${brands[0]} and related products` : brands[0])
  } else if (criteria.din) {
    parts.push(`DIN ${criteria.din}`)
  }

  if (criteria.routeNameFilter?.length) {
    parts.push(`via ${criteria.routeNameFilter[0]}`)
  }
  if (criteria.companyNameFilter?.length) {
    parts.push(`from ${criteria.companyNameFilter[0]}`)
  }

  if (parts.length > 0) {
    return `Monitoring ${parts.join(' ')} products`.substring(0, 150)
  }

  return 'Monitoring Health Canada drug products'
}
