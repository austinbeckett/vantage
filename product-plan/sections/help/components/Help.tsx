import { useState, useMemo } from 'react'
import {
  Search,
  Rocket,
  List,
  BarChart3,
  Database,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ArrowLeft,
} from 'lucide-react'
import type { HelpProps, Category, Article } from '../types'

const iconMap = {
  rocket: Rocket,
  list: List,
  chart: BarChart3,
  database: Database,
  help: HelpCircle,
}

interface CategoryCardProps {
  category: Category
  isExpanded: boolean
  onToggle: () => void
  onSelectArticle: (articleId: string) => void
}

function CategoryCard({
  category,
  isExpanded,
  onToggle,
  onSelectArticle,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon]

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {category.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {category.description}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {category.articleCount} articles
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          {category.articles.map((article, index) => (
            <button
              key={article.id}
              onClick={() => onSelectArticle(article.id)}
              className={`w-full p-4 pl-20 flex items-center gap-3 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors text-left ${
                index < category.articles.length - 1
                  ? 'border-b border-neutral-100 dark:border-neutral-800'
                  : ''
              }`}
            >
              <BookOpen className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                  {article.title}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  {article.summary}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ArticleViewProps {
  article: Article
  category: Category
  allCategories: Category[]
  onBack: () => void
  onSelectArticle: (articleId: string) => void
}

function ArticleView({
  article,
  category,
  allCategories,
  onBack,
  onSelectArticle,
}: ArticleViewProps) {
  // Find related articles
  const relatedArticles = useMemo(() => {
    const related: { article: Article; category: Category }[] = []
    for (const cat of allCategories) {
      for (const art of cat.articles) {
        if (article.relatedArticles.includes(art.id)) {
          related.push({ article: art, category: cat })
        }
      }
    }
    return related
  }, [article.relatedArticles, allCategories])

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inList = false
    let listItems: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 mb-4"
          >
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
        listItems = []
      }
      inList = false
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2
            key={index}
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3"
          >
            {trimmed.replace('## ', '')}
          </h2>
        )
      } else if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(
          <h3
            key={index}
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-4 mb-2"
          >
            {trimmed.replace('### ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('- ')) {
        inList = true
        // Handle bold text in list items
        const text = trimmed.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')
        listItems.push(text)
      } else if (trimmed === '') {
        flushList()
      } else if (trimmed.match(/^\d+\./)) {
        flushList()
        // Numbered list item
        elements.push(
          <p
            key={index}
            className="text-neutral-600 dark:text-neutral-400 mb-1 pl-4"
          >
            {trimmed}
          </p>
        )
      } else {
        flushList()
        // Regular paragraph - handle bold text
        const text = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        elements.push(
          <p
            key={index}
            className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )
      }
    })

    flushList()
    return elements
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-neutral-300 dark:text-neutral-600">/</span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {category.name}
        </span>
      </div>

      {/* Article Content */}
      <article className="p-8 rounded-2xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700">
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {article.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          {article.summary}
        </p>

        <div className="prose prose-stone dark:prose-invert max-w-none">
          {renderContent(article.content)}
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Related Articles
          </h2>
          <div className="grid gap-3">
            {relatedArticles.map(({ article: relatedArt, category: relatedCat }) => (
              <button
                key={relatedArt.id}
                onClick={() => onSelectArticle(relatedArt.id)}
                className="p-4 rounded-xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 hover:border-primary-300/50 dark:hover:border-primary-600/30 transition-colors text-left flex items-center gap-3"
              >
                <BookOpen className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {relatedArt.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {relatedCat.name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Help({
  categories,
  onSearch,
  onSelectCategory,
  onSelectArticle,
}: HelpProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  // Find selected article and its category
  const selectedArticleData = useMemo(() => {
    if (!selectedArticleId) return null
    for (const category of categories) {
      const article = category.articles.find((a) => a.id === selectedArticleId)
      if (article) {
        return { article, category }
      }
    }
    return null
  }, [selectedArticleId, categories])

  // Filter articles based on search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase()
    const results: { article: Article; category: Category }[] = []

    for (const category of categories) {
      for (const article of category.articles) {
        if (
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
        ) {
          results.push({ article, category })
        }
      }
    }

    return results
  }, [searchQuery, categories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
    onSelectCategory?.(categoryId)
  }

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId)
    onSelectArticle?.(articleId)
  }

  // If viewing an article, show article view
  if (selectedArticleData) {
    return (
      <div className="max-w-7xl mx-auto">
        <ArticleView
          article={selectedArticleData.article}
          category={selectedArticleData.category}
          allCategories={categories}
          onBack={() => setSelectedArticleId(null)}
          onSelectArticle={handleSelectArticle}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          How can we help?
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Search our knowledge base or browse by topic
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 dark:focus:border-primary-600 transition-all text-lg"
          />
        </div>
      </form>

      {/* Search Results */}
      {searchResults !== null ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Clear search
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map(({ article, category }) => (
                <button
                  key={article.id}
                  onClick={() => handleSelectArticle(article.id)}
                  className="w-full p-5 rounded-xl bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 hover:border-primary-300/50 dark:hover:border-primary-600/30 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {article.title}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {article.summary}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                        {category.name}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400">
                No articles found matching your search.
              </p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                Try different keywords or browse categories below.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Categories */
        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isExpanded={expandedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
              onSelectArticle={handleSelectArticle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
