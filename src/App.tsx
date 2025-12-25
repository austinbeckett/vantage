import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import AppShell from './components/AppShell'
import {
  Dashboard,
  Search,
  Watchlists,
  WatchlistDetail,
  CompetitiveIntelligence,
  Pipeline,
  CompetitorDetail,
  Trends,
  Settings,
  Help,
  Login,
  Signup,
} from './pages'
import { nocCacheManager } from './lib/api/noc'

// -----------------------------------------------------------------------------
// Background Cache Warming
// -----------------------------------------------------------------------------
// Start warming the NOC cache immediately on app load.
// This runs in the background and doesn't block rendering.
// The NOC database requires fetching ~355,000 records (~57MB) which takes
// several seconds. By starting early, the cache is often ready by the time
// the user navigates to watchlist features.

// Small delay to prioritize initial render, then start warming
setTimeout(() => {
  nocCacheManager.startBackgroundLoad()
}, 1000)

// Configure React Query with optimal caching for Health Canada API
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes (won't refetch during this time)
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 1 hour
      gcTime: 60 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (data doesn't change that frequently)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect automatically
      refetchOnReconnect: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth routes (outside shell) */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Main app routes (publicly accessible) */}
              <Route
                path="/*"
                element={
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/watchlists" element={<Watchlists />} />
                      <Route path="/watchlists/:id" element={<WatchlistDetail />} />
                      <Route path="/competitive-intelligence" element={<CompetitiveIntelligence />} />
                      <Route path="/competitive-intelligence/pipeline" element={<Pipeline />} />
                      <Route path="/competitive-intelligence/competitor/:id" element={<CompetitorDetail />} />
                      <Route path="/competitive-intelligence/trends" element={<Trends />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                    </Routes>
                  </AppShell>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
