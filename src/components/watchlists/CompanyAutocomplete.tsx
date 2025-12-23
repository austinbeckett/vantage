// =============================================================================
// Company Autocomplete
// =============================================================================
// Typeahead component for selecting companies from Health Canada reference data
// Fetches all companies on first focus and filters client-side

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Loader2, X, Building2 } from 'lucide-react'
import { useAllCompanies } from '../../lib/api/dpd/queries'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CompanyAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CompanyAutocomplete({
  value,
  onChange,
  placeholder = 'e.g., APOTEX INC, PFIZER',
  label = 'Company/Manufacturer',
}: CompanyAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all companies (cached for 24 hours)
  const { data: companies, isLoading, isFetching } = useAllCompanies()

  // Filter companies based on input (client-side)
  const suggestions = useMemo(() => {
    if (!companies || inputValue.trim().length < 2) return []

    const query = inputValue.toLowerCase().trim()

    // Get unique company names and filter
    const uniqueCompanies = new Map<string, string>()
    companies.forEach(company => {
      const name = company.company_name
      const lowerName = name.toLowerCase()
      if (lowerName.includes(query) && !uniqueCompanies.has(lowerName)) {
        uniqueCompanies.set(lowerName, name)
      }
    })

    // Sort by relevance (starts with query first, then alphabetically)
    return Array.from(uniqueCompanies.values())
      .sort((a, b) => {
        const aLower = a.toLowerCase()
        const bLower = b.toLowerCase()
        const aStarts = aLower.startsWith(query)
        const bStarts = bLower.startsWith(query)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return aLower.localeCompare(bLower)
      })
      .slice(0, 50) // Limit to 50 suggestions for performance
  }, [companies, inputValue])

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
    if (isFocused && suggestions.length > 0) {
      setIsOpen(true)
    }
  }, [suggestions, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)

    // Open dropdown if we have enough characters
    if (newValue.trim().length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleSelect = (companyName: string) => {
    setInputValue(companyName)
    onChange(companyName)
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
    if (inputValue.trim().length >= 2 && suggestions.length > 0) {
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
  const showNoResults = isOpen && !showLoading && inputValue.trim().length >= 2 && suggestions.length === 0 && companies

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
            border-neutral-200 dark:border-neutral-700
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

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
          <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {suggestions.length}{suggestions.length === 50 ? '+' : ''} compan{suggestions.length !== 1 ? 'ies' : 'y'} found
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((company, idx) => (
              <button
                key={`${company}-${idx}`}
                type="button"
                onClick={() => handleSelect(company)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-2
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${inputValue.toLowerCase() === company.toLowerCase()
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{company}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
            No companies found for "{inputValue}"
          </div>
        </div>
      )}
    </div>
  )
}
