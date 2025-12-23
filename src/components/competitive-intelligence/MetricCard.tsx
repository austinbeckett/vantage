import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number | string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  variant?: 'default' | 'highlight' | 'muted'
  onClick?: () => void
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  onClick,
}: MetricCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  const baseClasses =
    'group relative p-5 rounded-2xl border transition-all duration-200'

  const variantClasses = {
    default:
      'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-primary-300/50 dark:hover:border-primary-600/30',
    highlight:
      'bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/40 dark:to-primary-900/20 border-primary-200/50 dark:border-primary-700/30',
    muted:
      'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-transparent transition-all duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive
                  ? 'text-secondary-600 dark:text-secondary-400'
                  : isNegative
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>
                {isPositive ? '+' : ''}
                {change}%
              </span>
            </div>
          )}
        </div>

        {changeLabel && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {changeLabel}
          </p>
        )}
      </div>
    </div>
  )
}
