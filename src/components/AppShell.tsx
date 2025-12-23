import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'

interface AppShellProps {
  children: React.ReactNode
}

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Search & Discovery', href: '/search' },
  { label: 'Watchlists', href: '/watchlists' },
  { label: 'Competitive Intelligence', href: '/competitive-intelligence' },
  { label: 'Settings', href: '/settings' },
  { label: 'Help', href: '/help' },
]

export default function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, signOut } = useAuth()

  const handleNavigate = (href: string) => {
    navigate(href)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Get user display info (null if not authenticated)
  const userInfo = user
    ? {
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      }
    : null

  // Add isActive property based on current path
  const navItemsWithActive = navigationItems.map((item) => ({
    ...item,
    isActive: location.pathname === item.href || location.pathname.startsWith(item.href + '/'),
  }))

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        ) : (
          <Menu className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[280px] z-40
          bg-white dark:bg-neutral-800
          border-r border-neutral-200 dark:border-neutral-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-serif text-neutral-900 dark:text-neutral-100">
                  Vantage
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Command Center
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>

              {/* Theme Dropdown */}
              {isThemeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsThemeMenuOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg z-20 min-w-[140px]">
                    {themeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value)
                            setIsThemeMenuOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            theme === option.value
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <MainNav navigationItems={navItemsWithActive} onNavigate={handleNavigate} />

        {/* User Menu or Sign In */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
          {userInfo ? (
            <UserMenu user={userInfo} onLogout={handleLogout} />
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-neutral-900/30 z-30"
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-[280px] min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
