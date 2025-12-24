// =============================================================================
// Brand/Product Name Autocomplete (Multi-Select)
// =============================================================================
// Autocomplete component for searching product/brand names from Health Canada DPD
// Supports selecting multiple brands, displayed as chips/tags
// Shows suggestions after 3 characters typed

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Loader2, Package } from 'lucide-react'
import { useBrandSearch } from '../../lib/api/dpd/queries'
import { Portal } from '../ui/Portal'
import { MIN_SEARCH_LENGTH } from '../../lib/hooks'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface BrandAutocompleteProps {
  value: string // Pipe-delimited string of selected brands
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function BrandAutocomplete({
  value,
  onChange,
  placeholder = 'Search products...',
  label = 'Product Name',
}: BrandAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse selected brands from pipe-delimited value
  const selectedBrands = useMemo(() => {
    if (!value || !value.trim()) return []
    return value.split('|').map(s => s.trim()).filter(Boolean)
  }, [value])

  // Search for brands when input is >= 3 characters
  const { data, isLoading, isFetching } = useBrandSearch(inputValue.trim())

  // Extract unique brand names from search results, excluding already selected
  const suggestions = useMemo(() => {
    if (!data?.brands) return []

    const selectedLower = new Set(selectedBrands.map(s => s.toLowerCase()))

    // Filter out already selected brands
    const available = data.brands.filter(
      brand => !selectedLower.has(brand.toLowerCase())
    )

    // Sort alphabetically, prioritizing exact prefix matches
    const query = inputValue.toLowerCase().trim()
    return available
      .sort((a, b) => {
        const aLower = a.toLowerCase()
        const bLower = b.toLowerCase()
        const aStarts = aLower.startsWith(query)
        const bStarts = bLower.startsWith(query)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return aLower.localeCompare(bLower)
      })
      .slice(0, 50) // Limit to 50 suggestions
  }, [data, inputValue, selectedBrands])

  // Handle click outside
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
  }, [isOpen, selectedBrands.length]) // Recalculate when chips change height

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (newValue.trim().length >= MIN_SEARCH_LENGTH) {
      setIsOpen(true)
    }
  }

  const handleSelect = (brandName: string) => {
    // Add to selected brands
    const newSelected = [...selectedBrands, brandName]
    onChange(newSelected.join(' | '))
    // Clear input for next search
    setInputValue('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemove = (brandToRemove: string) => {
    const newSelected = selectedBrands.filter(
      brand => brand.toLowerCase() !== brandToRemove.toLowerCase()
    )
    onChange(newSelected.join(' | '))
  }

  const handleClearAll = () => {
    onChange('')
    setInputValue('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    if (inputValue.trim().length >= MIN_SEARCH_LENGTH) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    // Backspace on empty input removes last chip
    if (e.key === 'Backspace' && inputValue === '' && selectedBrands.length > 0) {
      handleRemove(selectedBrands[selectedBrands.length - 1])
    }
  }

  const showLoading = isLoading || isFetching
  const showSuggestions = isOpen && suggestions.length > 0 && inputValue.trim().length >= MIN_SEARCH_LENGTH
  const showNoResults = isOpen && !showLoading && inputValue.trim().length >= MIN_SEARCH_LENGTH && suggestions.length === 0 && data
  const isPartialInput = inputValue.trim().length > 0 && inputValue.trim().length < MIN_SEARCH_LENGTH

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          {label}
        </label>
      )}

      <div
        className={`
          w-full px-3 py-2
          bg-white dark:bg-neutral-800
          border rounded-lg
          focus-within:ring-2 focus-within:ring-primary-500/30
          ${isPartialInput
            ? 'border-amber-400 dark:border-amber-500'
            : 'border-neutral-200 dark:border-neutral-700'
          }
        `}
      >
        {/* Selected Chips */}
        {selectedBrands.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedBrands.map((brand, idx) => (
              <span
                key={`${brand}-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-sm"
              >
                <Package className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{brand}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(brand)}
                  className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={selectedBrands.length > 0 ? 'Add another...' : placeholder}
            className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none text-sm"
          />

          <div className="flex items-center gap-1.5 ml-2">
            {showLoading && (
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
            )}
            {(selectedBrands.length > 0 || inputValue) && !showLoading && (
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
      </div>

      {/* Helper text */}
      {isPartialInput && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Enter at least {MIN_SEARCH_LENGTH} characters to search
        </p>
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
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {suggestions.length} product{suggestions.length !== 1 ? 's' : ''} found — click to add
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((brand, idx) => (
                <button
                  key={`${brand}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(brand)}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-neutral-700 dark:text-neutral-300"
                >
                  <Package className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span className="truncate">{brand}</span>
                </button>
              ))}
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
              No products found for "{inputValue}"
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
