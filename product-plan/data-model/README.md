# Vantage Data Model

## Overview

Vantage consolidates data from three Health Canada databases (DPD, NOC, GSUR) into a unified data model. This document describes the core entities and their relationships.

## Core Entities

### Drug Product
A specific drug with a unique Drug Identification Number (DIN) from Health Canada's databases. Represents a particular combination of active ingredient, manufacturer, dosage form, route of administration, and regulatory status.

**Key Fields:**
- `id` — Unique identifier
- `din` — Drug Identification Number
- `brandName` — Product brand name
- `activeIngredientId` — Reference to Active Ingredient
- `manufacturerId` — Reference to Manufacturer
- `routeId` — Reference to Route of Administration
- `dosageFormId` — Reference to Dosage Form
- `atcClassificationId` — Reference to ATC Classification
- `status` — Current regulatory status
- `statusDate` — Date of last status change

### Active Ingredient
The drug substance or active pharmaceutical ingredient (API) that provides the therapeutic effect.

**Key Fields:**
- `id` — Unique identifier
- `name` — Ingredient name
- `strength` — Strength/concentration

### Manufacturer
A pharmaceutical company that holds drug approvals or has submitted applications.

**Key Fields:**
- `id` — Unique identifier
- `name` — Company name
- `headquarters` — Location

### Route of Administration
The method by which a drug is delivered (oral, intravenous, etc.).

**Key Fields:**
- `id` — Unique identifier
- `name` — Route name (e.g., "Oral", "Intravenous")
- `code` — Standard code

### Dosage Form
The physical formulation (tablet, capsule, injection, etc.).

**Key Fields:**
- `id` — Unique identifier
- `name` — Form name
- `code` — Standard code

### ATC Classification
Anatomical Therapeutic Chemical classification for categorizing drugs.

**Key Fields:**
- `id` — Unique identifier
- `code` — ATC code
- `name` — Classification name
- `level` — Classification level (1-5)

### Product Status
Regulatory approval states.

**Possible Values:**
- `approved` — Approved but not yet marketed
- `marketed` — Actively marketed
- `expired` — Approval expired
- `revoked` — Approval revoked
- `cancelled` — Cancelled by manufacturer
- `dormant` — Inactive

### Watchlist
A user-created surveillance collection.

**Key Fields:**
- `id` — Unique identifier
- `userId` — Owner user
- `name` — Watchlist name
- `description` — Optional description
- `isPaused` — Notification pause status
- `createdAt` — Creation timestamp
- `updatedAt` — Last update timestamp

### Watchlist Item
Specific criteria within a watchlist.

**Key Fields:**
- `id` — Unique identifier
- `watchlistId` — Parent watchlist
- `activeIngredientId` — Optional ingredient filter
- `manufacturerId` — Optional manufacturer filter
- `routeId` — Optional route filter
- `dosageFormId` — Optional form filter
- `atcClassificationId` — Optional ATC filter

### Alert
A notification when watched criteria match a change.

**Key Fields:**
- `id` — Unique identifier
- `watchlistItemId` — Triggering watchlist item
- `drugProductId` — Related drug product
- `eventType` — Type of change (submission, approval, etc.)
- `isRead` — Read status
- `createdAt` — Alert timestamp

## Entity Relationships

```
Drug Product
├── belongs to Active Ingredient
├── belongs to Manufacturer
├── belongs to Route of Administration
├── belongs to Dosage Form
├── belongs to ATC Classification
└── has one Product Status

Watchlist
├── belongs to User
└── has many Watchlist Items

Watchlist Item
├── belongs to Watchlist
├── can reference Active Ingredient (optional)
├── can reference Manufacturer (optional)
├── can reference Route (optional)
├── can reference Dosage Form (optional)
├── can reference ATC Classification (optional)
└── matches many Drug Products (computed)

Alert
├── belongs to Watchlist Item
└── references Drug Product
```

## See Also

- `types.ts` — TypeScript interface definitions
- `sample-data.json` — Example data for testing
