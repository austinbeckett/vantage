// =============================================================================
// Class Autocomplete (Multi-Select)
// =============================================================================
// Multi-select component for selecting drug classes

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, X, Tag, Check } from 'lucide-react'
import { Portal } from '../ui/Portal'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ClassAutocompleteProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
}

// Common drug class values from Health Canada DPD
// The class_name field indicates the type/category of drug
const COMMON_CLASSES = [
  'Human',
  'Veterinary',
  'Disinfectant',
  'Radiopharmaceutical',
]

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ClassAutocomplete({
  value,
  onChange,
  placeholder = 'Any class',
  label = 'Class',
}: ClassAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track selected values as a Set for efficient lookups
  const selectedSet = useMemo(() => new Set(value), [value])

  // Filter classes based on input
  const suggestions = useMemo(() => {
    if (inputValue.trim().length === 0) {
      return COMMON_CLASSES
    }

    const query = inputValue.toLowerCase().trim()
    return COMMON_CLASSES
      .filter(cls => cls.toLowerCase().includes(query))
      .sort((a, b) => {
        const aLower = a.toLowerCase()
        const bLower = b.toLowerCase()
        const aStarts = aLower.startsWith(query)
        const bStarts = bLower.startsWith(query)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return aLower.localeCompare(bLower)
      })
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
    setInputValue(e.target.value)
    setIsOpen(true)
  }

  const handleToggle = (cls: string) => {
    const newSelected = new Set(selectedSet)
    if (newSelected.has(cls)) {
      newSelected.delete(cls)
    } else {
      newSelected.add(cls)
    }
    onChange(Array.from(newSelected))
  }

  const handleRemove = (cls: string) => {
    onChange(value.filter(v => v !== cls))
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
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selected Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300 border border-mint-200 dark:border-mint-700/50"
            >
              <Tag className="w-3 h-3" />
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-0.5 hover:text-mint-900 dark:hover:text-mint-100"
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
                {suggestions.length} class{suggestions.length !== 1 ? 'es' : ''}
              </span>
              {value.length > 0 && (
                <span className="text-xs text-mint-600 dark:text-mint-400">
                  {value.length} selected
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((cls, idx) => {
                const isSelected = selectedSet.has(cls)
                return (
                  <button
                    key={`${cls}-${idx}`}
                    type="button"
                    onClick={() => handleToggle(cls)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-2
                      hover:bg-primary-50 dark:hover:bg-primary-900/20
                      transition-colors
                      ${isSelected
                        ? 'bg-mint-50 dark:bg-mint-900/20 text-mint-700 dark:text-mint-300'
                        : 'text-neutral-700 dark:text-neutral-300'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center shrink-0
                      ${isSelected
                        ? 'bg-mint-500 border-mint-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <Tag className="w-3.5 h-3.5 text-mint-500 shrink-0" />
                    <span className="truncate">{cls}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
