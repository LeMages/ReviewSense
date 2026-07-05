import { useState, type FormEvent } from 'react'
import axios from 'axios'
import api from '../services/api'
import type { Review, SentimentLabel } from '../types'

const SENTIMENT_STYLES: Record<SentimentLabel, string> = {
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-200 text-slate-700',
}

function SentimentBadge({ sentiment }: { sentiment: SentimentLabel | null }) {
  if (!sentiment) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        Unknown
      </span>
    )
  }
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${SENTIMENT_STYLES[sentiment]}`}
    >
      {sentiment}
    </span>
  )
}

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
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      setError(message ?? 'Failed to analyze sentiment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const latest = history[0]

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Submit a Review</h1>
      <p className="mt-2 text-slate-500">
        Paste a review below to analyze its sentiment.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          placeholder="Paste a product review..."
          className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </form>

      {latest && (
        <div className="mt-8 rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500">Result</h2>
          <div className="mt-3 flex items-center gap-3">
            <SentimentBadge sentiment={latest.predictedSentiment} />
            {latest.confidence !== null && (
              <span className="text-sm text-slate-500">
                {(latest.confidence * 100).toFixed(1)}% confidence
              </span>
            )}
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{latest.text}</p>
        </div>
      )}

      {history.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-medium text-slate-800">Session History</h2>
          <ul className="mt-4 space-y-3">
            {history.slice(1).map((review) => (
              <li key={review.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <SentimentBadge sentiment={review.predictedSentiment} />
                  {review.confidence !== null && (
                    <span className="text-xs text-slate-400">
                      {(review.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{review.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
