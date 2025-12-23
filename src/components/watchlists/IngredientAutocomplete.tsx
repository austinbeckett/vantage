// =============================================================================
// Ingredient Autocomplete
// =============================================================================
// Typeahead component for searching active ingredients from Health Canada API

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Loader2, X, Pill } from 'lucide-react'
import { useIngredientSearch } from '../../lib/api/dpd/queries'
import { MIN_SEARCH_LENGTH } from '../../lib/hooks'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface IngredientAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function IngredientAutocomplete({
  value,
  onChange,
  placeholder = 'e.g., Cefazolin, Metformin',
  label = 'Active Ingredient',
}: IngredientAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce the search query
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  // Fetch ingredients from API
  const { data, isLoading, isFetching } = useIngredientSearch(debouncedQuery)

  // Extract unique ingredient names from API response
  const suggestions = useMemo(() => {
    if (!data?.ingredients) return []

    // Get unique ingredient names (case-insensitive)
    const uniqueNames = new Map<string, string>()
    data.ingredients.forEach(item => {
      const lowerName = item.ingredient_name.toLowerCase()
      if (!uniqueNames.has(lowerName)) {
        // Store with proper casing (first occurrence)
        uniqueNames.set(lowerName, item.ingredient_name)
      }
    })

    // Sort alphabetically and return array
    return Array.from(uniqueNames.values()).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
  }, [data])

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show dropdown when we have suggestions and input is focused
  useEffect(() => {
    if (isFocused && suggestions.length > 0 && inputValue.length >= MIN_SEARCH_LENGTH) {
      setIsOpen(true)
    }
  }, [suggestions, isFocused, inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)

    // Open dropdown if we have enough characters
    if (newValue.trim().length >= MIN_SEARCH_LENGTH) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleSelect = (ingredientName: string) => {
    setInputValue(ingredientName)
    onChange(ingredientName)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (inputValue.trim().length >= MIN_SEARCH_LENGTH && suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Delay closing to allow click on suggestion
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const showLoading = isLoading || isFetching
  const showSuggestions = isOpen && suggestions.length > 0
  const showNoResults = isOpen && !showLoading && inputValue.trim().length >= MIN_SEARCH_LENGTH && suggestions.length === 0

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 pr-20
            bg-white dark:bg-neutral-800
            border rounded-lg
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            ${inputValue.trim().length > 0 && inputValue.trim().length < MIN_SEARCH_LENGTH
              ? 'border-amber-400 dark:border-amber-500'
              : 'border-neutral-200 dark:border-neutral-700'
            }
          `}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {showLoading && (
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          )}
          {inputValue && !showLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Search className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* Helper text */}
      {inputValue.trim().length > 0 && inputValue.trim().length < MIN_SEARCH_LENGTH && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Enter at least {MIN_SEARCH_LENGTH} characters to search
        </p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
          <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {suggestions.length} ingredient{suggestions.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((ingredient, idx) => (
              <button
                key={`${ingredient}-${idx}`}
                type="button"
                onClick={() => handleSelect(ingredient)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-2
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${inputValue.toLowerCase() === ingredient.toLowerCase()
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Pill className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                <span className="truncate">{ingredient}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
            No ingredients found for "{inputValue}"
          </div>
        </div>
      )}
    </div>
  )
}
