# Dashboard

## Overview

Command center providing real-time visibility into regulatory changes across all Health Canada databases (DPD, NOC, GSUR). Serves as the primary landing page with a unified activity feed, notification history, and key metrics at a glance.

## User Flows

- View key metrics and stats overview (watchlist counts, database activity, trends)
- Browse real-time activity feed showing regulatory changes as they happen
- Filter activity by database source, watchlist, event type, manufacturer, date range
- Toggle time range (24 hours, 7 days, 30 days)
- Click activity item to view full drug product details
- Mark activity items as read or dismiss from feed
- Quick-add a drug product to a watchlist directly from activity feed

## Components Provided

- `Dashboard.tsx` — Main dashboard component with metrics and activity feed

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewProduct` | Called when user clicks to view drug product details |
| `onDismissActivity` | Called when user dismisses an activity item |
| `onAddToWatchlist` | Called when user adds a product to a watchlist |
| `onFilterChange` | Called when user changes activity filters |
| `onTimeRangeChange` | Called when user changes time range (24h/7d/30d) |

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Data Used

**From types.ts:**
- `DashboardMetrics` — Key metrics displayed in cards
- `ActivityItem` — Items in the activity feed
- `ActivityFilters` — Filter state

**From global model:**
- DrugProduct, Watchlist, Alert entities
