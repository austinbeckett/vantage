// =============================================================================
// Timeline Event Card
// =============================================================================
// Displays a single timeline event from DPD, NOC, or GSUR

import { Database, FileCheck, FileSearch, Sparkles, Building2, Calendar, ChevronRight } from 'lucide-react'
import type { TimelineEvent, TimelineEventSource } from '../../types/timeline'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TimelineEventCardProps {
  event: TimelineEvent
  onViewDetails?: () => void
}

// -----------------------------------------------------------------------------
// Source Configuration
// -----------------------------------------------------------------------------

const sourceConfig: Record<TimelineEventSource, {
  icon: React.ReactNode
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  DPD: {
    icon: <Database className="w-3.5 h-3.5" />,
    label: 'Drug Product',
    bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    textColor: 'text-primary-700 dark:text-primary-300',
    borderColor: 'border-primary-200 dark:border-primary-800',
  },
  NOC: {
    icon: <FileCheck className="w-3.5 h-3.5" />,
    label: 'Notice of Compliance',
    bgColor: 'bg-mint-100 dark:bg-mint-900/30',
    textColor: 'text-mint-700 dark:text-mint-300',
    borderColor: 'border-mint-200 dark:border-mint-800',
  },
  GSUR: {
    icon: <FileSearch className="w-3.5 h-3.5" />,
    label: 'Generic Submission',
    bgColor: 'bg-tan-100 dark:bg-tan-900/30',
    textColor: 'text-tan-700 dark:text-tan-300',
    borderColor: 'border-tan-200 dark:border-tan-800',
  },
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function TimelineEventCard({ event, onViewDetails }: TimelineEventCardProps) {
  const config = sourceConfig[event.source]

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get event type label
  const getEventTypeLabel = () => {
    switch (event.eventType) {
      case 'dpd_new_product':
        return 'Product'
      case 'dpd_status_change':
        return 'Status Update'
      case 'noc_approval':
        return 'Approval'
      case 'noc_supplement':
        return 'Supplement'
      case 'gsur_filing':
        return 'Filing'
      default:
        return 'Event'
    }
  }

  return (
    <div
      className={`
        group relative bg-white dark:bg-neutral-800 border rounded-xl overflow-hidden
        hover:shadow-md transition-all duration-200
        ${event.isNew ? config.borderColor : 'border-neutral-200 dark:border-neutral-700'}
      `}
    >
      {/* New Badge */}
      {event.isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500 text-white shadow-sm">
            <Sparkles className="w-3 h-3" />
            NEW
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Source Badge & Date Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              ${config.bgColor} ${config.textColor}
            `}
          >
            {config.icon}
            {getEventTypeLabel()}
          </span>

          <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Calendar className="w-3 h-3" />
            {formatDate(event.date)}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 pr-16">
          {event.title}
        </h4>

        {/* Subtitle (Company) */}
        <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{event.subtitle}</span>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Identifiers */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700/50">
          {event.din && (
            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
              DIN: {event.din}
            </span>
          )}
          {event.nocNumber && (
            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
              NOC #{event.nocNumber}
            </span>
          )}
          {event.matchedIngredient && (
            <span className="text-xs text-secondary-600 dark:text-secondary-400 truncate">
              {event.matchedIngredient}
            </span>
          )}
        </div>
      </div>

      {/* View Details Button (shows on hover) */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="
            absolute bottom-4 right-4 p-2 rounded-lg
            bg-neutral-100 dark:bg-neutral-700
            text-neutral-500 dark:text-neutral-400
            opacity-0 group-hover:opacity-100
            hover:bg-primary-100 hover:text-primary-600
            dark:hover:bg-primary-900/30 dark:hover:text-primary-400
            transition-all duration-200
          "
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
