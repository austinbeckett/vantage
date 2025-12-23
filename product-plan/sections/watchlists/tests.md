# Test Instructions: Watchlists

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Watchlists allow users to create and manage surveillance criteria that monitor Health Canada databases for regulatory changes.

---

## User Flow Tests

### Flow 1: View Watchlists

**Scenario:** User views their watchlists

**Steps:**
1. User navigates to `/watchlists`
2. User sees list of their watchlists

**Expected Results:**
- [ ] Page title "Watchlists" displayed
- [ ] Each watchlist shows as a card
- [ ] Card displays: name, criteria tags, match count, recent activity
- [ ] "Create Watchlist" button is prominent

---

### Flow 2: Create New Watchlist

**Scenario:** User creates a new watchlist

**Steps:**
1. User clicks "Create Watchlist" button
2. User enters name: "Cardiovascular Generics"
3. User selects criteria: Active Ingredient = any, Route = "Oral"
4. User clicks "Create"

**Expected Results:**
- [ ] Create button opens modal/form
- [ ] Name field is required (shows error if empty)
- [ ] Criteria builder allows selecting: Ingredient, Manufacturer, Route, Form
- [ ] Multiple criteria can be added
- [ ] "Create" button saves the watchlist
- [ ] Success message: "Watchlist created"
- [ ] New watchlist appears in list

#### Failure Path: Validation Error

**Setup:**
- User tries to create without name

**Expected Results:**
- [ ] Error shown: "Watchlist name is required"
- [ ] Form is not submitted
- [ ] Focus moves to name field

---

### Flow 3: View Watchlist Matches

**Scenario:** User clicks a watchlist to see matching products

**Steps:**
1. User clicks on "Cardiovascular Generics" watchlist
2. Detail view opens showing matches

**Expected Results:**
- [ ] Navigates to watchlist detail page
- [ ] Shows watchlist name and criteria
- [ ] Lists all currently matching drug products
- [ ] Products displayed similar to Search results
- [ ] Back button returns to watchlist list

---

### Flow 4: Edit Watchlist

**Scenario:** User modifies watchlist criteria

**Steps:**
1. User clicks edit icon on a watchlist
2. Edit modal opens with current values
3. User adds "Manufacturer: Apotex" to criteria
4. User saves

**Expected Results:**
- [ ] Edit button/icon visible on watchlist cards
- [ ] Modal pre-fills with current name and criteria
- [ ] User can add/remove criteria
- [ ] "Save" updates the watchlist
- [ ] Success message: "Watchlist updated"
- [ ] Match count may change after edit

---

### Flow 5: Pause Notifications

**Scenario:** User pauses alerts for a watchlist

**Steps:**
1. User clicks pause toggle on a watchlist
2. Watchlist shows as paused

**Expected Results:**
- [ ] Pause toggle/button visible on each watchlist
- [ ] Clicking toggles pause state
- [ ] Paused watchlist shows visual indicator (e.g., "Paused" badge)
- [ ] Paused watchlist won't send email notifications
- [ ] User can resume by clicking again

---

### Flow 6: Delete Watchlist

**Scenario:** User deletes a watchlist

**Steps:**
1. User clicks delete button on watchlist
2. Confirmation dialog appears
3. User confirms deletion

**Expected Results:**
- [ ] Delete button/icon visible
- [ ] Confirmation dialog: "Delete [Watchlist Name]?"
- [ ] Cancel button closes dialog without action
- [ ] Confirm deletes the watchlist
- [ ] Watchlist removed from list
- [ ] Success message: "Watchlist deleted"

---

## Empty State Tests

### No Watchlists Yet

**Scenario:** New user with no watchlists

**Setup:**
- User has zero watchlists

**Expected Results:**
- [ ] Shows empty state illustration or icon
- [ ] Message: "You haven't created any watchlists yet"
- [ ] Description: "Create a watchlist to monitor regulatory changes for specific drugs, ingredients, or manufacturers"
- [ ] Prominent CTA: "Create Your First Watchlist" button
- [ ] Clicking CTA opens create form

### Watchlist With No Matches

**Scenario:** Watchlist criteria matches no current products

**Setup:**
- Watchlist exists with very specific criteria

**Expected Results:**
- [ ] Watchlist card shows "0 matches"
- [ ] Detail view shows: "No products currently match this criteria"
- [ ] Explanation: "Products matching your criteria will appear here when they exist in the database"

---

## Component Tests

### WatchlistCard

- [ ] Displays watchlist name prominently
- [ ] Shows criteria as tags/badges
- [ ] Shows match count (e.g., "24 matches")
- [ ] Shows recent activity count if any
- [ ] Pause indicator visible when paused
- [ ] Edit and delete icons accessible
- [ ] Card is clickable to view details

### Criteria Builder

- [ ] Dropdown for each criteria type
- [ ] Can add multiple criteria
- [ ] Each criterion shows as removable tag
- [ ] Clear indication of what will be monitored

---

## Edge Cases

- [ ] Very long watchlist names truncate properly
- [ ] Many criteria display without breaking layout
- [ ] Can have watchlists with overlapping criteria
- [ ] Handles network error when saving (shows error, retains form data)
- [ ] Deletion handles associated alerts appropriately

---

## Sample Test Data

```typescript
const mockWatchlists = [
  {
    id: 'wl-1',
    name: 'Cardiovascular Generics',
    description: 'Monitor all cardiovascular drugs',
    isPaused: false,
    matchCount: 156,
    recentActivityCount: 3,
    items: [
      { routeName: 'Oral' },
      { atcCode: 'C' }
    ]
  },
  {
    id: 'wl-2',
    name: 'Apotex Products',
    isPaused: true,
    matchCount: 287,
    recentActivityCount: 0,
    items: [
      { manufacturerName: 'Apotex Inc.' }
    ]
  }
]

const mockEmptyWatchlists = []

const mockWatchlistWithNoMatches = {
  id: 'wl-3',
  name: 'Specific Combo',
  matchCount: 0,
  items: [...]
}
```
