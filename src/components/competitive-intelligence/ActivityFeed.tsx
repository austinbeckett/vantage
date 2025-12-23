import {
  CheckCircle2,
  FileUp,
  XCircle,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react'
import type { ActivityEvent } from '../../types/competitive-intelligence'

interface ActivityFeedProps {
  events: ActivityEvent[]
  onSelectEvent?: (eventId: string) => void
  maxItems?: number
}

const eventIcons = {
  approval: CheckCircle2,
  submission: FileUp,
  discontinuation: XCircle,
  status_change: ArrowRightLeft,
}

const eventColors = {
  approval: {
    bg: 'bg-secondary-100 dark:bg-secondary-900/30',
    text: 'text-secondary-600 dark:text-secondary-400',
    badge: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400',
  },
  submission: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-600 dark:text-primary-400',
    badge: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
  },
  discontinuation: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  status_change: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
}

const eventLabels = {
  approval: 'Approved',
  submission: 'Submitted',
  discontinuation: 'Discontinued',
  status_change: 'Status Change',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function ActivityFeed({
  events,
  onSelectEvent,
  maxItems = 6,
}: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems)

  return (
    <div className="space-y-1">
      {displayEvents.map((event, index) => {
        const Icon = eventIcons[event.type]
        const colors = eventColors[event.type]

        return (
          <div
            key={event.id}
            className="group relative flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer"
            onClick={() => onSelectEvent?.(event.id)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {index < displayEvents.length - 1 && (
              <div className="absolute left-[29px] top-14 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-neutral-200 dark:from-neutral-700 to-transparent" />
            )}

            <div
              className={`relative z-10 w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                    {event.productName}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {event.manufacturer}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge} whitespace-nowrap`}
                >
                  {eventLabels[event.type]}
                </span>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                {event.description}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {formatDate(event.date)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {event.therapeuticArea}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-2" />
          </div>
        )
      })}
    </div>
  )
}
