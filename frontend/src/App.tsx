import { useEffect, useRef, useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
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
    <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
      Signing you in...
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <SubmitReview />
            </ProtectedRoute>
          }
        />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
