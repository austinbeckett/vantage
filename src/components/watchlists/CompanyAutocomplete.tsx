// =============================================================================
// Company Autocomplete (Multi-Select)
// =============================================================================
// Multi-select component for selecting companies from Health Canada reference data
// Fetches all companies on first focus and filters client-side

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Loader2, X, Building2, Check } from 'lucide-react'
import { useAllCompanies } from '../../lib/api/dpd/queries'
import { Portal } from '../ui/Portal'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CompanyAutocompleteProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CompanyAutocomplete({
  value,
  onChange,
  placeholder = 'Any company',
  label = 'Company',
}: CompanyAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track selected values as a Set for efficient lookups
  const selectedSet = useMemo(() => new Set(value), [value])

  // Fetch all companies ONLY after user interacts (lazy load to avoid blocking other requests)
  const { data: companies, isLoading, isFetching } = useAllCompanies(hasInteracted)

  // Filter companies based on input (client-side)
  const suggestions = useMemo(() => {
    if (!companies) return []

    // Get unique company names
    const uniqueCompanies = new Map<string, string>()
    companies.forEach(company => {
      const name = company.company_name
      const lowerName = name.toLowerCase()
      if (!uniqueCompanies.has(lowerName)) {
        uniqueCompanies.set(lowerName, name)
      }
    })

    const allCompanies = Array.from(uniqueCompanies.values())

    // Require at least 2 characters to show suggestions (there are ~2000+ companies)
    if (inputValue.trim().length < 2) {
      return []
    }

    // Filter by input
    const query = inputValue.toLowerCase().trim()
    return allCompanies
      .filter(company => company.toLowerCase().includes(query))
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

  // Handle click outside (check both container and portal dropdown)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const clickedInsideContainer = containerRef.current?.contains(target)
      const clickedInsideDropdown = dropdownRef.current?.contains(target)
      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value.trim().length >= 2) {
      setIsOpen(true)
    }
  }

  const handleToggle = (companyName: string) => {
    const newSelected = new Set(selectedSet)
    if (newSelected.has(companyName)) {
      newSelected.delete(companyName)
    } else {
      newSelected.add(companyName)
    }
    onChange(Array.from(newSelected))
  }

  const handleRemove = (companyName: string) => {
    onChange(value.filter(v => v !== companyName))
  }

  const handleClearAll = () => {
    onChange([])
    setInputValue('')
  }

  const handleFocus = () => {
    setHasInteracted(true)
    if (inputValue.trim().length >= 2) {
      setIsOpen(true)
    }
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
  const showHint = isOpen && !showLoading && inputValue.trim().length < 2 && inputValue.trim().length > 0 && companies

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
          onKeyDown={handleKeyDown}
          placeholder={value.length > 0 ? 'Add...' : placeholder}
          className={`
            w-full px-3 py-2 pr-16 text-sm
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
          {value.length > 0 && !showLoading && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              title="Clear all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Search className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* Selected Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-tan-100 dark:bg-tan-900/30 text-tan-700 dark:text-tan-300 border border-tan-200 dark:border-tan-700/50"
            >
              <Building2 className="w-3 h-3" />
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-0.5 hover:text-tan-900 dark:hover:text-tan-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown (Portal) */}
      {showSuggestions && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[100] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
          >
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {suggestions.length}{suggestions.length === 50 ? '+' : ''} compan{suggestions.length !== 1 ? 'ies' : 'y'} found
              </span>
              {value.length > 0 && (
                <span className="text-xs text-tan-600 dark:text-tan-400">
                  {value.length} selected
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((company, idx) => {
                const isSelected = selectedSet.has(company)
                return (
                  <button
                    key={`${company}-${idx}`}
                    type="button"
                    onClick={() => handleToggle(company)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-2
                      hover:bg-primary-50 dark:hover:bg-primary-900/20
                      transition-colors
                      ${isSelected
                        ? 'bg-tan-50 dark:bg-tan-900/20 text-tan-700 dark:text-tan-300'
                        : 'text-neutral-700 dark:text-neutral-300'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center shrink-0
                      ${isSelected
                        ? 'bg-tan-500 border-tan-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <Building2 className="w-3.5 h-3.5 text-tan-500 shrink-0" />
                    <span className="truncate">{company}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Portal>
      )}

      {/* Hint for minimum characters (Portal) */}
      {showHint && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[100] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
          >
            <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
              Type at least 2 characters to search
            </div>
          </div>
        </Portal>
      )}

      {/* No Results (Portal) */}
      {showNoResults && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[100] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
          >
            <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
              No companies found for "{inputValue}"
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
