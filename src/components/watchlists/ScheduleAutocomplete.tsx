// =============================================================================
// Schedule Autocomplete
// =============================================================================
// Typeahead for selecting drug schedules

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Calendar } from 'lucide-react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ScheduleAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// Common schedule values from Health Canada DPD
// These are the most commonly seen schedule values in the database
const COMMON_SCHEDULES = [
  'Prescription',
  'OTC',
  'Schedule I',
  'Schedule II',
  'Schedule III',
  'Schedule IV',
  'Schedule V',
  'Schedule VI',
  'Schedule C',
  'Schedule D',
  'Schedule F',
  'Schedule G',
  'Narcotic',
  'Controlled Drug (CDSA I)',
  'Controlled Drug (CDSA II)',
  'Controlled Drug (CDSA III)',
  'Controlled Drug (CDSA IV)',
  'Targeted (CDSA IV)',
  'Ethical',
  'Unscheduled',
]

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ScheduleAutocomplete({
  value,
  onChange,
  placeholder = 'e.g., Prescription, OTC',
  label = 'Schedule',
}: ScheduleAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter schedules based on input
  const suggestions = useMemo(() => {
    if (inputValue.trim().length === 0) {
      return COMMON_SCHEDULES
    }

    const query = inputValue.toLowerCase().trim()
    return COMMON_SCHEDULES
      .filter(schedule => schedule.toLowerCase().includes(query))
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
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSelect = (schedule: string) => {
    setInputValue(schedule)
    onChange(schedule)
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
              {suggestions.length} schedule{suggestions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((schedule, idx) => (
              <button
                key={`${schedule}-${idx}`}
                type="button"
                onClick={() => handleSelect(schedule)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-2
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${inputValue.toLowerCase() === schedule.toLowerCase()
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{schedule}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
