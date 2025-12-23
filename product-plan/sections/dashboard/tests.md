# Test Instructions: Dashboard

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Dashboard is the command center for Vantage, displaying metrics, activity feed, and quick actions. Test that users can view their regulatory monitoring status and interact with activity items.

---

## User Flow Tests

### Flow 1: View Dashboard Metrics

**Scenario:** User lands on dashboard and sees key metrics

**Setup:**
- User is authenticated
- Dashboard has sample metrics data

**Steps:**
1. User navigates to `/dashboard`
2. User sees metrics cards section

**Expected Results:**
- [ ] Metrics card "Total Watchlists" displays count (e.g., "12")
- [ ] Metrics card "Active Alerts" displays count
- [ ] Metrics card "New Matches" displays count with "this week" label
- [ ] Metrics card "Products Tracked" displays count
- [ ] All metrics show trend indicators if applicable

---

### Flow 2: Browse Activity Feed

**Scenario:** User views regulatory activity feed

**Setup:**
- Activity feed has multiple items of different types

**Steps:**
1. User views activity feed section
2. User scrolls through activity items

**Expected Results:**
- [ ] Activity items display in chronological order (newest first)
- [ ] Each item shows: drug product name, event type, timestamp
- [ ] Event type badges show correct labels ("Approval", "Submission", etc.)
- [ ] Database source indicator shows (DPD, NOC, GSUR)
- [ ] Unread items have visual distinction from read items

---

### Flow 3: Filter Activity by Type

**Scenario:** User filters activity to show only approvals

**Setup:**
- Activity feed has mixed event types

**Steps:**
1. User clicks filter dropdown
2. User selects "Approvals" filter
3. User views filtered results

**Expected Results:**
- [ ] Filter dropdown opens with options: All, Submissions, Approvals, Status Changes, Discontinuations
- [ ] After selecting "Approvals", only approval events display
- [ ] Active filter is visually indicated
- [ ] Count updates to show filtered total
- [ ] "Clear filters" option is available

#### Failure Path: No Results

**Setup:**
- Filter combination matches no items

**Expected Results:**
- [ ] Empty state displays: "No activity matches your filters"
- [ ] Reset filters button is shown
- [ ] Clicking reset returns to unfiltered view

---

### Flow 4: Change Time Range

**Scenario:** User changes from 24h to 7 days view

**Setup:**
- Activity data spans multiple weeks

**Steps:**
1. User sees time range toggle (24h | 7d | 30d)
2. User clicks "7d" button
3. Activity feed updates

**Expected Results:**
- [ ] Default selection is "24h"
- [ ] Clicking "7d" highlights that option
- [ ] Activity feed shows items from last 7 days
- [ ] Metrics may update to reflect 7-day period

---

### Flow 5: Quick-Add to Watchlist

**Scenario:** User adds a drug from activity to a watchlist

**Setup:**
- Activity item exists
- User has at least one watchlist

**Steps:**
1. User hovers/clicks on activity item
2. User clicks "Add to Watchlist" action
3. User selects target watchlist from dropdown
4. User confirms

**Expected Results:**
- [ ] "Add to Watchlist" button appears on activity items
- [ ] Dropdown shows user's watchlists by name
- [ ] After selection, success message: "Added to [Watchlist Name]"
- [ ] Button state changes to indicate already added (optional)

#### Failure Path: No Watchlists

**Setup:**
- User has no watchlists created

**Expected Results:**
- [ ] Dropdown shows "No watchlists yet"
- [ ] Link to create watchlist is provided
- [ ] Or: prompt to create first watchlist

---

### Flow 6: Dismiss Activity Item

**Scenario:** User dismisses an activity item

**Steps:**
1. User clicks dismiss/X button on an activity item
2. Item is removed or marked

**Expected Results:**
- [ ] Dismiss button visible on hover or always visible
- [ ] Clicking dismiss removes item from feed (or marks as dismissed)
- [ ] No confirmation required for dismiss
- [ ] Dismissed items don't reappear on refresh

---

## Empty State Tests

### No Activity Yet

**Scenario:** New user with no activity

**Setup:**
- User has no watchlists or no matches

**Expected Results:**
- [ ] Shows friendly message: "No activity yet"
- [ ] Shows guidance: "Create a watchlist to start monitoring regulatory changes"
- [ ] Shows prominent CTA: "Create Your First Watchlist" button
- [ ] Metrics show zeros gracefully

### No Recent Activity

**Scenario:** User has watchlists but no recent activity in time range

**Setup:**
- Watchlists exist but no matches in last 24 hours

**Expected Results:**
- [ ] Shows message: "No activity in the last 24 hours"
- [ ] Suggests trying longer time range
- [ ] Previous activity available if user switches to 7d/30d

---

## Component Interaction Tests

### Metric Cards

**Renders correctly:**
- [ ] Each card has icon, label, and value
- [ ] Values format correctly (numbers with commas for thousands)
- [ ] Trend indicators show up/down arrows with percentages

### Activity Item

**Renders correctly:**
- [ ] Drug product name is prominent
- [ ] Active ingredient shown
- [ ] Manufacturer name displayed
- [ ] Event type badge with appropriate color
- [ ] Timestamp shows relative time ("2 hours ago")

**User interactions:**
- [ ] Clicking item navigates to product detail (via `onViewProduct`)
- [ ] Hover reveals action buttons
- [ ] Dismiss button calls `onDismissActivity`

---

## Edge Cases

- [ ] Handles very long drug product names (truncation with tooltip)
- [ ] Handles activity feed with 100+ items (pagination or infinite scroll)
- [ ] Works correctly when API is slow (loading state shown)
- [ ] Handles API error gracefully (error message, retry option)
- [ ] Time range persists across navigation

---

## Sample Test Data

```typescript
const mockMetrics = {
  totalWatchlists: 5,
  activeAlerts: 12,
  newMatchesThisWeek: 8,
  totalProductsTracked: 156,
  recentDatabaseUpdates: 3
}

const mockActivityItems = [
  {
    id: 'act-1',
    type: 'approval',
    drugProduct: {
      id: 'dp-1',
      brandName: 'Apo-Cefazolin',
      din: '02345678',
      activeIngredientName: 'Cefazolin Sodium'
    },
    description: 'NOC granted for injectable formulation',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    source: 'NOC'
  }
]

const mockEmptyActivity = []
```
