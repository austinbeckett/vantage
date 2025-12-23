# Competitive Intelligence

## Overview

Visual analytics hub that surfaces competitive landscape insights, market timing opportunities, and strategic trends. Users can track competitor regulatory activity, analyze market patterns, compare portfolios, and monitor pipeline progression with predicted approval timelines.

## User Flows

### Dashboard Entry
- View key competitive metrics at a glance
- See recent competitor activity (submissions, approvals, discontinuations)
- View market share breakdown by therapeutic area or manufacturer

### Competitor Deep Dive
- Select a competitor to view detailed profile
- See their regulatory timeline and portfolio breakdown
- Compare activity against other competitors

### Pipeline Tracker
- Kanban-style view of products by regulatory stage
- View stage progression metrics and average times
- See predicted approval timelines

### Trend Analysis
- Time-based charts with configurable ranges
- Approval trends by therapeutic area
- Submission volume analysis

### Save & Export
- Save custom filtered views
- Export reports as PDF or Excel

## Components Provided

- `CompetitiveIntelligence.tsx` — Main CI dashboard
- `MetricCard.tsx` — Metric display card
- `ActivityFeed.tsx` — Recent competitor activity feed
- `MarketShareChart.tsx` — Pie/donut chart for market share
- `CompetitorList.tsx` — List of tracked competitors
- `PipelineTracker.tsx` — Kanban board with stage columns
- `CompetitorDeepDive.tsx` — Detailed competitor profile
- `TrendAnalysis.tsx` — Time-based trend charts

## Callback Props

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

## Visual Reference

See screenshots for the target UI designs:
- `competitive-intelligence.png` — Main dashboard
- `pipeline-tracker.png` — Pipeline kanban view
- `competitor-deep-dive.png` — Competitor profile
- `trend-analysis.png` — Trend charts

## Data Used

**From types.ts:**
- `DashboardMetrics`, `Competitor`, `PipelineItem`
- `MarketShareItem`, `TrendData`, `SavedView`

**From global model:**
- Manufacturer, DrugProduct, ProductStatus entities
