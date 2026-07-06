import { useSearchParams } from 'react-router-dom'

const API_URL = window.__CONFIG__?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const [searchParams] = useSearchParams()
  const hasError = searchParams.get('error') !== null

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white px-4 sm:-mx-6">
      <div className="w-full max-w-sm rounded-2xl border border-indigo-100 bg-white/80 p-10 text-center shadow-xl shadow-indigo-100/50 backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-600">
          ReviewSense
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          AI-powered sentiment analysis for product reviews
        </p>

        {hasError && (
          <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            Sign in failed. Please try again.
          </p>
        )}

        <a
          href={`${API_URL}/auth/google`}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A10.99 10.99 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  )
}
