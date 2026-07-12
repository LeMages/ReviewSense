import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const API_URL = window.__CONFIG__?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const [searchParams] = useSearchParams()
  const hasError = searchParams.get('error') !== null

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-57px)] items-center justify-center sm:-mx-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card/80 p-10 text-center backdrop-blur-xl"
      >
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <svg
            className="relative h-8 w-8 text-primary"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          ReviewSense
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          AI-powered sentiment analysis for product reviews
        </p>

        {hasError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 rounded-md bg-negative/10 px-3 py-2 text-sm text-negative"
          >
            Sign in failed. Please try again.
          </motion.p>
        )}

        <motion.a
          href={`${API_URL}/auth/google`}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary/80 active:scale-[0.98]"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
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
        </motion.a>
      </motion.div>
    </div>
  )
}
