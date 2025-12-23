# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Color Palette:**
- Primary: `amber` — buttons, links, active states
- Secondary: `emerald` — success states, positive indicators
- Neutral: `stone` — backgrounds, text, borders

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Core Entities:**
- DrugProduct, ActiveIngredient, Manufacturer
- RouteOfAdministration, DosageForm, ATCClassification
- ProductStatus, Watchlist, WatchlistItem, Alert

### 3. Routing Structure

Create placeholder routes for each section:

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

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with glassmorphism sidebar
- `MainNav.tsx` — Navigation component with section links
- `UserMenu.tsx` — User menu with avatar and logout

**Wire Up Navigation:**

Connect navigation to your routing:

| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Search & Discovery | `/search` | Search |
| Watchlists | `/watchlists` | ListChecks |
| Competitive Intelligence | `/competitive-intelligence` | TrendingUp |
| Settings | `/settings` | Settings |
| Help | `/help` | HelpCircle |

**User Menu:**

The user menu expects:
- User name (string)
- User initials for avatar fallback
- Logout callback function

**Responsive Behavior:**
- Desktop (1024px+): Full sidebar visible
- Tablet (768-1023px): Collapsible to icon-only mode
- Mobile (<768px): Hidden by default, hamburger menu opens overlay

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components
- `product-plan/shell/screenshot.png` — Shell visual reference (if exists)

## Done When

- [ ] Design tokens are configured (colors, fonts)
- [ ] Data model types are defined in TypeScript
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with glassmorphism sidebar
- [ ] Navigation links to correct routes
- [ ] Active nav item is highlighted
- [ ] User menu shows user info
- [ ] Logout button works
- [ ] Responsive on mobile (hamburger menu)
- [ ] Light/dark mode toggle works
