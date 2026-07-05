import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/submit', label: 'Submit Review' },
  { to: '/api-docs', label: 'API Docs' },
]

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold text-indigo-600">
          ReviewSense
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-md p-2 text-slate-600 sm:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-md bg-indigo-600 px-3 py-2 text-left text-sm font-medium text-white hover:bg-indigo-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="mt-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
