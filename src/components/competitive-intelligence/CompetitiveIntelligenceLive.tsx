// =============================================================================
// Competitive Intelligence (Live API Version)
// =============================================================================
// Shows competitive intelligence data derived from live Health Canada APIs

import { useMemo } from 'react'
import {
  Building2, FileCheck, TrendingUp, Loader2, AlertCircle,
  RefreshCw, Info, ExternalLink, Pill
} from 'lucide-react'
import { useGSUR, useSUR } from '../../lib/api/unified/queries'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CompanyStats {
  name: string
  gsurCount: number
  surCount: number
  total: number
  therapeuticAreas: string[]
}

interface TherapeuticAreaStats {
  name: string
  count: number
  percentage: number
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CompetitiveIntelligenceLive() {
  const {
    data: gsurData = [],
    isLoading: gsurLoading,
    error: gsurError,
    refetch: refetchGSUR,
  } = useGSUR()

  const {
    data: surData = [],
    isLoading: surLoading,
    error: surError,
    refetch: refetchSUR,
  } = useSUR()

  const isLoading = gsurLoading || surLoading
  const hasError = gsurError || surError

  // Aggregate company stats from GSUR/SUR
  const companyStats = useMemo(() => {
    const companies = new Map<string, CompanyStats>()

    // Process GSUR entries
    gsurData.forEach(entry => {
      const name = entry.company_name
      const existing = companies.get(name)
      if (existing) {
        existing.gsurCount++
        existing.total++
        if (entry.therapeutic_area && !existing.therapeuticAreas.includes(entry.therapeutic_area)) {
          existing.therapeuticAreas.push(entry.therapeutic_area)
        }
      } else {
        companies.set(name, {
          name,
          gsurCount: 1,
          surCount: 0,
          total: 1,
          therapeuticAreas: entry.therapeutic_area ? [entry.therapeutic_area] : [],
        })
      }
    })

    // Process SUR entries
    surData.forEach(entry => {
      const name = entry.company_sponsor_name
      const existing = companies.get(name)
      if (existing) {
        existing.surCount++
        existing.total++
        if (entry.therapeutic_area && !existing.therapeuticAreas.includes(entry.therapeutic_area)) {
          existing.therapeuticAreas.push(entry.therapeutic_area)
        }
      } else {
        companies.set(name, {
          name,
          gsurCount: 0,
          surCount: 1,
          total: 1,
          therapeuticAreas: entry.therapeutic_area ? [entry.therapeutic_area] : [],
        })
      }
    })

    // Sort by total count
    return Array.from(companies.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 15)
  }, [gsurData, surData])

  // Aggregate therapeutic area stats
  const therapeuticAreaStats = useMemo(() => {
    const areas = new Map<string, number>()

    gsurData.forEach(entry => {
      const area = entry.therapeutic_area || 'Unspecified'
      areas.set(area, (areas.get(area) || 0) + 1)
    })

    surData.forEach(entry => {
      const area = entry.therapeutic_area || 'Unspecified'
      areas.set(area, (areas.get(area) || 0) + 1)
    })

    const total = gsurData.length + surData.length
    const sorted = Array.from(areas.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]): TherapeuticAreaStats => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))

    return sorted
  }, [gsurData, surData])

  const handleRefresh = () => {
    refetchGSUR()
    refetchSUR()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Competitive Intelligence
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Real-time submission data from Health Canada
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Live Data from GSUR & SUR
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This data is derived from Health Canada's Generic Submissions Under Review (GSUR)
              and Submissions Under Review (SUR) databases. Historical trends and market share
              calculations require a backend sync service.
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed to load some data
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {gsurError ? 'GSUR data unavailable. ' : ''}
                {surError ? 'SUR data unavailable. ' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : gsurData.length}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                GSUR Submissions
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : surData.length}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                SUR Submissions
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : companyStats.length}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Active Companies
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : therapeuticAreaStats.length}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Therapeutic Areas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">
              Loading competitive intelligence data...
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Companies */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-500" />
              Active Companies
            </h2>

            {companyStats.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No company data available
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {companyStats.map((company, idx) => (
                  <div
                    key={company.name}
                    className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-400 w-5">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {company.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-7">
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            GSUR: {company.gsurCount}
                          </span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            SUR: {company.surCount}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {company.total}
                        </div>
                        <div className="text-xs text-neutral-500">submissions</div>
                      </div>
                    </div>
                    {company.therapeuticAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 ml-7">
                        {company.therapeuticAreas.slice(0, 3).map(area => (
                          <span
                            key={area}
                            className="px-1.5 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 rounded"
                          >
                            {area}
                          </span>
                        ))}
                        {company.therapeuticAreas.length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs text-neutral-500">
                            +{company.therapeuticAreas.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Therapeutic Areas */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary-500" />
              Therapeutic Areas
            </h2>

            {therapeuticAreaStats.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No therapeutic area data available
              </div>
            ) : (
              <div className="space-y-3">
                {therapeuticAreaStats.map(area => (
                  <div key={area.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700 dark:text-neutral-300 truncate">
                        {area.name}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400 shrink-0 ml-2">
                        {area.count} ({area.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${area.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DPD Search Link */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Search for Approved Products
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Use the Search page to query the Drug Product Database for approved products.
            </p>
          </div>
          <a
            href="/search"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Go to Search
          </a>
        </div>
      </div>
    </div>
  )
}
