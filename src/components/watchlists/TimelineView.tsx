// =============================================================================
// Timeline View
// =============================================================================
// Displays a list of timeline events with filtering controls

import { useMemo } from 'react'
import { Database, FileCheck, FileSearch, Sparkles, Filter, Calendar } from 'lucide-react'
import type { TimelineEvent, TimelineSourceFilter, TimelineCounts } from '../../types/timeline'
import { TimelineEventCard } from './TimelineEventCard'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TimelineViewProps {
  events: TimelineEvent[]
  counts: TimelineCounts
  sourceFilter: TimelineSourceFilter
  showOnlyNew: boolean
  onSourceFilterChange: (filter: TimelineSourceFilter) => void
  onShowOnlyNewChange: (show: boolean) => void
  isLoading?: boolean
}

// -----------------------------------------------------------------------------
// Source Tab Configuration
// -----------------------------------------------------------------------------

const sourceTabs: Array<{
  value: TimelineSourceFilter
  label: string
  icon: React.ReactNode
  countKey: keyof TimelineCounts | null
}> = [
  { value: 'all', label: 'All', icon: <Filter className="w-3.5 h-3.5" />, countKey: 'total' },
  { value: 'DPD', label: 'Products', icon: <Database className="w-3.5 h-3.5" />, countKey: 'dpd' },
  { value: 'NOC', label: 'Approvals', icon: <FileCheck className="w-3.5 h-3.5" />, countKey: 'noc' },
  { value: 'GSUR', label: 'Filings', icon: <FileSearch className="w-3.5 h-3.5" />, countKey: 'gsur' },
]

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function TimelineView({
  events,
  counts,
  sourceFilter,
  showOnlyNew,
  onSourceFilterChange,
  onShowOnlyNewChange,
  isLoading = false,
}: TimelineViewProps) {
  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (sourceFilter !== 'all' && event.source !== sourceFilter) return false
      if (showOnlyNew && !event.isNew) return false
      return true
    })
  }, [events, sourceFilter, showOnlyNew])

  // Group events by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>()

    filteredEvents.forEach(event => {
      const dateKey = event.date.substring(0, 10) // YYYY-MM-DD
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(event)
    })

    // Sort groups by date descending
    const sortedEntries = Array.from(groups.entries()).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    )

    return new Map(sortedEntries)
  }, [filteredEvents])

  // Format date for group headers
  const formatGroupDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Source Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          {sourceTabs.map(tab => {
            const count = tab.countKey ? counts[tab.countKey] : 0
            const isActive = sourceFilter === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => onSourceFilterChange(tab.value)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${isActive
                    ? 'bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300'
                    : 'bg-neutral-200/50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                  }
                `}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Show Only New Toggle */}
        <button
          onClick={() => onShowOnlyNewChange(!showOnlyNew)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200 border
            ${showOnlyNew
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          Show only new
          {counts.newEntries > 0 && (
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs
              ${showOnlyNew
                ? 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }
            `}>
              {counts.newEntries}
            </span>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          {showOnlyNew ? (
            <>
              <Sparkles className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                No new entries
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                All entries have been viewed. Check back later for updates.
              </p>
            </>
          ) : sourceFilter !== 'all' ? (
            <>
              <Database className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                No {sourceFilter} entries
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No matching entries found in this database.
              </p>
            </>
          ) : (
            <>
              <Calendar className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                No entries found
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No matching entries found for this watchlist criteria.
              </p>
            </>
          )}
        </div>
      )}

      {/* Timeline Groups */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="space-y-8">
          {Array.from(groupedByDate.entries()).map(([date, dateEvents]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {formatGroupDate(date)}
                </h3>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {dateEvents.length} {dateEvents.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateEvents.map(event => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
