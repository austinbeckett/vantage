// =============================================================================
// Data Types
// =============================================================================

export interface Article {
  id: string
  title: string
  summary: string
  content: string
  relatedArticles: string[]
}

export interface Category {
  id: string
  name: string
  description: string
  icon: 'rocket' | 'list' | 'chart' | 'database' | 'help'
  articleCount: number
  articles: Article[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface HelpProps {
  /** Task-based categories containing help articles */
  categories: Category[]
  /** Called when user searches for help content */
  onSearch?: (query: string) => void
  /** Called when user selects a category to browse */
  onSelectCategory?: (categoryId: string) => void
  /** Called when user selects an article to read */
  onSelectArticle?: (articleId: string) => void
}
