# Milestone 3: Search & Discovery

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

Implement Search & Discovery — the executive dashboard for exploring Health Canada's unified drug product database with interactive filtering.

## Overview

Search & Discovery allows users to search across all Health Canada databases (DPD, NOC, GSUR) using keywords, DIN lookup, or filter criteria. Users can expand drug products to see details and click on attributes to dynamically refine their search.

**Key Functionality:**
- Search by DIN, keyword, or filter criteria
- Toggle between table view and card grid view
- Expand products inline to see detailed attributes
- Click attributes (molecule, route, manufacturer) to add as filters
- View active filter badges and remove individual filters
- Add drugs to watchlists directly from results
- View regulatory history for any product

## Recommended Approach: Test-Driven Development

See `product-plan/sections/search-and-discovery/tests.md` for detailed test-writing instructions.

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy from `product-plan/sections/search-and-discovery/components/`:

- `SearchAndDiscovery.tsx` — Main search interface
- `DrugProductCard.tsx` — Card view for drug products
- `DrugProductRow.tsx` — Table row view for drug products
- `FilterBadge.tsx` — Active filter badge component
- `RegulatoryTimeline.tsx` — Timeline visualization

### Data Layer

```typescript
interface SearchAndDiscoveryProps {
  results: DrugProduct[]
  filters: SearchFilters
  totalResults: number
  isLoading: boolean
  onSearch?: (query: string) => void
  onFilterChange?: (filters: SearchFilters) => void
  onSelectProduct?: (productId: string) => void
  onAddToWatchlist?: (productId: string) => void
  onViewHistory?: (productId: string) => void
  onAttributeClick?: (attribute: string, value: string) => void
}
```

You'll need to:
- Create search API with full-text search across drug products
- Implement filter API for Active Ingredient, Manufacturer, Route, Dosage Form
- Support pagination for large result sets
- Enable attribute-based filtering (clicking molecule adds it as filter)

### Callbacks

| Callback | Description |
|----------|-------------|
| `onSearch` | Execute keyword/DIN search |
| `onFilterChange` | Update active filters |
| `onSelectProduct` | Expand product inline for details |
| `onAddToWatchlist` | Add product to a watchlist |
| `onViewHistory` | Navigate to full regulatory history |
| `onAttributeClick` | Add clicked attribute as a filter |

### Empty States

- **No search results:** "No products match your search. Try different keywords or adjust filters."
- **Initial state:** Show popular/recent searches or browsing suggestions

## Files to Reference

- `product-plan/sections/search-and-discovery/README.md`
- `product-plan/sections/search-and-discovery/tests.md`
- `product-plan/sections/search-and-discovery/components/`
- `product-plan/sections/search-and-discovery/types.ts`
- `product-plan/sections/search-and-discovery/sample-data.json`
- `product-plan/sections/search-and-discovery/screenshot.png`

## Expected User Flows

### Flow 1: Search by Keyword

1. User types "Cefazolin" in search bar
2. User presses Enter or clicks search
3. Results show all drug products containing "Cefazolin"
4. **Outcome:** User sees matching products with relevant details

### Flow 2: Interactive Attribute Filtering

1. User searches for a drug and expands a result
2. User sees clickable attributes (Active Ingredient, Route, etc.)
3. User clicks "IV" route attribute
4. "IV" is added as active filter, results update
5. **Outcome:** User has refined search to only IV products

### Flow 3: Add Product to Watchlist

1. User finds a drug product of interest
2. User clicks "Add to Watchlist" button
3. User selects target watchlist
4. **Outcome:** Product criteria added to watchlist

### Flow 4: Toggle View Mode

1. User is viewing results in table mode
2. User clicks card grid toggle
3. View switches to card layout
4. **Outcome:** Same results displayed in preferred format

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Search returns results from unified database
- [ ] Filters work (ingredient, manufacturer, route, form)
- [ ] Attribute clicking adds filters dynamically
- [ ] Filter badges show and can be removed
- [ ] Table/card view toggle works
- [ ] Product expansion shows details
- [ ] Add to watchlist works
- [ ] Pagination works for large result sets
- [ ] Empty states display properly
- [ ] Responsive on mobile
