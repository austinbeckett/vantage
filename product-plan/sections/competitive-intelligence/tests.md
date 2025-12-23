# Test Instructions: Competitive Intelligence

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Competitive Intelligence provides analytics on the competitive landscape, including market share, pipeline tracking, competitor profiles, and trend analysis.

---

## User Flow Tests

### Flow 1: View CI Dashboard

**Scenario:** User views competitive intelligence overview

**Steps:**
1. User navigates to `/competitive-intelligence`
2. Dashboard loads with metrics and charts

**Expected Results:**
- [ ] Page title "Competitive Intelligence" displayed
- [ ] Metric cards show: Competitors Tracked, Recent Submissions, Recent Approvals, etc.
- [ ] Market share pie chart renders with data
- [ ] Recent activity feed shows competitor events
- [ ] Competitor list shows tracked companies

---

### Flow 2: View Market Share Chart

**Scenario:** User examines market share distribution

**Steps:**
1. User views market share chart on dashboard
2. User hovers over chart segments

**Expected Results:**
- [ ] Pie/donut chart renders with segments
- [ ] Legend shows category/company names with colors
- [ ] Hovering shows percentage tooltip
- [ ] Can toggle between "By Therapeutic Area" and "By Manufacturer" views

---

### Flow 3: Navigate to Pipeline Tracker

**Scenario:** User views pipeline kanban board

**Steps:**
1. User clicks "Pipeline Tracker" tab/link
2. Kanban board loads

**Expected Results:**
- [ ] Four columns: Submitted, Under Review, NOC Granted, Marketed
- [ ] Each column shows products as cards
- [ ] Column headers show count
- [ ] Cards show: product name, manufacturer, days in stage
- [ ] Confidence indicators visible where applicable

---

### Flow 4: Filter Pipeline by Therapeutic Area

**Scenario:** User filters pipeline to one therapeutic area

**Steps:**
1. User selects "Cardiovascular" from therapeutic area dropdown
2. Pipeline updates

**Expected Results:**
- [ ] Dropdown shows all therapeutic areas
- [ ] Selecting filters all columns to show only matching products
- [ ] Product counts update per column
- [ ] "All Therapeutic Areas" option clears filter

---

### Flow 5: View Competitor Deep Dive

**Scenario:** User views detailed competitor profile

**Steps:**
1. User clicks on "Apotex Inc." from competitor list
2. Deep dive page loads

**Expected Results:**
- [ ] Competitor name and headquarters displayed
- [ ] Stats cards: Total Products, Marketed, Pending, Market Share
- [ ] Portfolio bar chart by therapeutic area
- [ ] Recent activity timeline
- [ ] Monthly activity chart (approvals vs submissions)

---

### Flow 6: Compare Competitors

**Scenario:** User compares two competitors

**Steps:**
1. User is viewing Apotex deep dive
2. User selects "Teva Canada" from "Compare with" dropdown
3. Comparison metrics appear

**Expected Results:**
- [ ] "Compare with" dropdown shows other competitors
- [ ] Selecting shows side-by-side comparison
- [ ] Metrics highlight which competitor is better
- [ ] Comparison shows: Avg Approval Time, Recent Approvals, Market Share

---

### Flow 7: Analyze Trends

**Scenario:** User views approval trends over time

**Steps:**
1. User navigates to Trend Analysis view
2. User selects "Last 3 Years" time range

**Expected Results:**
- [ ] Time range selector: 1yr, 3yr, 5yr, All Time
- [ ] Bar chart shows approvals & submissions by month
- [ ] Therapeutic area breakdown chart displays
- [ ] Key insights panel shows trend summary
- [ ] Stats cards update for selected time range

---

### Flow 8: Save Custom View

**Scenario:** User saves filter configuration

**Steps:**
1. User applies filters (Therapeutic Area = Cardiovascular, Time = 1yr)
2. User clicks "Save View"
3. User names view "Cardio Watch"

**Expected Results:**
- [ ] "Save View" button visible in toolbar
- [ ] Clicking opens name input
- [ ] Saving adds to saved views list
- [ ] Saved view can be loaded later

---

### Flow 9: Export Report

**Scenario:** User exports data to PDF

**Steps:**
1. User clicks "Export" button
2. User selects "PDF" format
3. Download initiates

**Expected Results:**
- [ ] Export button visible in toolbar
- [ ] Options: PDF, Excel
- [ ] Selecting PDF generates and downloads file
- [ ] File contains current view's data and charts

---

## Empty State Tests

### No Competitor Data

**Scenario:** System has no competitor data yet

**Expected Results:**
- [ ] Message: "No competitor data available"
- [ ] Explanation of what data is needed
- [ ] Charts show empty state gracefully

### No Pipeline Items for Filter

**Setup:**
- Filter combination matches no pipeline items

**Expected Results:**
- [ ] All columns show "No items"
- [ ] Clear message about filters
- [ ] Option to clear filters

### Insufficient Trend Data

**Setup:**
- Not enough historical data for selected range

**Expected Results:**
- [ ] Message: "Not enough data for selected time range"
- [ ] Suggests shorter time range
- [ ] Shows available data if any

---

## Component Tests

### MetricCard

- [ ] Icon, label, and value display
- [ ] Large numbers format with commas
- [ ] Compare values show when comparison active

### MarketShareChart

- [ ] Renders pie/donut with colored segments
- [ ] Legend matches chart colors exactly
- [ ] Percentages total 100% (approximately)
- [ ] Handles many small segments gracefully

### PipelineCard

- [ ] Product name as title
- [ ] Manufacturer shown
- [ ] Days in stage indicator
- [ ] Confidence percentage with colored dot
- [ ] Predicted approval date if available

### TrendChart

- [ ] X-axis shows months
- [ ] Y-axis shows counts
- [ ] Bars/lines for approvals and submissions
- [ ] Legend distinguishes the two
- [ ] Tooltips on hover

---

## Edge Cases

- [ ] Very long competitor names truncate
- [ ] Pipeline with 50+ items scrolls properly
- [ ] Charts handle zero values
- [ ] Comparison handles missing data gracefully
- [ ] Export handles large datasets

---

## Sample Test Data

```typescript
const mockMetrics = {
  totalCompetitors: 47,
  competitorsTracked: 6,
  recentSubmissions: 23,
  recentApprovals: 18,
  avgApprovalTime: 14.2
}

const mockMarketShare = [
  { name: 'Cardiovascular', percentage: 25 },
  { name: 'CNS', percentage: 18 },
  { name: 'Antidiabetic', percentage: 15 }
]

const mockPipelineItems = [
  {
    id: 'pipe-1',
    productName: 'Apo-Sacubitril',
    manufacturer: 'Apotex Inc.',
    stage: 'submitted',
    daysInStage: 14,
    confidence: 85
  }
]

const mockEmptyPipeline = []
```
