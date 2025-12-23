// =============================================================================
// Product Name Input (formerly Brand Autocomplete)
// =============================================================================
// Simple text input for product/brand name - API search happens on form submit

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { MIN_SEARCH_LENGTH } from '../../lib/hooks'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface BrandAutocompleteProps {
  value: string
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
  placeholder = 'e.g., OZEMPIC, TYLENOL, ADVIL',
  label = 'Product Name',
}: BrandAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    inputRef.current?.focus()
  }

  const isPartialInput = inputValue.trim().length > 0 && inputValue.trim().length < MIN_SEARCH_LENGTH

  return (
    <div className="relative">
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
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 pr-16
            bg-white dark:bg-neutral-800
            border rounded-lg
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            ${isPartialInput
              ? 'border-amber-400 dark:border-amber-500'
              : 'border-neutral-200 dark:border-neutral-700'
            }
          `}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {inputValue && (
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
      {isPartialInput && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Enter at least {MIN_SEARCH_LENGTH} characters to search
        </p>
      )}
    </div>
  )
}
