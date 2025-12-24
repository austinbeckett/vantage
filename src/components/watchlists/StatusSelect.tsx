// =============================================================================
// Status Select (Multi-Select)
// =============================================================================
// Multi-select dropdown for filtering by drug product status

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, X, Activity, Check } from 'lucide-react'
import { DPD_STATUS_CODES, type StatusInfo } from '../../lib/api/status-codes'
import { Portal } from '../ui/Portal'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StatusSelectProps {
  value: number[]
  onChange: (value: number[]) => void
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track selected values as a Set for efficient lookups
  const selectedSet = useMemo(() => new Set(value), [value])

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

  const handleToggle = (status: StatusInfo) => {
    const newSelected = new Set(selectedSet)
    if (newSelected.has(status.code)) {
      newSelected.delete(status.code)
    } else {
      newSelected.add(status.code)
    }
    onChange(Array.from(newSelected))
  }

  const handleRemove = (code: number) => {
    onChange(value.filter(v => v !== code))
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const getSelectedStatuses = () => {
    return value.map(code => DPD_STATUS_CODES[code]).filter(Boolean)
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 pr-16 text-sm
            bg-white dark:bg-neutral-800
            border rounded-lg
            text-left
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            transition-colors
            border-neutral-200 dark:border-neutral-700
          `}
        >
          {value.length > 0 ? (
            <span className="text-neutral-700 dark:text-neutral-300">
              {value.length} selected
            </span>
          ) : (
            <span className="text-neutral-400">Any status</span>
          )}
        </button>

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
          {getSelectedStatuses().map(status => (
            <span
              key={status.code}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                status.category === 'active'
                  ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300 border-mint-200 dark:border-mint-700/50'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-600'
              }`}
            >
              <Activity className="w-3 h-3" />
              {status.name}
              <button
                type="button"
                onClick={() => handleRemove(status.code)}
                className={`ml-0.5 ${
                  status.category === 'active'
                    ? 'hover:text-mint-900 dark:hover:text-mint-100'
                    : 'hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown (Portal) */}
      {isOpen && (
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
                Select statuses
              </span>
              {value.length > 0 && (
                <span className="text-xs text-mint-600 dark:text-mint-400">
                  {value.length} selected
                </span>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {/* Active statuses */}
              <div className="px-3 py-2 bg-mint-50 dark:bg-mint-900/20 border-b border-neutral-200 dark:border-neutral-700">
                <span className="text-xs font-medium text-mint-700 dark:text-mint-300 uppercase tracking-wider">
                  {statusGroups.active.label}
                </span>
              </div>
              {statusGroups.active.statuses.map(status => {
                const isSelected = selectedSet.has(status.code)
                return (
                  <button
                    key={status.code}
                    type="button"
                    onClick={() => handleToggle(status)}
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
                    <Activity className="w-3.5 h-3.5 text-mint-500 shrink-0" />
                    <span className="font-medium">{status.name}</span>
                  </button>
                )
              })}

              {/* Inactive/Cancelled statuses */}
              <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-700">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  {statusGroups.inactive.label}
                </span>
              </div>
              {statusGroups.inactive.statuses.map(status => {
                const isSelected = selectedSet.has(status.code)
                return (
                  <button
                    key={status.code}
                    type="button"
                    onClick={() => handleToggle(status)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-2
                      hover:bg-primary-50 dark:hover:bg-primary-900/20
                      transition-colors
                      ${isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-700 dark:text-neutral-300'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center shrink-0
                      ${isSelected
                        ? 'bg-neutral-500 border-neutral-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <Activity className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{status.name}</span>
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
