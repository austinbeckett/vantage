import { useNavigate } from 'react-router-dom'
import { SearchAndDiscoveryLive } from '../components/search/SearchAndDiscoveryLive'
import type { UnifiedDrugProduct } from '../lib/api/dpd/transformers'

export default function Search() {
  const navigate = useNavigate()

  const handleAddToWatchlist = (product: UnifiedDrugProduct) => {
    // Navigate to watchlists page with product info
    console.log('Add to watchlist:', product.brandName, product.din)
    navigate('/watchlists')
  }

  const handleViewHistory = (product: UnifiedDrugProduct) => {
    // TODO: Navigate to full regulatory history view when implemented
    console.log('View history:', product.brandName, product.drugCode)
  }

  return (
    <SearchAndDiscoveryLive
      onAddToWatchlist={handleAddToWatchlist}
      onViewHistory={handleViewHistory}
    />
  )
}
