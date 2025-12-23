# Test Instructions: Search & Discovery

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Search & Discovery allows users to explore the unified Health Canada drug database with keyword search, filters, and interactive attribute selection.

---

## User Flow Tests

### Flow 1: Search by Keyword

**Scenario:** User searches for a drug by name

**Steps:**
1. User types "Cefazolin" in search bar
2. User presses Enter or clicks search icon
3. Results load

**Expected Results:**
- [ ] Search bar accepts text input
- [ ] Pressing Enter triggers search
- [ ] Loading indicator appears during search
- [ ] Results show drugs containing "Cefazolin"
- [ ] Result count displays (e.g., "24 results found")

#### Failure Path: No Results

**Setup:**
- Search term matches nothing

**Expected Results:**
- [ ] Empty state: "No products match your search"
- [ ] Suggestions: "Try different keywords or adjust filters"
- [ ] Search term is preserved in input

---

### Flow 2: Search by DIN

**Scenario:** User searches for specific DIN

**Steps:**
1. User types "02345678" in search bar
2. User submits search

**Expected Results:**
- [ ] System recognizes DIN format (8 digits)
- [ ] Returns exact DIN match (if exists)
- [ ] Shows "No product found with DIN 02345678" if not found

---

### Flow 3: Apply Filters

**Scenario:** User filters by manufacturer

**Steps:**
1. User clicks "Manufacturer" filter dropdown
2. User selects "Apotex Inc."
3. Results update

**Expected Results:**
- [ ] Filter dropdown shows list of manufacturers
- [ ] Selecting adds filter badge
- [ ] Results show only Apotex products
- [ ] Filter badge shows "Manufacturer: Apotex Inc." with X to remove

---

### Flow 4: Interactive Attribute Filtering

**Scenario:** User clicks attribute in expanded result to filter

**Steps:**
1. User expands a drug product result
2. User sees clickable attributes (Active Ingredient, Route, etc.)
3. User clicks "IV" under Route of Administration
4. "IV" added as filter, results update

**Expected Results:**
- [ ] Expanded view shows attributes as clickable chips/links
- [ ] Clicking attribute adds it as active filter
- [ ] Filter badge appears for the attribute
- [ ] Results update to show only IV products
- [ ] Multiple attributes can be combined

---

### Flow 5: Toggle View Mode

**Scenario:** User switches from table to card view

**Steps:**
1. User is viewing results in table format
2. User clicks card/grid icon
3. View switches to card layout

**Expected Results:**
- [ ] Toggle buttons clearly show current mode
- [ ] Switching to card view shows cards in grid
- [ ] Same data displayed in different format
- [ ] View preference persists during session

---

### Flow 6: Add to Watchlist

**Scenario:** User adds product to watchlist from results

**Steps:**
1. User clicks "Add to Watchlist" on a result
2. User selects target watchlist
3. Confirmation appears

**Expected Results:**
- [ ] "Add to Watchlist" button visible on each result
- [ ] Clicking opens watchlist selector
- [ ] After adding, shows success: "Added to [Watchlist Name]"

---

### Flow 7: View Regulatory History

**Scenario:** User views full history of a product

**Steps:**
1. User clicks "View History" on a product
2. Timeline/history view opens

**Expected Results:**
- [ ] "View History" action available
- [ ] Clicking navigates to full regulatory timeline
- [ ] Or: expands inline timeline with key dates

---

## Empty State Tests

### Initial State (No Search)

**Scenario:** User lands on page without searching

**Expected Results:**
- [ ] Shows helpful prompt: "Search for drugs by name, DIN, or use filters"
- [ ] May show recent searches or popular queries
- [ ] Filters are available to browse without searching

### No Results for Filters

**Setup:**
- Filters combination matches nothing

**Expected Results:**
- [ ] Message: "No products match your filters"
- [ ] Shows which filters are active
- [ ] "Clear all filters" button available

---

## Component Tests

### DrugProductCard

- [ ] Shows brand name prominently
- [ ] Shows DIN in monospace font
- [ ] Shows active ingredient
- [ ] Shows manufacturer
- [ ] Shows status badge with appropriate color
- [ ] Action buttons visible on hover

### DrugProductRow (Table View)

- [ ] Columns: Name, DIN, Ingredient, Manufacturer, Status
- [ ] Row is clickable to expand
- [ ] Status shows colored badge
- [ ] Actions in last column

### FilterBadge

- [ ] Shows filter type and value
- [ ] X button removes the filter
- [ ] Clicking X calls `onFilterChange` with filter removed

---

## Edge Cases

- [ ] Handles special characters in search
- [ ] Very long product names truncate properly
- [ ] Large result sets paginate (50+ results)
- [ ] Handles slow API with loading state
- [ ] Filter combinations work correctly (AND logic)

---

## Sample Test Data

```typescript
const mockProducts = [
  {
    id: 'dp-1',
    din: '02345678',
    brandName: 'Apo-Cefazolin',
    activeIngredientName: 'Cefazolin Sodium',
    manufacturerName: 'Apotex Inc.',
    routeName: 'Intravenous',
    dosageFormName: 'Powder for Solution',
    status: 'marketed'
  }
]

const mockFilters = {
  query: '',
  activeIngredientId: null,
  manufacturerId: 'mfr-1',
  routeId: null,
  dosageFormId: null,
  status: null
}

const mockEmptyResults = { items: [], total: 0 }
```
