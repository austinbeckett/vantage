import { Help as HelpComponent } from '../components/help'
import { sampleCategories } from '../data/help-sample'

export default function Help() {
  const handleSearch = (query: string) => {
    console.log('Search:', query)
  }

  const handleSelectCategory = (categoryId: string) => {
    console.log('Select category:', categoryId)
  }

  const handleSelectArticle = (articleId: string) => {
    console.log('Select article:', articleId)
  }

  return (
    <HelpComponent
      categories={sampleCategories}
      onSearch={handleSearch}
      onSelectCategory={handleSelectCategory}
      onSelectArticle={handleSelectArticle}
    />
  )
}
