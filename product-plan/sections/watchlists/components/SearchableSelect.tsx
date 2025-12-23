import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

interface Option {
  id: string
  name: string
}

interface SearchableSelectProps {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search...'
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get selected option label
  const selectedOption = options.find(opt => opt.id === value)

  // Filter options by search
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  )

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionId: string) => {
    onChange(optionId)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 pr-10
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          rounded-lg
          text-left
          focus:outline-none focus:ring-2 focus:ring-primary-500/30
          transition-colors
          ${isOpen ? 'ring-2 ring-primary-500/30 border-primary-500/50' : ''}
        `}
      >
        <span className={selectedOption ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}>
          {selectedOption ? selectedOption.name : 'Any'}
        </span>

        {/* Clear button or chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
          {/* Search input */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="
                  w-full pl-9 pr-3 py-2
                  bg-neutral-50 dark:bg-neutral-900
                  border border-neutral-200 dark:border-neutral-700
                  rounded-lg
                  text-sm text-neutral-900 dark:text-neutral-100
                  placeholder:text-neutral-400
                  focus:outline-none focus:ring-1 focus:ring-primary-500/30
                "
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {/* "Any" option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`
                w-full px-4 py-2.5 text-left text-sm
                hover:bg-neutral-50 dark:hover:bg-neutral-700/50
                transition-colors
                ${!value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400'}
              `}
            >
              Any
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm
                    hover:bg-neutral-50 dark:hover:bg-neutral-700/50
                    transition-colors
                    ${value === option.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-neutral-300'}
                  `}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
