import { useNavigate } from 'react-router-dom'
import { WatchlistsLive } from '../components/watchlists'

export default function Watchlists() {
  const navigate = useNavigate()

  const handleViewWatchlist = (id: string) => {
    navigate(`/watchlists/${id}`)
  }

  return <WatchlistsLive onView={handleViewWatchlist} />
}
