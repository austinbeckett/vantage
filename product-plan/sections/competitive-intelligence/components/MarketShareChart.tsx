import type { MarketShareItem } from '../types'

interface MarketShareChartProps {
  data: MarketShareItem[]
  title: string
  onSelectSegment?: (name: string) => void
}

// Warm color palette matching the amber/emerald/stone design tokens
// Using hex values for SVG strokes since Tailwind classes don't work reliably
const segmentColors = [
  { bg: 'bg-primary-500', stroke: '#f59e0b' },      // primary-500
  { bg: 'bg-secondary-500', stroke: '#10b981' },    // secondary-500
  { bg: 'bg-orange-400', stroke: '#fb923c' },     // orange-400
  { bg: 'bg-teal-500', stroke: '#14b8a6' },       // teal-500
  { bg: 'bg-primary-300', stroke: '#fcd34d' },      // primary-300
  { bg: 'bg-lime-500', stroke: '#84cc16' },       // lime-500
  { bg: 'bg-neutral-400', stroke: '#a8a29e' },      // neutral-400
  { bg: 'bg-neutral-300', stroke: '#d6d3d1' },      // neutral-300
]

export function MarketShareChart({
  data,
  title,
  onSelectSegment,
}: MarketShareChartProps) {
  // Calculate cumulative percentages for the donut chart
  let cumulativePercent = 0
  const segments = data.map((item, index) => {
    const startPercent = cumulativePercent
    cumulativePercent += item.percentage
    return {
      ...item,
      startPercent,
      endPercent: cumulativePercent,
      color: segmentColors[index % segmentColors.length],
    }
  })

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-5">
        {title}
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((segment, index) => {
              const radius = 40
              const circumference = 2 * Math.PI * radius
              const strokeLength = (segment.percentage / 100) * circumference
              const strokeOffset =
                circumference - (segment.startPercent / 100) * circumference

              return (
                <circle
                  key={segment.name}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  strokeWidth="18"
                  className="transition-all duration-300 cursor-pointer opacity-90 hover:opacity-100"
                  stroke={segment.color.stroke}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={-strokeOffset}
                  onClick={() => onSelectSegment?.(segment.name)}
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  }}
                />
              )
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {segments.slice(0, 6).map((segment) => (
            <div
              key={segment.name}
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => onSelectSegment?.(segment.name)}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: segment.color.stroke }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate flex-1 min-w-0 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">
                {segment.name}
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 tabular-nums flex-shrink-0">
                {segment.percentage}%
              </span>
            </div>
          ))}
          {segments.length > 6 && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 pl-5">
              +{segments.length - 6} more
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
