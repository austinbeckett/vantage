// =============================================================================
// DPD Filter Panel
// =============================================================================
// Simplified filter panel for filtering DPD results by status only
// This is a VIEW-ONLY filter that does not affect notifications
// Only status filter remains - other filters (route/form) are now in criteria

import { useState, useEffect, useMemo } from 'react'
import { Filter, ChevronDown, Eye } from 'lucide-react'
import { StatusSelect } from './StatusSelect'
import { DEFAULT_DPD_STATUS_FILTER, type DPDViewFilters } from '../../lib/hooks/useWatchlistStorage'
import { getStatusName } from '../../lib/api/status-codes'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DPDFilterPanelProps {
  filters: DPDViewFilters | undefined
  onChange: (filters: DPDViewFilters) => void
  resultCount: number
  filteredCount: number
}

// Default filter state (Approved + Marketed only)
const DEFAULT_FILTERS: DPDViewFilters = {
  statusFilter: DEFAULT_DPD_STATUS_FILTER,
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DPDFilterPanel({
  filters,
  onChange,
  resultCount,
  filteredCount,
}: DPDFilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Local filter state for immediate UI updates
  const [localFilters, setLocalFilters] = useState<DPDViewFilters>(
    filters || DEFAULT_FILTERS
  )

  // Sync local state with external filters when they change
  useEffect(() => {
    if (filters) {
      setLocalFilters(filters)
    }
  }, [filters])

  // Debounced persistence
  const debouncedOnChange = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    return (newFilters: DPDViewFilters) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        onChange(newFilters)
      }, 300)
    }
  }, [onChange])

  // Handle status filter change
  const handleStatusChange = (value: number[] | null) => {
    const updated = { statusFilter: value }
    setLocalFilters(updated)
    debouncedOnChange(updated)
  }

  const hasActiveFilter = localFilters.statusFilter && localFilters.statusFilter.length > 0
  const isFiltered = filteredCount !== resultCount

  // Build status label for collapsed view
  const statusLabel = hasActiveFilter
    ? localFilters.statusFilter!.map(s => getStatusName(s)).join(', ')
    : 'All statuses'

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            View Filter
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
            (display only)
          </span>
          {hasActiveFilter && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300">
              {statusLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isFiltered && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {filteredCount} of {resultCount} products
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          />
        </div>
      </button>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 border-t border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2 fade-in duration-150">
          {/* Info Banner */}
          <div className="flex items-start gap-2 p-3 bg-tan-50 dark:bg-tan-900/20 border border-tan-200 dark:border-tan-800 rounded-lg">
            <Filter className="w-4 h-4 text-tan-600 dark:text-tan-400 mt-0.5 shrink-0" />
            <div className="text-xs text-tan-700 dark:text-tan-300">
              <p className="font-medium">This filter affects display only</p>
              <p className="text-tan-600 dark:text-tan-400 mt-0.5">
                Notifications will still include all products matching your search criteria.
                Use this to hide cancelled or post-market products from view.
              </p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Show products with status
            </label>
            <StatusSelect
              value={localFilters.statusFilter || []}
              onChange={(v) => handleStatusChange(v.length ? v : null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
