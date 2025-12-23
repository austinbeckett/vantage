# Watchlists

## Overview

A surveillance dashboard where users manage saved search criteria that monitor the Health Canada databases for changes. Users can create, edit, pause, and delete watchlists, and click into any watchlist to see all matching drug products.

## User Flows

- View all watchlists with their criteria and recent activity
- Create a new watchlist by defining search terms and filter criteria
- Click a watchlist to view all matching drug products
- Edit an existing watchlist to modify criteria
- Pause/resume notifications for a watchlist
- Delete a watchlist

## Components Provided

- `Watchlists.tsx` — Main watchlist management view
- `WatchlistCard.tsx` — Individual watchlist card display
- `SearchableSelect.tsx` — Searchable dropdown for criteria selection

## Callback Props

| Callback | Description |
|----------|-------------|
| `onCreateWatchlist` | Called to open create watchlist form |
| `onEditWatchlist` | Called to edit existing watchlist |
| `onDeleteWatchlist` | Called to delete a watchlist |
| `onTogglePause` | Called to pause/resume notifications |
| `onViewWatchlist` | Called to view watchlist detail/matches |

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Data Used

**From types.ts:**
- `Watchlist` — Watchlist with items and counts
- `WatchlistItem` — Individual criteria within watchlist

**From global model:**
- Watchlist, WatchlistItem, DrugProduct entities
