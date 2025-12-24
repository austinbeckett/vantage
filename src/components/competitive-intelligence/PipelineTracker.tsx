import { useState } from 'react'
import {
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  Filter,
  Building2,
} from 'lucide-react'
import type {
  PipelineItem,
  StageMetric,
  TimeRangeOption,
} from '../../types/competitive-intelligence'

interface PipelineTrackerProps {
  pipelineItems: PipelineItem[]
  stageMetrics: StageMetric[]
  timeRangeOptions: TimeRangeOption[]
  therapeuticAreaOptions: string[]
  onSelectItem?: (itemId: string) => void
  onTimeRangeChange?: (range: string) => void
  onTherapeuticAreaChange?: (area: string | null) => void
}

const stageColors = {
  submitted: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    border: 'border-primary-300 dark:border-primary-700',
    text: 'text-primary-700 dark:text-primary-400',
    dot: 'bg-primary-500',
  },
  under_review: {
    bg: 'bg-azure-100 dark:bg-azure-900/30',
    border: 'border-azure-300 dark:border-azure-700',
    text: 'text-azure-700 dark:text-azure-400',
    dot: 'bg-azure-500',
  },
  noc_granted: {
    bg: 'bg-secondary-100 dark:bg-secondary-900/30',
    border: 'border-secondary-300 dark:border-secondary-700',
    text: 'text-secondary-700 dark:text-secondary-400',
    dot: 'bg-secondary-500',
  },
  marketed: {
    bg: 'bg-neutral-100 dark:bg-neutral-800/50',
    border: 'border-neutral-300 dark:border-neutral-600',
    text: 'text-neutral-700 dark:text-neutral-400',
    dot: 'bg-neutral-500',
  },
}

interface PipelineCardProps {
  item: PipelineItem
  onClick?: () => void
}

function PipelineCard({ item, onClick }: PipelineCardProps) {
  const colors = stageColors[item.stage]

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl ${colors.bg} border ${colors.border} cursor-pointer hover:shadow-md transition-all group`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm leading-tight">
          {item.productName}
        </h4>
        <ChevronRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        {item.activeIngredient}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-3 h-3 text-neutral-400" />
        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
          {item.manufacturer}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {item.daysInStage}d in stage
          </span>
        </div>

        {item.predictedApprovalDate && item.confidence && (
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                item.confidence >= 90
                  ? 'bg-secondary-500'
                  : item.confidence >= 80
                    ? 'bg-primary-500'
                    : 'bg-neutral-400'
              }`}
            />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {item.confidence}%
            </span>
          </div>
        )}
      </div>

      {item.predictedApprovalDate && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Est. approval:{' '}
              {new Date(item.predictedApprovalDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface StageColumnProps {
  stage: StageMetric
  items: PipelineItem[]
  onSelectItem?: (itemId: string) => void
}

function StageColumn({ stage, items, onSelectItem }: StageColumnProps) {
  const colors = stageColors[stage.stage]

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {stage.label}
          </h3>
          <span className="ml-auto text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {items.length}
          </span>
        </div>
        {stage.avgDays !== null && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-5">
            Avg. {stage.avgDays} days in stage
          </p>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <PipelineCard
            key={item.id}
            item={item}
            onClick={() => onSelectItem?.(item.id)}
          />
        ))}
        {items.length === 0 && (
          <div className="p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No items
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function PipelineTracker({
  pipelineItems,
  stageMetrics,
  timeRangeOptions,
  therapeuticAreaOptions,
  onSelectItem,
  onTimeRangeChange,
  onTherapeuticAreaChange,
}: PipelineTrackerProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1yr')
  const [selectedTherapeuticArea, setSelectedTherapeuticArea] = useState<string | null>(null)
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null)

  const manufacturers = Array.from(
    new Set(pipelineItems.map((item) => item.manufacturer))
  ).sort()

  const filteredItems = pipelineItems.filter((item) => {
    if (selectedTherapeuticArea && item.therapeuticArea !== selectedTherapeuticArea) {
      return false
    }
    if (selectedManufacturer && item.manufacturer !== selectedManufacturer) {
      return false
    }
    return true
  })

  const itemsByStage = stageMetrics.reduce(
    (acc, stage) => {
      acc[stage.stage] = filteredItems.filter((item) => item.stage === stage.stage)
      return acc
    },
    {} as Record<string, PipelineItem[]>
  )

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
    onTimeRangeChange?.(range)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          Pipeline Tracker
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Monitor regulatory progression and predicted approval timelines
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <Filter className="w-4 h-4 text-neutral-400" />

        <select
          value={selectedTimeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedTherapeuticArea || ''}
          onChange={(e) => {
            const value = e.target.value || null
            setSelectedTherapeuticArea(value)
            onTherapeuticAreaChange?.(value)
          }}
          className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
        >
          <option value="">All Therapeutic Areas</option>
          {therapeuticAreaOptions.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <select
          value={selectedManufacturer || ''}
          onChange={(e) => setSelectedManufacturer(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
        >
          <option value="">All Manufacturers</option>
          {manufacturers.map((mfr) => (
            <option key={mfr} value={mfr}>
              {mfr}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <TrendingUp className="w-4 h-4" />
          <span>{filteredItems.length} products tracked</span>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {stageMetrics.map((stage) => (
          <StageColumn
            key={stage.stage}
            stage={stage}
            items={itemsByStage[stage.stage] || []}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          Prediction Confidence
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              High (90%+)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Medium (80-89%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-400" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Low (&lt;80%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
