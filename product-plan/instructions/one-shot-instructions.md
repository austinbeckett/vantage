# Vantage: Complete Implementation Guide

> **One-Shot Implementation:** This document combines all milestone instructions for building the complete Vantage application. Use this for full project implementation.

---

## About This Package

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

## Product Overview

**Vantage** is a regulatory intelligence platform for pharmaceutical professionals. It provides real-time monitoring of Health Canada databases (DPD, NOC, GSUR), competitive analysis, and customizable watchlists with "Pulse" notifications.

### Sections

| Section | Description |
|---------|-------------|
| Dashboard | Command center with activity feed and key metrics |
| Search & Discovery | Interactive database explorer with attribute filtering |
| Watchlists | Surveillance criteria management for monitoring changes |
| Competitive Intelligence | Analytics hub with pipeline tracking and trend analysis |
| Settings | Account and notification preferences |
| Help | Self-service knowledge base |

### Design System

- **Primary Color:** `amber` — buttons, links, active states
- **Secondary Color:** `emerald` — success states, positive indicators
- **Neutral Color:** `stone` — backgrounds, text, borders
- **Fonts:** Inter (UI), JetBrains Mono (code/data)

---

## Phase 1: Foundation

### 1.1 Design Tokens

Configure your styling system:

- See `design-system/tokens.css` for CSS custom properties
- See `design-system/tailwind-colors.md` for Tailwind configuration
- See `design-system/fonts.md` for Google Fonts setup

### 1.2 Data Model Types

Create TypeScript interfaces:

- See `data-model/types.ts` for interface definitions
- See `data-model/README.md` for entity relationships

**Core Entities:**
- DrugProduct, ActiveIngredient, Manufacturer
- RouteOfAdministration, DosageForm, ATCClassification
- ProductStatus, Watchlist, WatchlistItem, Alert

### 1.3 Routing Structure

| Route | Section |
|-------|---------|
| `/` or `/dashboard` | Dashboard |
| `/search` | Search & Discovery |
| `/watchlists` | Watchlists |
| `/watchlists/:id` | Watchlist Detail |
| `/competitive-intelligence` | Competitive Intelligence |
| `/competitive-intelligence/pipeline` | Pipeline Tracker |
| `/competitive-intelligence/competitor/:id` | Competitor Deep Dive |
| `/competitive-intelligence/trends` | Trend Analysis |
| `/settings` | Settings |
| `/help` | Help |

### 1.4 Application Shell

Copy shell components from `shell/components/`:
- `AppShell.tsx` — Main layout wrapper with glassmorphism sidebar
- `MainNav.tsx` — Navigation component with section links
- `UserMenu.tsx` — User menu with avatar and logout

**Navigation Items:**
| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Search & Discovery | `/search` | Search |
| Watchlists | `/watchlists` | ListChecks |
| Competitive Intelligence | `/competitive-intelligence` | TrendingUp |
| Settings | `/settings` | Settings |
| Help | `/help` | HelpCircle |

---

## Phase 2: Dashboard

**Goal:** Real-time visibility into regulatory changes across Health Canada databases.

### Components
- `sections/dashboard/components/Dashboard.tsx`

### Key Features
- Metrics cards (watchlists, alerts, new matches, products tracked)
- Activity feed with regulatory changes
- Filtering by database, watchlist, event type, manufacturer
- Time range toggle (24h, 7d, 30d)
- Quick-add to watchlist from activity items

### Callbacks to Implement
| Callback | Description |
|----------|-------------|
| `onViewProduct` | Navigate to drug product detail |
| `onDismissActivity` | Mark activity item as dismissed |
| `onAddToWatchlist` | Add product to selected watchlist |
| `onFilterChange` | Update activity feed filters |
| `onTimeRangeChange` | Switch time range (24h/7d/30d) |

### Tests
See `sections/dashboard/tests.md` for TDD instructions.

---

## Phase 3: Search & Discovery

**Goal:** Interactive exploration of Health Canada's drug database with attribute filtering.

### Components
- `sections/search-and-discovery/components/SearchAndDiscovery.tsx`

### Key Features
- Search by DIN, keyword, or filter criteria
- Table and card view toggle
- Inline product expansion with details
- Clickable attributes add as filters
- Filter badges with removal
- Add to watchlist from results

### Callbacks to Implement
| Callback | Description |
|----------|-------------|
| `onSearch` | Execute keyword/DIN search |
| `onFilterChange` | Update active filters |
| `onSelectProduct` | Expand product inline |
| `onAddToWatchlist` | Add product to watchlist |
| `onViewHistory` | Navigate to regulatory history |
| `onAttributeClick` | Add attribute as filter |

### Tests
See `sections/search-and-discovery/tests.md` for TDD instructions.

---

## Phase 4: Watchlists

**Goal:** Create and manage surveillance criteria for regulatory monitoring.

### Components
- `sections/watchlists/components/Watchlists.tsx`
- `sections/watchlists/components/WatchlistCard.tsx`
- `sections/watchlists/components/SearchableSelect.tsx`

### Key Features
- View watchlists with criteria and match counts
- Create watchlists with flexible criteria builder
- View matching products for each watchlist
- Edit watchlist criteria
- Pause/resume notifications
- Delete watchlists

