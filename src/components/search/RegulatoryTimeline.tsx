import type { RegulatoryTimelineEvent } from '../../types/search'

interface RegulatoryTimelineProps {
  events: RegulatoryTimelineEvent[]
}

const databaseColors: Record<RegulatoryTimelineEvent['database'], { dot: string; label: string }> = {
  GSUR: {
    dot: 'bg-primary-500 shadow-primary-500/50',
    label: 'text-primary-600 dark:text-primary-400 bg-primary-500/10'
  },
  NOC: {
    dot: 'bg-secondary-500 shadow-secondary-500/50',
    label: 'text-secondary-600 dark:text-secondary-400 bg-secondary-500/10'
  },
  DPD: {
    dot: 'bg-sky-500 shadow-sky-500/50',
    label: 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function RegulatoryTimeline({ events }: RegulatoryTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">
        No regulatory events recorded
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline track */}
      <div className="absolute top-3 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-sky-500/30 rounded-full" />

      {/* Events */}
      <div className="relative flex justify-between">
        {events.map((event, index) => {
          const colors = databaseColors[event.database]
          const isFirst = index === 0
          const isLast = index === events.length - 1

          return (
            <div
              key={`${event.date}-${event.event}`}
              className={`
                flex flex-col items-center
                ${isFirst ? 'items-start' : isLast ? 'items-end' : 'items-center'}
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Dot with glow */}
              <div
                className={`
                  w-6 h-6 rounded-full ${colors.dot}
                  shadow-lg
                  flex items-center justify-center
                  ring-4 ring-white/50 dark:ring-neutral-900/50
                  animate-in zoom-in duration-300
                `}
              >
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>

              {/* Event details */}
              <div
                className={`
                  mt-3 flex flex-col gap-1
                  ${isFirst ? 'items-start text-left' : isLast ? 'items-end text-right' : 'items-center text-center'}
                `}
              >
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${colors.label}`}>
                  {event.database}
                </span>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 max-w-[120px]">
                  {event.event}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {formatDate(event.date)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
