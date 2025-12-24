// =============================================================================
// Watchlist Tabbed View
// =============================================================================
// Container component for displaying watchlist data in three tabs

import { useState } from 'react'
import { Database, FileCheck, FileSearch, Sparkles } from 'lucide-react'
import { DPDTabContent, NOCTabContent, GSURTabContent } from './tabs'
import type { TabbedWatchlistData } from '../../lib/api/watchlist/fetcher'
import type { DPDViewFilters } from '../../lib/hooks/useWatchlistStorage'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type TabId = 'dpd' | 'noc' | 'gsur'

interface Tab {
  id: TabId
  label: string
  shortLabel: string
  icon: React.ReactNode
  count: number
  newCount: number
  color: string
  activeColor: string
}

interface WatchlistTabbedViewProps {
  data: TabbedWatchlistData | undefined
  isLoading: boolean
  dpdViewFilters?: DPDViewFilters
  onDPDViewFiltersChange?: (filters: DPDViewFilters) => void
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function WatchlistTabbedView({ data, isLoading, dpdViewFilters, onDPDViewFiltersChange }: WatchlistTabbedViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dpd')

  // Define tabs with counts from data
  const tabs: Tab[] = [
    {
      id: 'dpd',
      label: 'Drug Product Database',
      shortLabel: 'DPD',
      icon: <Database className="w-4 h-4" />,
      count: data?.dpd.count ?? 0,
      newCount: data?.dpd.newCount ?? 0,
      color: 'text-primary-600 dark:text-primary-400',
      activeColor: 'bg-primary-500',
    },
    {
      id: 'noc',
      label: 'Notice of Compliance Database',
      shortLabel: 'NOC',
      icon: <FileCheck className="w-4 h-4" />,
      count: data?.noc.count ?? 0,
      newCount: data?.noc.newCount ?? 0,
      color: 'text-mint-600 dark:text-mint-400',
      activeColor: 'bg-mint-500',
    },
    {
      id: 'gsur',
      label: 'Generic Submissions Under Review',
      shortLabel: 'GSUR',
      icon: <FileSearch className="w-4 h-4" />,
      count: data?.gsur.count ?? 0,
      newCount: data?.gsur.newCount ?? 0,
      color: 'text-tan-600 dark:text-tan-400',
      activeColor: 'bg-tan-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex gap-1 -mb-px" aria-label="Tabs">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium border-b-2 transition-all
                  ${isActive
                    ? `border-current ${tab.color}`
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>

                {/* Count Badge */}
                <span className={`
                  inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-medium
                  ${isActive
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }
                `}>
                  {isLoading ? '...' : tab.count}
                </span>

                {/* New Badge */}
                {!isLoading && tab.newCount > 0 && (
                  <span className={`
                    inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white
                    ${tab.activeColor}
                  `}>
                    <Sparkles className="w-2.5 h-2.5" />
                    {tab.newCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'dpd' && (
          <DPDTabContent
            products={data?.dpd.products ?? []}
            isLoading={isLoading}
            filters={dpdViewFilters}
            onFiltersChange={onDPDViewFiltersChange}
          />
        )}
        {activeTab === 'noc' && (
          <NOCTabContent
            entries={data?.noc.entries ?? []}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'gsur' && (
          <GSURTabContent
            entries={data?.gsur.entries ?? []}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Last Fetched Timestamp */}
      {data?.lastFetched && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-right">
          Last updated: {new Date(data.lastFetched).toLocaleString('en-CA', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
      )}
    </div>
  )
}
