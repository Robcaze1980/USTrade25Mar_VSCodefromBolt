import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Login from '@/pages/auth/Login'
import SignUp from '@/pages/auth/SignUp'
import Dashboard from '@/pages/Dashboard'
import LandingPage from '@/pages/LandingPage'
import DashboardLayout from '@/components/DashboardLayout'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import TradeAnalysis from '@/pages/TradeAnalysis'
import MarketInsights from '@/pages/MarketInsights'
import GlobalTrends from '@/pages/GlobalTrends'
import Subscription from '@/pages/Subscription'
import Reports from '@/pages/Reports'
import History from '@/pages/History'
import HSCodes from '@/pages/HSCodes'
import Team from '@/pages/Team'
import Notifications from '@/pages/Notifications'
import Settings from '@/pages/Settings'
import Support from '@/pages/Support'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return session ? children : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return !session ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trade-analysis" element={<TradeAnalysis />} />
            <Route path="/market-insights" element={<MarketInsights />} />
            <Route path="/global-trends" element={<GlobalTrends />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/history" element={<History />} />
            <Route path="/hs-codes" element={<HSCodes />} />
            <Route path="/team" element={<Team />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App