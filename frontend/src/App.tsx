import { useEffect, useRef, useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SeeReviews from './pages/SeeReviews'
import SubmitReview from './pages/SubmitReview'
import ApiDocs from './pages/ApiDocs'
import NotFound from './pages/NotFound'

function Home() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const token = searchParams.get('token')
    if (!token) {
      setError(true)
      return
    }

    login(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError(true))
  }, [searchParams, login, navigate])

  if (error) {
    return <Navigate to="/login?error=oauth" replace />
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Signing you in...
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <PageTransition>
                <AuthCallback />
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/reviews"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <SeeReviews />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/submit"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <SubmitReview />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/api-docs"
            element={
              <PageTransition>
                <ApiDocs />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
