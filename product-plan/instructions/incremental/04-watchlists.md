# Milestone 4: Watchlists

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

Implement Watchlists — the surveillance system where users create and manage targeted monitoring criteria for regulatory changes.

## Overview

Watchlists allow users to save search criteria that continuously monitor Health Canada databases for changes. When a drug product matching the criteria changes status, the user receives a Pulse notification.

**Key Functionality:**
- View all watchlists with criteria and recent activity counts
- Create new watchlists with flexible criteria (ingredient, manufacturer, route, etc.)
- Click a watchlist to see all currently matching products
- Edit watchlist criteria
- Pause/resume notifications for individual watchlists
- Delete watchlists

## Recommended Approach: Test-Driven Development

See `product-plan/sections/watchlists/tests.md` for detailed test-writing instructions.

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy from `product-plan/sections/watchlists/components/`:

- `Watchlists.tsx` — Main watchlist management view
- `WatchlistCard.tsx` — Individual watchlist card display
- `SearchableSelect.tsx` — Searchable dropdown for criteria selection

### Data Layer

```typescript
interface WatchlistsProps {
  watchlists: Watchlist[]
  onCreateWatchlist?: () => void
  onEditWatchlist?: (watchlistId: string) => void
  onDeleteWatchlist?: (watchlistId: string) => void
  onTogglePause?: (watchlistId: string) => void
  onViewWatchlist?: (watchlistId: string) => void
}
```

You'll need to:
- Create CRUD API for watchlists
- Implement criteria matching logic against drug products
- Track match counts and recent activity per watchlist
- Support pause/resume notification state

### Callbacks

| Callback | Description |
|----------|-------------|
| `onCreateWatchlist` | Open create watchlist modal/form |
| `onEditWatchlist` | Open edit modal for existing watchlist |
| `onDeleteWatchlist` | Delete watchlist with confirmation |
| `onTogglePause` | Pause/resume notifications |
| `onViewWatchlist` | Navigate to watchlist detail view |

### Empty States

- **No watchlists yet:** "You haven't created any watchlists. Create your first watchlist to start monitoring regulatory changes."
- **Watchlist with no matches:** "No products currently match this watchlist's criteria."

## Files to Reference

- `product-plan/sections/watchlists/README.md`
- `product-plan/sections/watchlists/tests.md`
- `product-plan/sections/watchlists/components/`
- `product-plan/sections/watchlists/types.ts`
- `product-plan/sections/watchlists/sample-data.json`
- `product-plan/sections/watchlists/screenshot.png`

## Expected User Flows

### Flow 1: Create New Watchlist

1. User clicks "Create Watchlist" button
2. User enters watchlist name
3. User selects criteria (e.g., Active Ingredient = "Cefazolin", Route = "IV")
4. User clicks "Create" to save
5. **Outcome:** New watchlist appears in list with match count

### Flow 2: View Watchlist Matches

1. User clicks on a watchlist card
2. View shows all drug products matching the criteria
3. User can browse/search within matches
4. **Outcome:** User sees exactly what the watchlist is monitoring

### Flow 3: Edit Watchlist Criteria

1. User clicks edit button on a watchlist
2. Edit modal opens with current criteria
3. User modifies criteria (adds manufacturer filter)
4. User saves changes
5. **Outcome:** Watchlist updates, match count recalculates

### Flow 4: Pause Notifications

1. User wants to temporarily stop alerts for a watchlist
2. User clicks pause toggle on the watchlist
3. Watchlist shows "paused" indicator
4. **Outcome:** No Pulse notifications until resumed

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Watchlist list displays with match counts
- [ ] Create watchlist with criteria builder works
- [ ] Edit watchlist works
- [ ] Delete watchlist works (with confirmation)
- [ ] Pause/resume toggle works
- [ ] Watchlist detail shows matching products
- [ ] Empty states display properly
- [ ] Responsive on mobile
