import { X } from 'lucide-react'
import type { ActiveFilter } from '../../types/search'

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
    bg: 'bg-tan-500/10 dark:bg-tan-400/10',
    text: 'text-tan-700 dark:text-tan-300',
    border: 'border-tan-500/20 dark:border-tan-400/20'
  },
  route: {
    bg: 'bg-azure-500/10 dark:bg-azure-400/10',
    text: 'text-azure-700 dark:text-azure-300',
    border: 'border-azure-500/20 dark:border-azure-400/20'
  },
  dosageForm: {
    bg: 'bg-lavender-500/10 dark:bg-lavender-400/10',
    text: 'text-lavender-700 dark:text-lavender-300',
    border: 'border-lavender-500/20 dark:border-lavender-400/20'
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
