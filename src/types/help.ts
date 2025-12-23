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

export interface HelpProps {
  categories: Category[]
  onSearch?: (query: string) => void
  onSelectCategory?: (categoryId: string) => void
  onSelectArticle?: (articleId: string) => void
}
