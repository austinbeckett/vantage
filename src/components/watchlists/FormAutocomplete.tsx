// =============================================================================
// Form Autocomplete
// =============================================================================
// Typeahead component for selecting pharmaceutical forms from Health Canada reference data
// Fetches all forms on first focus and filters client-side

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Loader2, X, FlaskConical } from 'lucide-react'
import { useAllForms } from '../../lib/api/dpd/queries'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface FormAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function FormAutocomplete({
  value,
  onChange,
  placeholder = 'e.g., Tablet, Capsule, Solution',
  label = 'Dosage Form',
}: FormAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all forms (cached for 24 hours)
  const { data: forms, isLoading, isFetching } = useAllForms()

  // Filter forms based on input (client-side)
  const suggestions = useMemo(() => {
    if (!forms) return []

    // Get unique form names
    const uniqueForms = new Map<string, string>()
    forms.forEach(form => {
      const name = form.pharmaceutical_form_name
      const lowerName = name.toLowerCase()
      if (!uniqueForms.has(lowerName)) {
        uniqueForms.set(lowerName, name)
      }
    })

    const allForms = Array.from(uniqueForms.values())

    // If no input, show all forms (there are only ~130)
    if (inputValue.trim().length === 0) {
      return allForms.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    }

    // Filter by input
    const query = inputValue.toLowerCase().trim()
    return allForms
      .filter(form => form.toLowerCase().includes(query))
      .sort((a, b) => {
        const aLower = a.toLowerCase()
        const bLower = b.toLowerCase()
        const aStarts = aLower.startsWith(query)
        const bStarts = bLower.startsWith(query)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return aLower.localeCompare(bLower)
      })
  }, [forms, inputValue])

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

  // Show dropdown when focused and we have forms loaded
  useEffect(() => {
    if (isFocused && forms && forms.length > 0) {
      setIsOpen(true)
    }
  }, [forms, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSelect = (formName: string) => {
    setInputValue(formName)
    onChange(formName)
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
    if (forms && forms.length > 0) {
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
  const showNoResults = isOpen && !showLoading && inputValue.trim().length > 0 && suggestions.length === 0 && forms

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
              {suggestions.length} form{suggestions.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((form, idx) => (
              <button
                key={`${form}-${idx}`}
                type="button"
                onClick={() => handleSelect(form)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-2
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${inputValue.toLowerCase() === form.toLowerCase()
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <FlaskConical className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate">{form}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
            No forms found for "{inputValue}"
          </div>
        </div>
      )}
    </div>
  )
}
