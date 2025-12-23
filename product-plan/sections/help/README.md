# Help

## Overview

Self-service documentation hub providing a searchable knowledge base organized by common tasks. Users can quickly find answers to questions about using the Vantage platform without needing to contact support.

## User Flows

### Browse by Category
- View task-based categories (Getting Started, Managing Watchlists, etc.)
- Click a category to see related articles
- Expand/collapse articles to read content

### Search for Answers
- Search bar for keyword lookup
- Results show matching articles with highlighted terms
- Click result to jump to article

### Read Article
- View article title, content, and related articles
- Navigate with breadcrumbs

## Components Provided

- `Help.tsx` — Main help page with categories and search

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSearch` | Called when user searches for articles |
| `onSelectCategory` | Called when user clicks a category |
| `onSelectArticle` | Called when user clicks an article |

## Visual Reference

See screenshots for the target UI designs:
- `help.png` — Main help page with categories
- `help-article.png` — Article view (if available)

## Data Used

**From types.ts:**
- `HelpCategory` — Category with articles
- `HelpArticle` — Individual help article
