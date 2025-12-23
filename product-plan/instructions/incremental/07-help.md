# Milestone 7: Help

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

Implement Help — the self-service documentation hub with searchable knowledge base articles.

## Overview

Help provides users with documentation and answers organized by common tasks. Users can browse categories, search for specific topics, and read articles with related suggestions.

**Key Functionality:**
- Browse task-based categories (Getting Started, Managing Watchlists, etc.)
- Click categories to see related articles
- Expand/collapse articles to read content
- Search for answers by keyword
- View article with content and related articles
- Navigate with breadcrumbs

## Recommended Approach: Test-Driven Development

See `product-plan/sections/help/tests.md` for detailed test-writing instructions.

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy from `product-plan/sections/help/components/`:

- `Help.tsx` — Main help page with categories and search

### Data Layer

```typescript
interface HelpProps {
  categories: Category[]
  onSearch?: (query: string) => void
  onSelectCategory?: (categoryId: string) => void
  onSelectArticle?: (articleId: string) => void
}
```

You'll need to:
- Create content management for help articles
- Implement full-text search across articles
- Track related articles relationships

### Callbacks

| Callback | Description |
|----------|-------------|
| `onSearch` | Search articles by keyword |
| `onSelectCategory` | Expand/focus category |
| `onSelectArticle` | View full article |

### Empty States

- **No search results:** "No articles match your search. Try different keywords."

## Files to Reference

- `product-plan/sections/help/README.md`
- `product-plan/sections/help/tests.md`
- `product-plan/sections/help/components/`
- `product-plan/sections/help/types.ts`
- `product-plan/sections/help/sample-data.json`
- `product-plan/sections/help/screenshot.png`

## Expected User Flows

### Flow 1: Browse Categories

1. User navigates to Help
2. User sees task-based categories (Getting Started, Watchlists, etc.)
3. User clicks a category to expand it
4. User sees list of articles in that category
5. **Outcome:** User finds relevant topic area

### Flow 2: Search for Answer

1. User types question in search bar
2. Results show matching articles
3. User clicks an article
4. **Outcome:** User finds answer to question

### Flow 3: Read Article

1. User clicks on an article
2. Full article content displays
3. User sees related articles at bottom
4. User can click related article to continue reading
5. **Outcome:** User gets comprehensive help

### Flow 4: Navigate Back

1. User is reading an article
2. User clicks breadcrumb or back button
3. User returns to category or main help view
4. **Outcome:** User can easily navigate

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Categories display with article counts
- [ ] Category expand/collapse works
- [ ] Search returns relevant articles
- [ ] Article view displays full content
- [ ] Related articles show and link correctly
- [ ] Breadcrumb navigation works
- [ ] No search results empty state works
- [ ] Responsive on mobile
