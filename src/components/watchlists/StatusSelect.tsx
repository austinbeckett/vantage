// =============================================================================
// Status Select
// =============================================================================
// Dropdown select for filtering by drug product status

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Activity } from 'lucide-react'
import { DPD_STATUS_CODES, type StatusInfo } from '../../lib/api/status-codes'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StatusSelectProps {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
}

// Group statuses by category for better UX
const statusGroups = {
  active: {
    label: 'Active',
    statuses: Object.values(DPD_STATUS_CODES).filter(s => s.category === 'active'),
  },
  inactive: {
    label: 'Inactive/Cancelled',
    statuses: Object.values(DPD_STATUS_CODES).filter(s => s.category === 'inactive'),
  },
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function StatusSelect({
  value,
  onChange,
  label = 'Status',
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedStatus = value !== null ? DPD_STATUS_CODES[value] : null

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

  const handleSelect = (status: StatusInfo) => {
    onChange(status.code)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const getCategoryColor = (category: 'active' | 'inactive' | 'pending') => {
    switch (category) {
      case 'active':
        return 'text-green-600 dark:text-green-400'
      case 'inactive':
        return 'text-neutral-500 dark:text-neutral-400'
      case 'pending':
        return 'text-amber-600 dark:text-amber-400'
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 pr-20
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700 rounded-lg
          text-left
          focus:outline-none focus:ring-2 focus:ring-primary-500/30
          transition-colors
        `}
      >
        {selectedStatus ? (
          <span className={getCategoryColor(selectedStatus.category)}>
            {selectedStatus.name}
          </span>
        ) : (
          <span className="text-neutral-400">Any status</span>
        )}

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {selectedStatus && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
          <div className="max-h-64 overflow-y-auto">
            {/* Active statuses */}
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                {statusGroups.active.label}
              </span>
            </div>
            {statusGroups.active.statuses.map(status => (
              <button
                key={status.code}
                type="button"
                onClick={() => handleSelect(status)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-2
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${value === status.code
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Activity className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <div>
                  <span className="font-medium">{status.name}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                    ({status.code})
                  </span>
                </div>
              </button>
            ))}

            {/* Inactive/Cancelled statuses */}
            <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-700">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                {statusGroups.inactive.label}
              </span>
            </div>
            {statusGroups.inactive.statuses.map(status => (
              <button
                key={status.code}
                type="button"
                onClick={() => handleSelect(status)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  flex items-center gap-2
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-colors
                  ${value === status.code
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Activity className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <div>
                  <span>{status.name}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                    ({status.code})
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
