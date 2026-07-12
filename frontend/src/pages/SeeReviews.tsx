import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { CalendarDays, ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react'
import api from '../services/api'
import SentimentBadge from '../components/SentimentBadge'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/ui/skeleton'
import type { Review, SentimentLabel } from '../types'

type DateMode = 'day' | 'month' | 'year' | null
type SentimentFilter = SentimentLabel | 'all'

interface ReviewListResponse {
  reviews: Review[]
  total: number
}

const PAGE_SIZE = 10

const SENTIMENT_OPTIONS: { value: SentimentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
]

const SENTIMENT_ACTIVE_STYLES: Record<SentimentFilter, string> = {
  all: 'bg-secondary text-foreground border-border',
  positive: 'bg-positive/15 text-positive border-positive/30',
  negative: 'bg-negative/15 text-negative border-negative/30',
  neutral: 'bg-neutral/15 text-neutral border-neutral/30',
}

const DATE_MODE_OPTIONS: { value: DateMode; label: string }[] = [
  { value: null, label: 'All time' },
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

const dateInputStyles =
  '[color-scheme:dark] rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

export default function SeeReviews() {
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all')
  const [dateMode, setDateMode] = useState<DateMode>(null)
  const [dateValue, setDateValue] = useState('')
  const [offset, setOffset] = useState(0)

  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const params: Record<string, string | number> = { limit: PAGE_SIZE, offset }
    if (sentimentFilter !== 'all') params.sentiment = sentimentFilter
    if (dateMode && dateValue) params[dateMode] = dateValue

    setIsLoading(true)
    setError(null)

    api
      .get<ReviewListResponse>('/api/v1/reviews', { params, signal: controller.signal })
      .then(({ data }) => {
        setReviews(data.reviews)
        setTotal(data.total)
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined
        const msg = message ?? 'Failed to load reviews.'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [sentimentFilter, dateMode, dateValue, offset])

  const handleSentimentChange = (value: SentimentFilter) => {
    setSentimentFilter(value)
    setOffset(0)
  }

  const handleDateModeChange = (mode: DateMode) => {
    setDateMode(mode)
    setDateValue('')
    setOffset(0)
  }

  const handleDateValueChange = (value: string) => {
    setDateValue(value)
    setOffset(0)
  }

  const rangeLabel = useMemo(() => {
    if (total === 0) return '0 reviews'
    const from = offset + 1
    const to = Math.min(offset + PAGE_SIZE, total)
    return `${from}-${to} of ${total} reviews`
  }, [offset, total])

  const hasActiveDateFilter = dateMode !== null && dateValue !== ''

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">See Reviews</h1>
      <p className="mt-2 text-muted-foreground">
        Browse and filter every review that has been analyzed.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sentiment</span>
          <div className="flex flex-wrap gap-1.5">
            {SENTIMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSentimentChange(opt.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  sentimentFilter === opt.value
                    ? SENTIMENT_ACTIVE_STYLES[opt.value]
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</span>
          <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-1">
            {DATE_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleDateModeChange(opt.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  dateMode === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateMode === 'day' && (
            <input
              type="date"
              value={dateValue}
              onChange={(event) => handleDateValueChange(event.target.value)}
              className={dateInputStyles}
            />
          )}
          {dateMode === 'month' && (
            <input
              type="month"
              value={dateValue}
              onChange={(event) => handleDateValueChange(event.target.value)}
              className={dateInputStyles}
            />
          )}
          {dateMode === 'year' && (
            <select
              value={dateValue}
              onChange={(event) => handleDateValueChange(event.target.value)}
              className={dateInputStyles}
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}

          {hasActiveDateFilter && (
            <button
              type="button"
              onClick={() => handleDateModeChange(null)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear date filter"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {error && <p className="mt-4 text-sm text-negative">{error}</p>}

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <SentimentBadge sentiment={review.predictedSentiment} />
                        {review.confidence !== null && (
                          <span className="font-mono text-xs text-muted-foreground">
                            {(review.confidence * 100).toFixed(1)}% confidence
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(review.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-foreground/80">{review.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{rangeLabel}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={offset === 0}
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No reviews found"
            description="Try adjusting your filters, or submit a new review to see it here."
          />
        )}
      </div>
    </div>
  )
}
