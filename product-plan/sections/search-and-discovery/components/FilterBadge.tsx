import { X } from 'lucide-react'
import type { ActiveFilter } from '../types'

interface FilterBadgeProps {
  filter: ActiveFilter
  onRemove?: () => void
}

const typeColors: Record<ActiveFilter['type'], { bg: string; text: string; border: string }> = {
  activeIngredient: {
    bg: 'bg-primary-500/10 dark:bg-primary-400/10',
    text: 'text-primary-700 dark:text-primary-300',
    border: 'border-primary-500/20 dark:border-primary-400/20'
  },
  manufacturer: {
    bg: 'bg-secondary-500/10 dark:bg-secondary-400/10',
    text: 'text-secondary-700 dark:text-secondary-300',
    border: 'border-secondary-500/20 dark:border-secondary-400/20'
  },
  route: {
    bg: 'bg-sky-500/10 dark:bg-sky-400/10',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-500/20 dark:border-sky-400/20'
  },
  dosageForm: {
    bg: 'bg-violet-500/10 dark:bg-violet-400/10',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-500/20 dark:border-violet-400/20'
  }
}

const typeLabels: Record<ActiveFilter['type'], string> = {
  activeIngredient: 'Ingredient',
  manufacturer: 'Manufacturer',
  route: 'Route',
  dosageForm: 'Form'
}

export function FilterBadge({ filter, onRemove }: FilterBadgeProps) {
  const colors = typeColors[filter.type]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        ${colors.bg} ${colors.text} border ${colors.border}
        
        animate-in fade-in slide-in-from-left-2 duration-200
      `}
    >
      <span className="text-xs opacity-60 uppercase tracking-wider">
        {typeLabels[filter.type]}:
      </span>
      <span>{filter.label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-neutral-900/10 dark:hover:bg-white/10 transition-colors"
          aria-label={`Remove ${filter.label} filter`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  )
}