### Callbacks to Implement
| Callback | Description |
|----------|-------------|
| `onCreateWatchlist` | Open create form |
| `onEditWatchlist` | Open edit modal |
| `onDeleteWatchlist` | Delete with confirmation |
| `onTogglePause` | Pause/resume notifications |
| `onViewWatchlist` | Navigate to watchlist detail |

### Tests
See `sections/watchlists/tests.md` for TDD instructions.

---

## Phase 5: Competitive Intelligence

**Goal:** Analytics hub surfacing competitive landscape insights and trends.

### Components

**Dashboard:**
- `sections/competitive-intelligence/components/CompetitiveIntelligence.tsx`

**Pipeline Tracker:**
- `sections/competitive-intelligence/components/PipelineTracker.tsx`

**Competitor Deep Dive:**
- `sections/competitive-intelligence/components/CompetitorDeepDive.tsx`

**Trend Analysis:**
- `sections/competitive-intelligence/components/TrendAnalysis.tsx`

### Key Features
- Metrics overview with key competitive indicators
- Market share visualization (by therapeutic area, manufacturer)
- Pipeline kanban board with stage progression
- Competitor profiles with portfolio analysis
- Time-series trend charts
- Competitor comparison
- Save custom views, export reports

### Callbacks to Implement
| Callback | Description |
|----------|-------------|
| `onSelectCompetitor` | Navigate to competitor deep dive |
| `onSelectPipelineItem` | View pipeline item details |
| `onTimeRangeChange` | Update time range for charts |
| `onTherapeuticAreaChange` | Filter by therapeutic area |
| `onSaveView` | Save current filters as named view |
| `onExportPdf` | Generate PDF report |
| `onExportExcel` | Export data to Excel |

### Tests
See `sections/competitive-intelligence/tests.md` for TDD instructions.

---

## Phase 6: Settings

**Goal:** Central configuration for account, notifications, and preferences.

### Components
- `sections/settings/components/Settings.tsx`

### Key Features
- Profile editing (name, email)
- Password change with validation
- Notification frequency (instant, daily digest, weekly)
- Quiet hours configuration
- Notification type toggles
- Theme selection (light, dark, system)
- Timezone preference
- Default startup view
- Logout

### Callbacks to Implement
| Callback | Description |
|----------|-------------|
| `onUpdateProfile` | Save profile changes |
| `onChangePassword` | Change user password |
| `onUpdateNotifications` | Update notification settings |
| `onUpdatePreferences` | Update app preferences |
| `onLogout` | Log user out |

### Tests
See `sections/settings/tests.md` for TDD instructions.

---

## Phase 7: Help

**Goal:** Self-service documentation with searchable knowledge base.

### Components
- `sections/help/components/Help.tsx`

### Key Features
- Task-based category browsing
- Expand/collapse categories
- Keyword search across articles
- Article view with related suggestions
- Breadcrumb navigation

### Callbacks to Implement
| Callback | Description |
|----------|-------------|
| `onSearch` | Search articles by keyword |
| `onSelectCategory` | Expand/focus category |
| `onSelectArticle` | View full article |

### Tests
See `sections/help/tests.md` for TDD instructions.

---

## Implementation Checklist

### Foundation
- [ ] Design tokens configured (colors, fonts)
- [ ] Data model types defined
- [ ] Routes created for all sections
- [ ] Shell renders with navigation
- [ ] Responsive on mobile

### Dashboard
- [ ] Metrics display real data
- [ ] Activity feed with filtering
- [ ] Time range toggle works
- [ ] Quick-add to watchlist works

### Search & Discovery
- [ ] Search returns results
- [ ] Filters and attribute clicking work
- [ ] Table/card toggle works
- [ ] Pagination works

### Watchlists
- [ ] CRUD operations work
- [ ] Criteria builder works
- [ ] Match counts display
- [ ] Pause/resume works

### Competitive Intelligence
- [ ] Dashboard metrics display
- [ ] Market share charts render
- [ ] Pipeline tracker works
- [ ] Competitor profiles work
- [ ] Trend analysis works
- [ ] Export functionality works

### Settings
- [ ] Profile editing works
- [ ] Password change works
- [ ] Notification settings persist
- [ ] Theme toggle works
- [ ] Logout works

### Help
- [ ] Categories display
- [ ] Search works
- [ ] Article view works
- [ ] Navigation works

---

## File Reference

```
product-plan/
├── README.md                    # Quick start guide
├── product-overview.md          # Product summary
├── design-system/
│   ├── tokens.css              # CSS custom properties
│   ├── tailwind-colors.md      # Tailwind configuration
│   └── fonts.md                # Google Fonts setup
├── data-model/
│   ├── README.md               # Entity relationships
│   └── types.ts                # TypeScript interfaces
├── shell/
│   ├── README.md               # Shell documentation
│   └── components/             # Shell React components
├── sections/
│   ├── dashboard/
│   │   ├── README.md           # Section overview
│   │   ├── tests.md            # TDD instructions
│   │   ├── types.ts            # Section types
│   │   ├── sample-data.json    # Test data
│   │   ├── components/         # React components
│   │   └── *.png               # Screenshots
│   ├── search-and-discovery/
│   ├── watchlists/
│   ├── competitive-intelligence/
│   ├── settings/
│   └── help/
├── instructions/
│   ├── one-shot-instructions.md  # This file
│   └── incremental/              # Mileneutral-by-milestone guides
└── prompts/
    ├── one-shot-prompt.md        # AI implementation prompt
    └── section-prompt.md         # Section-specific prompt template
```
