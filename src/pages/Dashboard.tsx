import { useNavigate } from 'react-router-dom'
import { DashboardLive } from '../components/dashboard'
import type { GSUREntry, SUREntry } from '../types/health-canada-api'

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleNavigateToSearch = () => {
    navigate('/search')
  }

  const handleViewSubmission = (entry: GSUREntry | SUREntry, _type: 'GSUR' | 'SUR') => {
    // For now, navigate to search with the medicinal ingredient as query
    // In the future, this could open a detail modal
    const ingredient = entry.medicinal_ingredients
    navigate(`/search?q=${encodeURIComponent(ingredient)}`)
  }

  return (
    <DashboardLive
      watchlistCount={0}
      productsTracked={0}
      onNavigateToSearch={handleNavigateToSearch}
      onViewSubmission={handleViewSubmission}
    />
  )
}
