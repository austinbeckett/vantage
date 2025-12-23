# Milestone 2: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Dashboard — the command center providing real-time visibility into regulatory changes across all Health Canada databases.

## Overview

The Dashboard serves as the primary landing page for Vantage users. It displays a unified activity feed of regulatory changes (submissions, approvals, discontinuations), key metrics at a glance, and allows users to quickly filter and act on recent activity.

**Key Functionality:**
- View key metrics (total watchlists, active alerts, new matches, products tracked)
- Browse real-time activity feed showing regulatory changes
- Filter activity by database source, watchlist, event type, manufacturer, date range
- Toggle time range (24 hours, 7 days, 30 days)
- Click activity items to view drug product details
- Mark items as read or dismiss from feed
- Quick-add products to watchlists from the activity feed

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/dashboard/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/dashboard/components/`:

- `Dashboard.tsx` — Main dashboard component with metrics and activity feed

### Data Layer

The components expect these data shapes:

```typescript
interface DashboardProps {
  metrics: DashboardMetrics
  activityItems: ActivityItem[]
  watchlists: WatchlistSummary[]
  onViewProduct?: (productId: string) => void
  onDismissActivity?: (activityId: string) => void
  onAddToWatchlist?: (productId: string, watchlistId: string) => void
  onFilterChange?: (filters: ActivityFilters) => void
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void
}
```

You'll need to:
- Create API endpoints to fetch dashboard metrics
- Create API to fetch activity feed with filtering/pagination
- Implement real-time updates or polling for new activity
- Connect to watchlist data for quick-add functionality

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onViewProduct` | Navigate to drug product detail page |
| `onDismissActivity` | Mark activity item as dismissed |
| `onAddToWatchlist` | Add product to selected watchlist |
| `onFilterChange` | Update activity feed filters |
| `onTimeRangeChange` | Switch time range (24h/7d/30d) |

### Empty States

Implement empty state UI for:
- **No activity yet:** Show welcome message for new users with no watchlist matches
- **No matches for filters:** Show "No activity matches your filters" with reset option
- **No watchlists:** Prompt user to create their first watchlist

## Files to Reference

- `product-plan/sections/dashboard/README.md` — Feature overview
- `product-plan/sections/dashboard/tests.md` — Test-writing instructions
- `product-plan/sections/dashboard/components/` — React components
- `product-plan/sections/dashboard/types.ts` — TypeScript interfaces
- `product-plan/sections/dashboard/sample-data.json` — Test data
- `product-plan/sections/dashboard/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View Dashboard on Login

1. User logs in and lands on Dashboard
2. User sees metrics cards showing watchlist count, alerts, new matches
3. User sees activity feed with recent regulatory changes
4. **Outcome:** User has immediate visibility into what's changed

### Flow 2: Filter Activity Feed

1. User clicks filter dropdown
2. User selects "Approvals only" or specific watchlist
3. Activity feed updates to show filtered results
4. **Outcome:** User sees only relevant activity items

### Flow 3: Quick-Add to Watchlist

1. User sees interesting drug in activity feed
2. User clicks "Add to Watchlist" button on the item
3. User selects target watchlist from dropdown
4. **Outcome:** Drug is added to watchlist, confirmation shown

### Flow 4: Dismiss Activity Item

1. User reviews an activity item
2. User clicks dismiss/mark as read
3. Item is visually marked as read or removed from feed
4. **Outcome:** Activity feed shows unread items prominently

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Metrics display real data from backend
- [ ] Activity feed loads with pagination
- [ ] Filters work (database, watchlist, event type, date)
- [ ] Time range toggle updates feed
- [ ] Empty states display properly
- [ ] Quick-add to watchlist works
- [ ] Dismiss/mark as read works
- [ ] Responsive on mobile
