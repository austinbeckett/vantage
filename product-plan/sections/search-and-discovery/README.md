# Search & Discovery

## Overview

Executive dashboard for exploring Health Canada's unified drug product database. Users can search by keywords, DIN, or apply filters to find drugs, then interactively click on product attributes to dynamically refine their search across all databases.

## User Flows

- Search by DIN, keyword, or apply filter criteria
- Toggle between table view and card grid view
- Expand drug product to reveal clickable attributes
- Click attributes (Active Ingredient, Route, Dosage Form) to add as filters
- View active filter badges and remove individual filters
- Add drugs to watchlist or view full regulatory history

## Components Provided

- `SearchAndDiscovery.tsx` — Main search interface
- `DrugProductCard.tsx` — Card view for drug products
- `DrugProductRow.tsx` — Table row view for drug products
- `FilterBadge.tsx` — Active filter badge component
- `RegulatoryTimeline.tsx` — Timeline visualization for drug history

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSearch` | Called when user executes a search |
| `onFilterChange` | Called when filters are updated |
| `onSelectProduct` | Called when user expands a product for details |
| `onAddToWatchlist` | Called when user adds product to watchlist |
| `onViewHistory` | Called when user wants full regulatory history |
| `onAttributeClick` | Called when user clicks an attribute to filter by it |

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Data Used

**From types.ts:**
- `DrugProduct` — Drug product records
- `SearchFilters` — Filter state
- `SearchResults` — Paginated results

**From global model:**
- DrugProduct, ActiveIngredient, Manufacturer, Route, DosageForm
