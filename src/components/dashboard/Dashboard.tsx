import { useState } from 'react'
import {
  Eye, Bell, TrendingUp, Database, FileCheck, Shield,
  Filter, Clock, Check, X, Plus, Share2, Download,
  Calendar, AlertCircle
} from 'lucide-react'
import type {
  DashboardProps,
  ActivityItem,
  TimeRange
} from '../../types/dashboard'

export function Dashboard({
  stats,
  activityFeed: initialFeed,
  upcomingDates,
  filterOptions,
  onViewProduct,
  onMarkAsRead,
  onDismiss,
  onAddToWatchlist,
  onShare,
  onExport,
  onViewWatchlist
}: DashboardProps) {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(initialFeed)
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedWatchlists, setSelectedWatchlists] = useState<string[]>([])
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')

  // Filter activity feed
  const filteredFeed = activityFeed.filter(item => {
    if (selectedDatabases.length > 0 && !selectedDatabases.includes(item.database.toLowerCase())) {
      return false
    }
    if (selectedEventTypes.length > 0 && !selectedEventTypes.includes(item.eventType)) {
      return false
    }
    if (selectedWatchlists.length > 0) {
      if (!item.triggeredWatchlist || !selectedWatchlists.includes(item.triggeredWatchlist.id)) {
        return false
      }
    }
    if (readFilter === 'unread' && item.isRead) return false
    if (readFilter === 'read' && !item.isRead) return false
    return true
  })

  const unreadCount = activityFeed.filter(item => !item.isRead).length

  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    setActivityFeed(prev => prev.map(item =>
      item.id === id ? { ...item, isRead: true, isNew: false } : item
    ))
    onMarkAsRead?.(id)
  }

  // Handle dismiss
  const handleDismiss = (id: string) => {
    setActivityFeed(prev => prev.filter(item => item.id !== id))
    onDismiss?.(id)
  }

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setActivityFeed(prev => prev.map(item => ({ ...item, isRead: true, isNew: false })))
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Get database color
  const getDatabaseColor = (db: string) => {
    switch (db) {
      case 'DPD': return 'bg-azure-100 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300'
      case 'NOC': return 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
      case 'GSUR': return 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300'
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
    }
  }

  // Get event type icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <Database className="w-4 h-4" />
      case 'noc_issued': return <FileCheck className="w-4 h-4" />
      case 'new_submission': return <Plus className="w-4 h-4" />
      case 'safety_update': return <Shield className="w-4 h-4" />
      case 'label_change': return <FileCheck className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Real-time regulatory activity across Health Canada databases
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Watchlists */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalWatchlists}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Watchlists
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.activeAlerts}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Active alerts
              </div>
            </div>
          </div>
        </div>

        {/* New This Week */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-azure-100 dark:bg-azure-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-azure-600 dark:text-azure-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                +{stats.newMatchesThisWeek}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                New this week
              </div>
            </div>
          </div>
        </div>

        {/* Products Tracked */}
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalProductsTracked}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Products tracked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Activity Mini Stats */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-azure-50 dark:bg-azure-900/20 rounded-lg">
          <span className="text-xs font-medium text-azure-700 dark:text-azure-300">DPD</span>
          <span className="text-xs text-azure-600 dark:text-azure-400">{stats.recentDpdUpdates} updates</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
          <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">NOC</span>
          <span className="text-xs text-secondary-600 dark:text-secondary-400">{stats.recentNocUpdates} updates</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg">
          <span className="text-xs font-medium text-lavender-700 dark:text-lavender-300">GSUR</span>
          <span className="text-xs text-lavender-600 dark:text-lavender-400">{stats.recentGsurUpdates} updates</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold font-serif text-neutral-900 dark:text-neutral-100">
                Activity Feed
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                  transition-colors
                  ${showFilters
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }
                `}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Time Range Toggle */}
          <div className="flex items-center gap-2">
            {(['24h', '7d', '30d'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${timeRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }
                `}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Database Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Database
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.databases.map(db => (
                      <button
                        key={db.id}
                        onClick={() => setSelectedDatabases(prev =>
                          prev.includes(db.id)
                            ? prev.filter(d => d !== db.id)
                            : [...prev, db.id]
                        )}
                        className={`
                          px-2 py-1 rounded text-xs font-medium transition-colors
                          ${selectedDatabases.includes(db.id)
                            ? getDatabaseColor(db.name)
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                          }
                        `}
                      >
                        {db.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Type Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Event Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.eventTypes.slice(0, 3).map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedEventTypes(prev =>
                          prev.includes(type.id)
                            ? prev.filter(t => t !== type.id)
                            : [...prev, type.id]
                        )}
                        className={`
                          px-2 py-1 rounded text-xs font-medium transition-colors
                          ${selectedEventTypes.includes(type.id)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                          }
                        `}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watchlist Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Watchlist
                  </label>
                  <select
                    value={selectedWatchlists[0] || ''}
                    onChange={(e) => setSelectedWatchlists(e.target.value ? [e.target.value] : [])}
                    className="w-full px-2 py-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <option value="">All watchlists</option>
                    {filterOptions.watchlists.map(wl => (
                      <option key={wl.id} value={wl.id}>{wl.name}</option>
                    ))}
                  </select>
                </div>

                {/* Read/Unread Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Status
                  </label>
                  <div className="flex gap-1.5">
                    {(['all', 'unread', 'read'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setReadFilter(filter)}
                        className={`
                          px-2 py-1 rounded text-xs font-medium transition-colors capitalize
                          ${readFilter === filter
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                          }
                        `}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedDatabases.length > 0 || selectedEventTypes.length > 0 || selectedWatchlists.length > 0 || readFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedDatabases([])
                    setSelectedEventTypes([])
                    setSelectedWatchlists([])
                    setReadFilter('all')
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Activity Items */}
          <div className="space-y-3">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <Clock className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400">No activity matches your filters</p>
              </div>
            ) : (
              filteredFeed.map(item => (
                <div
                  key={item.id}
                  className={`
                    group relative
                    bg-white dark:bg-neutral-800
                    border border-neutral-200 dark:border-neutral-700
                    rounded-xl
                    overflow-hidden
                    hover:border-primary-500/30 dark:hover:border-primary-500/30
                    hover:shadow-lg hover:shadow-primary-500/5
                    transition-all duration-300
                    ${!item.isRead ? 'ring-2 ring-primary-500/20' : ''}
                  `}
                >
                  {/* Unread indicator */}
                  {!item.isRead && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Event Icon */}
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                        ${getDatabaseColor(item.database)}
                      `}>
                        {getEventIcon(item.eventType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <button
                              onClick={() => onViewProduct?.(item.drugProductId)}
                              className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left"
                            >
                              {item.drugProductName}
                            </button>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                              {item.eventDescription}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDatabaseColor(item.database)}`}>
                              {item.database}
                            </span>
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span>DIN: {item.din}</span>
                          <span>{item.manufacturer}</span>
                          {item.triggeredWatchlist && (
                            <button
                              onClick={() => onViewWatchlist?.(item.triggeredWatchlist!.id)}
                              className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <Eye className="w-3 h-3" />
                              {item.triggeredWatchlist.name}
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!item.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(item.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(item.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>
                          <button
                            onClick={() => onAddToWatchlist?.(item.drugProductId)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add to watchlist
                          </button>
                          <button
                            onClick={() => onShare?.(item.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <Share2 className="w-3 h-3" />
                            Share
                          </button>
                          <button
                            onClick={() => onExport?.(item.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Upcoming Dates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-serif text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Upcoming Dates
          </h2>

          <div className="space-y-3">
            {upcomingDates.map(date => (
              <div
                key={date.id}
                className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${date.type === 'deadline'
                      ? 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400'
                      : date.type === 'submission'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-azure-100 dark:bg-azure-900/30 text-azure-600 dark:text-azure-400'
                    }
                  `}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                      {date.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {date.description}
                    </p>
                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-1.5">
                      {new Date(date.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Trend Mini Chart */}
          <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              7-Day Activity Trend
            </h3>
            <div className="flex items-end gap-1 h-16">
              {stats.activityTrend.map((value, idx) => {
                const max = Math.max(...stats.activityTrend)
                const height = (value / max) * 100
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-primary-500/80 rounded-t transition-all hover:bg-primary-500"
                    style={{ height: `${height}%` }}
                    title={`${value} events`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-400">
              <span>6d ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
