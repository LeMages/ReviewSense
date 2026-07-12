import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { MessageSquareText, Send } from 'lucide-react'
import api from '../services/api'
import SentimentBadge from '../components/SentimentBadge'
import EmptyState from '../components/EmptyState'
import type { Review } from '../types'

const MAX_CHARS = 1000

export default function SubmitReview() {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Review[]>([])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters long.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const { data } = await api.post<{ review: Review }>('/api/v1/reviews', { text })
      setHistory((prev) => [data.review, ...prev])
      setText('')
      toast.success('Sentiment analysis complete!')
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      const msg = message ?? 'Failed to analyze sentiment. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const latest = history[0]
  const charCount = text.length
  const isNearLimit = charCount > MAX_CHARS * 0.85

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Submit a Review</h1>
      <p className="mt-2 text-muted-foreground">
        Paste a review below to analyze its sentiment.
      </p>

      <motion.form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            maxLength={MAX_CHARS}
            placeholder="Paste a product review..."
            className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <span
            className={`absolute bottom-3 right-3 font-mono text-xs ${
              isNearLimit ? 'text-negative' : 'text-muted-foreground'
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-sm text-negative"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Analyze Sentiment
            </>
          )}
        </motion.button>
      </motion.form>

      <AnimatePresence>
        {latest && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Result</h2>
              {latest.confidence !== null && (
                <span className="font-mono text-sm text-muted-foreground">
                  {(latest.confidence * 100).toFixed(1)}% confidence
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <SentimentBadge sentiment={latest.predictedSentiment} />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 whitespace-pre-wrap text-sm text-foreground/80"
            >
              {latest.text}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 1 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-medium text-foreground">Session History</h2>
          <div className="mt-4 space-y-3">
            <AnimatePresence>
              {history.slice(1).map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <SentimentBadge sentiment={review.predictedSentiment} />
                    {review.confidence !== null && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {(review.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{review.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {history.length === 0 && !isSubmitting && (
        <EmptyState
          icon={<MessageSquareText className="h-12 w-12" />}
          title="No reviews submitted yet"
          description="Write or paste a product review above and click 'Analyze Sentiment' to get started."
        />
      )}
    </div>
  )
}
