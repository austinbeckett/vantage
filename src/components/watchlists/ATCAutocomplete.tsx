// =============================================================================
// ATC Autocomplete (Multi-Select)
// =============================================================================
// Multi-select input for filtering by Anatomical Therapeutic Chemical (ATC) code
// ATC codes follow a hierarchical structure: A00AA00
// - 1st level (A): Anatomical main group
// - 2nd level (00): Therapeutic subgroup
// - 3rd level (A): Pharmacological subgroup
// - 4th level (A): Chemical subgroup
// - 5th level (00): Chemical substance

import { useState, useRef, useEffect, useMemo } from 'react'
import { Hash, X, Dna, Check } from 'lucide-react'
import { Portal } from '../ui/Portal'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ATCAutocompleteProps {
  value: string[]
  onChange: (value: string[]) => void
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
  placeholder = 'e.g. J01, N02',
  label = 'ATC',
}: ATCAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track selected values as a Set for efficient lookups
  const selectedSet = useMemo(() => new Set(value), [value])

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
    const newValue = e.target.value.toUpperCase()
    setInputValue(newValue)
    setIsOpen(true)
  }

  const handleToggle = (code: string) => {
    const newSelected = new Set(selectedSet)
    if (newSelected.has(code)) {
      newSelected.delete(code)
    } else {
      newSelected.add(code)
    }
    onChange(Array.from(newSelected))
  }

  const handleRemove = (code: string) => {
    onChange(value.filter(v => v !== code))
  }

  const handleClearAll = () => {
    onChange([])
    setInputValue('')
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const showSuggestions = isOpen && suggestions.length > 0

  // Get ATC name for a code
  const getATCName = (code: string) => {
    const atc = ATC_PREFIXES.find(a => a.code === code)
    return atc?.name || ''
  }

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
            font-mono uppercase
          `}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              title="Clear all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Hash className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* Selected Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50"
            >
              <Dna className="w-3 h-3" />
              <span className="font-mono">{item}</span>
              {getATCName(item) && (
                <span className="text-rose-500 dark:text-rose-400 text-[10px] max-w-20 truncate">
                  {getATCName(item)}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-0.5 hover:text-rose-900 dark:hover:text-rose-100"
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
                {suggestions.length} ATC code{suggestions.length !== 1 ? 's' : ''}
              </span>
              {value.length > 0 && (
                <span className="text-xs text-rose-600 dark:text-rose-400">
                  {value.length} selected
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((atc, idx) => {
                const isSelected = selectedSet.has(atc.code)
                return (
                  <button
                    key={`${atc.code}-${idx}`}
                    type="button"
                    onClick={() => handleToggle(atc.code)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-3
                      hover:bg-primary-50 dark:hover:bg-primary-900/20
                      transition-colors
                      ${isSelected
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'text-neutral-700 dark:text-neutral-300'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center shrink-0
                      ${isSelected
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <Dna className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-medium shrink-0">{atc.code}</span>
                      <span className="text-neutral-500 dark:text-neutral-400 truncate text-xs">
                        {atc.name}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                Type any ATC code or prefix to filter
              </span>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
