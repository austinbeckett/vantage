# Vantage Application Shell

## Overview

The Vantage application shell features a refined sidebar navigation designed for pharmaceutical executives. The shell provides persistent access to all main sections with a warm terracotta/ivory aesthetic inspired by Anthropic's design language that creates a premium command center experience.

## Components

### AppShell.tsx
Main layout wrapper that renders the sidebar navigation and content area.

**Props:**
- `children` — Page content to render in the main area
- `currentPath` — Current route path for active state
- `user` — User object for the user menu

### MainNav.tsx
Navigation component with section links.

**Navigation Items:**
| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Search & Discovery | `/search` | Search |
| Watchlists | `/watchlists` | ListChecks |
| Competitive Intelligence | `/competitive-intelligence` | TrendingUp |
| Settings | `/settings` | Settings |
| Help | `/help` | HelpCircle |

### UserMenu.tsx
User menu component displayed at the bottom of the sidebar.

**Props:**
- `user` — User name and avatar
- `onLogout` — Logout callback

## Design Specifications

**Layout:**
- Sidebar width: 280px on desktop
- Clean card design with warm terracotta/neutral tones
- Active nav items highlighted with primary-500 accent
- User menu anchored at bottom with subtle divider

**Responsive Behavior:**
- Desktop (1024px+): Full sidebar visible with all labels
- Tablet (768-1023px): Can collapse to icon-only mode (64px)
- Mobile (<768px): Hidden by default, hamburger opens overlay

**Styling:**
- Cards: `bg-white dark:bg-neutral-800`
- Border: `border-neutral-200 dark:border-neutral-700`
- Active state: `bg-primary-100 dark:bg-primary-900/30`
- Transitions: 200ms ease on all interactive elements

## Usage

```tsx
import { AppShell } from './components/AppShell'

function App() {
  return (
    <AppShell
      currentPath="/dashboard"
      user={{ name: 'John Doe', email: 'john@example.com' }}
    >
      <DashboardPage />
    </AppShell>
  )
}
```

## Wire Up Navigation

Connect the navigation callbacks to your router:

```tsx
// Example with React Router
const navigate = useNavigate()

<MainNav
  currentPath={location.pathname}
  onNavigate={(path) => navigate(path)}
/>
```

## See Also

- `screenshot.png` — Visual reference (if available)
- `product-plan/design-system/` — Design tokens
