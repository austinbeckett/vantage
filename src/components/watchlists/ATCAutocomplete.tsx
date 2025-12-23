// =============================================================================
// ATC Autocomplete
// =============================================================================
// Input for filtering by Anatomical Therapeutic Chemical (ATC) code
// ATC codes follow a hierarchical structure: A00AA00
// - 1st level (A): Anatomical main group
// - 2nd level (00): Therapeutic subgroup
// - 3rd level (A): Pharmacological subgroup
// - 4th level (A): Chemical subgroup
// - 5th level (00): Chemical substance

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Dna } from 'lucide-react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ATCAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// Common ATC code prefixes with descriptions
// These are top-level anatomical groups and some common therapeutic subgroups
const ATC_PREFIXES = [
  { code: 'A', name: 'Alimentary tract and metabolism' },
  { code: 'B', name: 'Blood and blood forming organs' },
  { code: 'C', name: 'Cardiovascular system' },
  { code: 'D', name: 'Dermatologicals' },
  { code: 'G', name: 'Genito-urinary system and sex hormones' },
  { code: 'H', name: 'Systemic hormonal preparations' },
  { code: 'J', name: 'Antiinfectives for systemic use' },
  { code: 'J01', name: 'Antibacterials for systemic use' },
  { code: 'J01D', name: 'Other beta-lactam antibacterials' },
  { code: 'J01DD', name: 'Third-generation cephalosporins' },
  { code: 'L', name: 'Antineoplastic and immunomodulating agents' },
  { code: 'M', name: 'Musculo-skeletal system' },
  { code: 'N', name: 'Nervous system' },
  { code: 'N02', name: 'Analgesics' },
  { code: 'N05', name: 'Psycholeptics' },
  { code: 'N06', name: 'Psychoanaleptics' },
  { code: 'P', name: 'Antiparasitic products' },
  { code: 'R', name: 'Respiratory system' },
  { code: 'S', name: 'Sensory organs' },
  { code: 'V', name: 'Various' },
]

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ATCAutocomplete({
  value,
  onChange,
  placeholder = 'e.g., J01DD04, N02',
  label = 'ATC Code',
}: ATCAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter ATC prefixes based on input
  const suggestions = useMemo(() => {
    if (inputValue.trim().length === 0) {
      // Show only top-level codes when empty
      return ATC_PREFIXES.filter(atc => atc.code.length === 1)
    }

    const query = inputValue.toUpperCase().trim()
    return ATC_PREFIXES
      .filter(atc =>
        atc.code.toUpperCase().startsWith(query) ||
        atc.name.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => a.code.length - b.code.length || a.code.localeCompare(b.code))
  }, [inputValue])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSelect = (code: string) => {
    setInputValue(code)
    onChange(code)
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
    setIsOpen(true)
  }

  const handleBlur = () => {
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

  const showSuggestions = isOpen && suggestions.length > 0

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
          className="
            w-full px-4 py-2.5 pr-20
            bg-white dark:bg-neutral-800
            border border-neutral-200 dark:border-neutral-700 rounded-lg
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            font-mono uppercase
          "
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

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
          <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {suggestions.length} ATC code{suggestions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((atc, idx) => (
              <button
                key={`${atc.code}-${idx}`}
                type="button"
                onClick={() => handleSelect(atc.code)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-3
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${inputValue.toUpperCase() === atc.code.toUpperCase()
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Dna className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-medium shrink-0">{atc.code}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 truncate text-xs">
                    {atc.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Type any ATC code or prefix to filter
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
