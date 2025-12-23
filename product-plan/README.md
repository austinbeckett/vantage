# Vantage - Product Export Package

This package contains everything needed to implement the Vantage application - a regulatory intelligence platform for pharmaceutical professionals monitoring Health Canada databases.

## Quick Start

### Option 1: One-Shot Implementation
Use `instructions/one-shot-instructions.md` for complete project implementation with all phases combined.

### Option 2: Incremental Implementation
Work through milestones in `instructions/incremental/`:
1. `01-foundation.md` — Design tokens, data model, routing, shell
2. `02-dashboard.md` — Dashboard with activity feed
3. `03-search-and-discovery.md` — Database explorer
4. `04-watchlists.md` — Surveillance management
5. `05-competitive-intelligence.md` — Analytics hub
6. `06-settings.md` — User preferences
7. `07-help.md` — Knowledge base

### Option 3: AI-Assisted Implementation
Use the prompts in `prompts/` to guide AI code generation:
- `one-shot-prompt.md` — Full implementation prompt
- `section-prompt.md` — Section-by-section prompt template

## Package Contents

```
product-plan/
├── README.md                      # This file
├── product-overview.md            # Product summary
│
├── design-system/                 # Design tokens
│   ├── tokens.css                # CSS custom properties
│   ├── tailwind-colors.md        # Tailwind configuration
│   └── fonts.md                  # Google Fonts setup
│
├── data-model/                    # Data definitions
│   ├── README.md                 # Entity relationships
│   └── types.ts                  # TypeScript interfaces
│
├── shell/                         # Application shell
│   ├── README.md                 # Shell documentation
│   └── components/               # React components
│       ├── AppShell.tsx
│       ├── MainNav.tsx
│       └── UserMenu.tsx
│
├── sections/                      # Feature sections
│   ├── dashboard/
│   ├── search-and-discovery/
│   ├── watchlists/
│   ├── competitive-intelligence/
│   ├── settings/
│   └── help/
│   Each section contains:
│       ├── README.md             # Feature overview
│       ├── tests.md              # TDD instructions
│       ├── types.ts              # TypeScript types
│       ├── sample-data.json      # Test data
│       ├── components/           # React components
│       └── *.png                 # Screenshots
│
├── instructions/                  # Implementation guides
│   ├── one-shot-instructions.md  # Complete guide
│   └── incremental/              # Milestone guides
│
└── prompts/                       # AI prompts
    ├── one-shot-prompt.md
    └── section-prompt.md
```

## What's Included

### Finished UI Components
- Props-based React components with Tailwind CSS styling
- Light and dark mode support
- Mobile responsive design
- Glassmorphism styling patterns

### Design System
- Color palette: amber (primary), emerald (secondary), stone (neutral)
- Typography: Inter (UI), JetBrains Mono (code)
- CSS custom properties and Tailwind configuration

### Data Model
- TypeScript interfaces for all entities
- Entity relationship documentation
- Sample data for testing

### Test Instructions
- Framework-agnostic test specifications
- User flow tests (success and failure paths)
- Component tests
- Edge case coverage

## What You Need to Build

- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of provided UI components with real data

## Design Philosophy

### Props-Based Components
All UI components receive data via props and communicate user actions via callback props. This makes them:
- **Portable** — Drop into any React project
- **Testable** — Easy to unit test with mock data
- **Flexible** — Connect to any backend or state management

### Test-Driven Development
Each section includes `tests.md` with detailed test specifications:
1. Write failing tests based on the specs
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

### Empty States
Don't forget to implement empty states for:
- New users with no data
- Filtered views with no matches
- Failed API calls

## Sections Overview

| Section | Purpose | Key Features |
|---------|---------|--------------|
| Dashboard | Command center | Activity feed, metrics, time range filter |
| Search & Discovery | Database explorer | Keyword search, attribute filtering, view toggle |
| Watchlists | Surveillance management | Criteria builder, match counts, pause/resume |
| Competitive Intelligence | Analytics hub | Pipeline tracker, competitor profiles, trends |
| Settings | Configuration | Profile, notifications, theme, timezone |
| Help | Knowledge base | Categories, search, articles |

## Screenshots

Visual references are included in each section folder. Screenshots show the finished UI to guide your implementation.

## Support

For questions about this export package, refer to:
- Individual section README files for feature details
- `tests.md` files for expected behavior specifications
- Sample data files for data structure examples
