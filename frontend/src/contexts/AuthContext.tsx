import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import api from '../services/api'
import { setToken as setSharedToken } from '../services/tokenStore'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Keep the axios/Apollo request interceptors in sync with the token held
  // here in React state (nothing is persisted to localStorage).
  useEffect(() => {
    setSharedToken(token)
  }, [token])

  const login = async (newToken: string) => {
    setIsLoading(true)
    try {
      const { data } = await api.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      })
      setToken(newToken)
      setUser(data)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
