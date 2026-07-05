import { useState, type FormEvent } from 'react'

export default function SubmitReview() {
  const [review, setReview] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Submit a Review</h1>
      <p className="mt-2 text-slate-500">
        Paste a review below to analyze its sentiment.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <textarea
          value={review}
          onChange={(event) => setReview(event.target.value)}
          rows={8}
          placeholder="Write or paste a review..."
          className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
