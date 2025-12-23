# Test Instructions: Help

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Help is a self-service documentation hub providing a searchable knowledge base organized by common tasks. Users can quickly find answers to questions about using the Vantage platform.

---

## User Flow Tests

### Flow 1: View Help Page

**Scenario:** User lands on help page

**Steps:**
1. User navigates to `/help`
2. Help page loads

**Expected Results:**
- [ ] Page title "Help" or "Help Center" displayed
- [ ] Search bar prominently visible at top
- [ ] Category cards/sections displayed
- [ ] Categories are task-based (Getting Started, Managing Watchlists, etc.)

---

### Flow 2: Browse by Category

**Scenario:** User explores a help category

**Steps:**
1. User clicks "Getting Started" category
2. Articles within category are displayed

**Expected Results:**
- [ ] Category expands or navigates to show articles
- [ ] Articles listed with titles
- [ ] Brief description or preview visible
- [ ] Can click article to read full content

---

### Flow 3: Read an Article

**Scenario:** User reads a help article

**Steps:**
1. User clicks on "How to Create a Watchlist" article
2. Full article content displays

**Expected Results:**
- [ ] Article title prominently displayed
- [ ] Article content renders with formatting
- [ ] Breadcrumb shows: Help > Category > Article
- [ ] Related articles suggestions shown
- [ ] Back navigation available

---

### Flow 4: Search for Answers

**Scenario:** User searches for help

**Steps:**
1. User types "notification" in search bar
2. User presses Enter or results appear as they type
3. User sees matching articles

**Expected Results:**
- [ ] Search bar accepts text input
- [ ] Results show as user types (instant search) or after Enter
- [ ] Results show article titles and snippets
- [ ] Search terms highlighted in results
- [ ] Clicking result navigates to article

#### Failure Path: No Results

**Setup:**
- Search term matches no articles

**Expected Results:**
- [ ] Message: "No results found for '[search term]'"
- [ ] Suggestions: "Try different keywords or browse categories"
- [ ] Categories still accessible

---

### Flow 5: Expand/Collapse Article Content

**Scenario:** User reads article with expandable sections

**Steps:**
1. User views article with multiple sections
2. User clicks to expand a collapsed section

**Expected Results:**
- [ ] Long articles have collapsible sections
- [ ] Click header to expand/collapse
- [ ] Smooth animation on expand/collapse
- [ ] Expand all / Collapse all option (optional)

---

### Flow 6: Navigate via Breadcrumbs

**Scenario:** User navigates using breadcrumbs

**Steps:**
1. User is reading an article
2. User clicks category name in breadcrumb
3. User returns to category view

**Expected Results:**
- [ ] Breadcrumb shows: Help > [Category] > [Article]
- [ ] Each breadcrumb segment is clickable
- [ ] Clicking navigates to that level
- [ ] Current location is not clickable (last item)

---

### Flow 7: View Related Articles

**Scenario:** User explores related content

**Steps:**
1. User finishes reading an article
2. User sees related articles section
3. User clicks a related article

**Expected Results:**
- [ ] "Related Articles" section visible
- [ ] Shows 2-4 relevant articles
- [ ] Each shows title and brief description
- [ ] Clicking navigates to that article

---

## Empty State Tests

### No Articles in Category

**Scenario:** Category has no published articles

**Setup:**
- Category exists but has no articles

**Expected Results:**
- [ ] Message: "No articles in this category yet"
- [ ] Suggestion to check other categories
- [ ] Link back to all categories

### Search With No Results

**Setup:**
- Search term matches nothing

**Expected Results:**
- [ ] Friendly message explaining no matches
- [ ] Suggestions for refining search
- [ ] Category browsing still available

---

## Component Tests

### SearchBar

- [ ] Input field with search icon
- [ ] Placeholder text: "Search help articles..."
- [ ] Typing triggers `onSearch` callback
- [ ] Clear button appears when text entered
- [ ] Accessible with keyboard

### CategoryCard

- [ ] Shows category icon
- [ ] Shows category title
- [ ] Shows article count (e.g., "5 articles")
- [ ] Clickable to expand/navigate
- [ ] Hover state visible

### ArticleCard

- [ ] Shows article title
- [ ] Shows excerpt/description
- [ ] Clickable to view full article
- [ ] May show reading time (optional)

### ArticleView

- [ ] Renders article title
- [ ] Renders formatted content (headings, lists, code blocks)
- [ ] Shows breadcrumb navigation
- [ ] Shows related articles
- [ ] Back button to return to previous view

### Breadcrumb

- [ ] Shows navigation path
- [ ] Each segment clickable except current
- [ ] Separator between segments
- [ ] Truncates gracefully on mobile

---

## Edge Cases

- [ ] Very long article titles truncate in lists
- [ ] Articles with code snippets render properly
- [ ] Images in articles load with alt text
- [ ] Deep category nesting handled (if applicable)
- [ ] Search handles special characters
- [ ] Keyboard navigation works throughout

---

## Sample Test Data

```typescript
const mockCategories = [
  {
    id: 'cat-1',
    title: 'Getting Started',
    icon: 'rocket',
    articleCount: 5,
    articles: [
      {
        id: 'art-1',
        title: 'Welcome to Vantage',
        excerpt: 'An introduction to the Vantage platform...',
        content: '# Welcome to Vantage\n\nVantage is your...',
        relatedArticles: ['art-2', 'art-3']
      },
      {
        id: 'art-2',
        title: 'Creating Your First Watchlist',
        excerpt: 'Learn how to create and configure watchlists...',
        content: '# Creating Your First Watchlist\n\n...'
      }
    ]
  },
  {
    id: 'cat-2',
    title: 'Managing Watchlists',
    icon: 'eye',
    articleCount: 8
  },
  {
    id: 'cat-3',
    title: 'Understanding Alerts',
    icon: 'bell',
    articleCount: 4
  },
  {
    id: 'cat-4',
    title: 'Competitive Intelligence',
    icon: 'chart',
    articleCount: 6
  }
]

const mockSearchResults = [
  {
    id: 'art-5',
    title: 'Notification Settings',
    excerpt: 'Configure your notification preferences...',
    categoryId: 'cat-3',
    matchedTerms: ['notification']
  }
]

const mockEmptySearch = []
```
