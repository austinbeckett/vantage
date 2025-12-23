# Vantage — Product Overview

## Summary

Vantage is the Command Center for Canadian Generic Pharma—a unified market intelligence dashboard that consolidates Health Canada's disparate databases into a single, actionable view. By transforming fragmented regulatory data into strategic competitive advantage, Vantage ensures pharmaceutical executives are the first to know when a competitor moves or a molecule clears a regulatory hurdle.

**Key Value Propositions:**
- **Unified Intelligence** — Seamlessly aggregates data from all three Health Canada sources (DPD, NOC, GSUR) into one interface
- **Targeted Surveillance** — Build custom watchlists for specific molecules or therapeutic classes
- **Proactive Readiness** — Automated Pulse system sends instant email notifications for status changes, new submissions, or final approvals
- **Competitive Clarity** — Clear visualization of the generic entrant landscape for precise launch timing and resource allocation

## Planned Sections

1. **Dashboard** — Command center overview providing a real-time activity feed of regulatory changes across all monitored criteria, notification inbox showing triggered watchlists and what changed, and key metrics at a glance.

2. **Search & Discovery** — Executive dashboard for exploring the unified dataset, filtering by molecule, therapeutic class, manufacturer, and approval status.

3. **Watchlists** — Custom surveillance system where users create targeted watchlists for specific molecules, competitors, or therapeutic areas.

4. **Competitive Intelligence** — Visual analytics and reporting that surfaces competitive landscape insights, market timing opportunities, and strategic trends. Includes Pipeline Tracker, Competitor Deep Dive, and Trend Analysis views.

5. **Settings** — User preferences, notification settings for Pulse alerts, and account management. Includes profile management, email notification frequency controls, and application preferences like theme and timezone.

6. **Help** — Documentation and support resources for users navigating the Vantage platform.

## Data Model

**Core Entities:**
- Drug Product — A specific drug with a unique DIN from Health Canada
- Active Ingredient — The API that provides therapeutic effect
- Manufacturer — Pharmaceutical company with drug approvals
- Route of Administration — Method of drug delivery (oral, IV, etc.)
- Dosage Form — Physical formulation (tablet, injection, etc.)
- ATC Classification — Therapeutic/pharmacological categorization
- Product Status — Regulatory approval state
- Watchlist — User-created surveillance collection
- Watchlist Item — Specific criteria within a watchlist
- Alert — Notification when watched criteria change

**Key Relationships:**
- Drug Product belongs to Active Ingredient, Manufacturer, Route, Dosage Form, ATC Classification
- Watchlist has many Watchlist Items
- Watchlist Item matches Drug Products based on criteria
- Alert belongs to Watchlist Item and references Drug Product

## Design System

**Colors:**
- Primary: `amber` — Used for buttons, links, key accents
- Secondary: `emerald` — Used for success states, positive indicators
- Neutral: `stone` — Used for backgrounds, text, borders

**Typography:**
- Heading: Inter
- Body: Inter
- Mono: JetBrains Mono

**Design Style:**
- Glassmorphism aesthetic with backdrop blur effects
- Warm amber/stone palette for premium executive feel
- Light/dark mode support
- Lucide React icons throughout

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **Dashboard** — Real-time activity feed and metrics overview
3. **Search & Discovery** — Drug product exploration with interactive filtering
4. **Watchlists** — Surveillance system for monitoring regulatory changes
5. **Competitive Intelligence** — Analytics hub with pipeline tracker and trend analysis
6. **Settings** — User preferences and notification configuration
7. **Help** — Self-service documentation and knowledge base

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
