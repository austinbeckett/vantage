import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: {
    name: string
    email?: string
    avatarUrl?: string
  }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 shadow-lg"
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Vantage
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <MainNav navigationItems={navigationItems} onNavigate={onNavigate} />

        {/* User Menu */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-neutral-900/20  z-30"
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-[280px] min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
