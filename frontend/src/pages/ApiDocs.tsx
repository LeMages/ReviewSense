const API_URL = window.__CONFIG__?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'
const ENDPOINT_PATH = '/api/v1/external/predict'

const exampleRequestBody = `{
  "text": "This product exceeded my expectations, fast shipping and great quality!"
}`

const exampleResponseBody = `{
  "sentiment": "positive",
  "confidence": 0.94
}`

const curlSnippet = `curl -X POST ${API_URL}${ENDPOINT_PATH} \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '${exampleRequestBody.replace(/\n\s*/g, ' ')}'`

const jsSnippet = `const response = await fetch('${API_URL}${ENDPOINT_PATH}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'This product exceeded my expectations, fast shipping and great quality!',
  }),
})

const result = await response.json()
// { sentiment: 'positive', confidence: 0.94 }`

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
      <code>{code}</code>
    </pre>
  )
}

export default function ApiDocs() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">API Documentation</h1>
      <p className="mt-2 text-slate-500">
        Integrate ReviewSense sentiment predictions directly into your own
        application using the external prediction API.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Endpoint</h2>
        <div className="mt-3 flex items-center gap-3 rounded-md border border-slate-200 p-4">
          <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
            POST
          </span>
          <code className="text-sm text-slate-800">{ENDPOINT_PATH}</code>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Submits a piece of text and returns its predicted sentiment.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Authentication</h2>
        <p className="mt-2 text-sm text-slate-500">
          Every request must include a bearer token in the{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Authorization</code>{' '}
          header:
        </p>
        <div className="mt-3">
          <CodeBlock code="Authorization: Bearer <token>" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Request Body</h2>
        <p className="mt-2 text-sm text-slate-500">
          A JSON object with a single <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">text</code> field
          containing the review to analyze.
        </p>
        <div className="mt-3">
          <CodeBlock code={exampleRequestBody} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Response</h2>
        <p className="mt-2 text-sm text-slate-500">
          Returns the predicted sentiment (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">positive</code>,{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">negative</code>, or{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">neutral</code>) along with a confidence
          score between 0 and 1.
        </p>
        <div className="mt-3">
          <CodeBlock code={exampleResponseBody} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Code Examples</h2>

        <div className="mt-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-600">curl</h3>
            <div className="mt-2">
              <CodeBlock code={curlSnippet} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600">JavaScript</h3>
            <div className="mt-2">
              <CodeBlock code={jsSnippet} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
