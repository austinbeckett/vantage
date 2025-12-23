# Milestone 5: Competitive Intelligence

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

Implement Competitive Intelligence — the visual analytics hub that surfaces competitive landscape insights, market timing opportunities, and strategic trends.

## Overview

Competitive Intelligence provides multiple views for analyzing the regulatory landscape:

1. **Dashboard** — Overview with key metrics, recent activity, market share charts
2. **Pipeline Tracker** — Kanban-style board showing products by regulatory stage
3. **Competitor Deep Dive** — Detailed company profiles with portfolio analysis
4. **Trend Analysis** — Time-based charts showing approval and submission trends

**Key Functionality:**
- View competitive metrics at a glance
- Track competitor submissions, approvals, and discontinuations
- Visualize market share by therapeutic area or manufacturer
- Monitor pipeline progression with predicted approval timelines
- Analyze trends over configurable time ranges
- Compare competitors side-by-side
- Save custom views and export reports

## Recommended Approach: Test-Driven Development

See `product-plan/sections/competitive-intelligence/tests.md` for detailed test-writing instructions.

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy from `product-plan/sections/competitive-intelligence/components/`:

**Dashboard Components:**
- `CompetitiveIntelligence.tsx` — Main CI dashboard
- `MetricCard.tsx` — Metric display card
- `ActivityFeed.tsx` — Recent competitor activity feed
- `MarketShareChart.tsx` — Pie/donut chart for market share
- `CompetitorList.tsx` — List of tracked competitors

**Pipeline Tracker:**
- `PipelineTracker.tsx` — Kanban board with stage columns

**Competitor Deep Dive:**
- `CompetitorDeepDive.tsx` — Detailed competitor profile

**Trend Analysis:**
- `TrendAnalysis.tsx` — Time-based trend charts

### Data Layer

```typescript
interface CompetitiveIntelligenceProps {
  dashboardMetrics: DashboardMetrics
  activityFeed: ActivityEvent[]
  marketShareByTherapeuticArea: MarketShareItem[]
  marketShareByManufacturer: MarketShareItem[]
  competitors: Competitor[]
  pipelineItems: PipelineItem[]
  stageMetrics: StageMetric[]
  trendData: TrendData
  savedViews: SavedView[]
  onSelectCompetitor?: (competitorId: string) => void
  onSelectPipelineItem?: (itemId: string) => void
  onTimeRangeChange?: (range: string) => void
  onSaveView?: (name: string, filters: SavedViewFilters) => void
  onExportPdf?: () => void
  onExportExcel?: () => void
}
```

You'll need to:
- Aggregate data by manufacturer, therapeutic area, time periods
- Calculate market share percentages
- Track pipeline stage durations and predict approval timelines
- Implement time-series queries for trend analysis
- Support saved view persistence

### Callbacks

| Callback | Description |
|----------|-------------|
| `onSelectCompetitor` | Navigate to competitor deep dive |
| `onSelectPipelineItem` | View pipeline item details |
| `onTimeRangeChange` | Update time range for charts |
| `onTherapeuticAreaChange` | Filter by therapeutic area |
| `onSaveView` | Save current filters as named view |
| `onLoadView` | Load a saved view |
| `onExportPdf` | Generate PDF report |
| `onExportExcel` | Export data to Excel |

### Empty States

- **No competitor data:** "No competitor activity to display. Data will appear as products are tracked."
- **No pipeline items:** "No products in the pipeline matching current filters."
- **No trend data:** "Insufficient data for trend analysis. More history needed."

## Files to Reference

- `product-plan/sections/competitive-intelligence/README.md`
- `product-plan/sections/competitive-intelligence/tests.md`
- `product-plan/sections/competitive-intelligence/components/`
- `product-plan/sections/competitive-intelligence/types.ts`
- `product-plan/sections/competitive-intelligence/sample-data.json`
- `product-plan/sections/competitive-intelligence/screenshot.png`

## Expected User Flows

### Flow 1: View CI Dashboard

1. User navigates to Competitive Intelligence
2. User sees metrics cards, activity feed, market share charts
3. User can quickly scan recent competitor activity
4. **Outcome:** User has competitive landscape overview

### Flow 2: Explore Pipeline

1. User clicks Pipeline Tracker nav/tab
2. User sees kanban board with stage columns
3. User filters by therapeutic area or manufacturer
4. User views predicted approval dates
5. **Outcome:** User understands pipeline progression

### Flow 3: Deep Dive on Competitor

1. User clicks on a competitor name
2. Competitor detail page loads with full profile
3. User sees portfolio breakdown, activity timeline
4. User compares against another competitor
5. **Outcome:** User has detailed competitive intelligence

### Flow 4: Analyze Trends

1. User navigates to Trend Analysis
2. User selects time range (1yr, 3yr, etc.)
3. Charts show approval/submission trends over time
4. User filters by therapeutic area
5. **Outcome:** User identifies market patterns

### Flow 5: Save and Export

1. User configures filters for a useful view
2. User clicks "Save View" and names it
3. View appears in saved views for quick access
4. User exports data as PDF or Excel
5. **Outcome:** User can revisit analysis and share reports

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] CI dashboard displays metrics and charts
- [ ] Market share pie charts render correctly
- [ ] Activity feed shows recent events
- [ ] Pipeline tracker kanban works with filtering
- [ ] Competitor deep dive shows detailed profiles
- [ ] Trend analysis charts display time-series data
- [ ] Time range selectors work
- [ ] Save view works
- [ ] Export to PDF/Excel works
- [ ] Empty states display properly
- [ ] Responsive on mobile
