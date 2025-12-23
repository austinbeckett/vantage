import {
  LayoutDashboard,
  Search,
  ListChecks,
  Bell,
  TrendingUp,
  Settings,
  HelpCircle,
} from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
  icon?: string
}

interface MainNavProps {
  navigationItems: NavigationItem[]
  onNavigate?: (href: string) => void
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  search: Search,
  watchlists: ListChecks,
  notifications: Bell,
  intelligence: TrendingUp,
  settings: Settings,
  help: HelpCircle,
}

// Map section names to icons
function getIconForLabel(label: string): React.ElementType {
  const lowerLabel = label.toLowerCase()
  if (lowerLabel.includes('dashboard') || lowerLabel.includes('overview')) {
    return iconMap.dashboard
  }
  if (lowerLabel.includes('search') || lowerLabel.includes('discovery')) {
    return iconMap.search
  }
  if (lowerLabel.includes('watchlist')) {
    return iconMap.watchlists
  }
  if (lowerLabel.includes('pulse') || lowerLabel.includes('notification') || lowerLabel.includes('alert')) {
    return iconMap.notifications
  }
  if (lowerLabel.includes('competitive') || lowerLabel.includes('intelligence') || lowerLabel.includes('analytics')) {
    return iconMap.intelligence
  }
  if (lowerLabel.includes('settings')) {
    return iconMap.settings
  }
  if (lowerLabel.includes('help') || lowerLabel.includes('documentation')) {
    return iconMap.help
  }
  return LayoutDashboard
}

export function MainNav({ navigationItems, onNavigate }: MainNavProps) {
  // Split navigation items into main and utility sections
  const mainItems = navigationItems.filter(
    (item) =>
      !item.label.toLowerCase().includes('settings') &&
      !item.label.toLowerCase().includes('help')
  )
  const utilityItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes('settings') ||
      item.label.toLowerCase().includes('help')
  )

  return (
    <nav className="flex-1 flex flex-col gap-1 px-3">
      {/* Main Navigation Items */}
      <div className="space-y-1">
        {mainItems.map((item) => {
          const Icon = getIconForLabel(item.label)
          return (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  item.isActive
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Spacer */}
      {utilityItems.length > 0 && <div className="flex-1" />}

      {/* Utility Items */}
      {utilityItems.length > 0 && (
        <div className="space-y-1 border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3">
          {utilityItems.map((item) => {
            const Icon = getIconForLabel(item.label)
            return (
              <button
                key={item.href}
                onClick={() => onNavigate?.(item.href)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${
                    item.isActive
                      ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </nav>
  )
}
