const endpoints = [
  { method: 'POST', path: '/api/reviews', description: 'Submit a review for sentiment analysis.' },
  { method: 'GET', path: '/api/reviews/:id', description: 'Retrieve a review and its prediction result.' },
  { method: 'GET', path: '/api/stats', description: 'Retrieve aggregate sentiment statistics.' },
]

export default function ApiDocs() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">API Documentation</h1>
      <p className="mt-2 text-slate-500">
        Public API reference for integrating with ReviewSense. Full docs
        coming soon.
      </p>

      <div className="mt-8 space-y-4">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.path}
            className="rounded-md border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                {endpoint.method}
              </span>
              <code className="text-sm text-slate-800">{endpoint.path}</code>
            </div>
            <p className="mt-2 text-sm text-slate-500">{endpoint.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
