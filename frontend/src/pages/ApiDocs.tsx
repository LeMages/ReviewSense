import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Lock, Unlock } from 'lucide-react'

const API_URL = window.__CONFIG__?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'
const GRAPHQL_URL = window.__CONFIG__?.GRAPHQL_URL || import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql'
const ENDPOINT_PATH = '/api/v1/external/predict'

const exampleRequestBody = `{
  "text": "This product exceeded my expectations, fast shipping and great quality!"
}`

const exampleResponseBody = `{
  "sentiment": "positive",
  "confidence": 0.94,
  "model_version": "1.2.0"
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
// { sentiment: 'positive', confidence: 0.94, model_version: '1.2.0' }`

const graphqlSnippet = `query {
  reviewStats {
    positive
    negative
    neutral
    total
  }
  recentReviews(limit: 5) {
    id
    text
    predictedSentiment
    confidence
  }
}`

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-xs leading-relaxed text-foreground/80">
        <code>{code}</code>
      </pre>
    </div>
  )
}

type HttpMethod = 'GET' | 'POST' | 'WS'

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-positive/15 text-positive',
  POST: 'bg-primary/15 text-primary',
  WS: 'bg-chart-4/15 text-chart-4',
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`rounded px-2 py-1 font-mono text-xs font-semibold ${METHOD_STYLES[method]}`}>
      {method}
    </span>
  )
}

function AuthBadge({ required }: { required: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        required
          ? 'border-negative/30 bg-negative/10 text-negative'
          : 'border-border bg-secondary text-muted-foreground'
      }`}
    >
      {required ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
      {required ? 'Auth required' : 'No auth'}
    </span>
  )
}

interface ApiParam {
  name: string
  in: 'path' | 'query' | 'body'
  type: string
  required?: boolean
  description: string
}

function ParamsTable({ params }: { params: ApiParam[] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-card/60 text-xs uppercase text-muted-foreground">
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">In</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={`${param.in}-${param.name}`} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-xs text-foreground">
                {param.name}
                {param.required && <span className="ml-1 text-negative">*</span>}
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{param.in}</td>
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{param.type}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ApiEndpoint {
  method: HttpMethod
  path: string
  summary: string
  auth: boolean
  params?: ApiParam[]
  responseExample?: string
  statusCodes?: { code: number; description: string }[]
}

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
        <AuthBadge required={endpoint.auth} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{endpoint.summary}</p>

      {endpoint.params && endpoint.params.length > 0 && <ParamsTable params={endpoint.params} />}

      {endpoint.responseExample && (
        <div className="mt-3">
          <CodeBlock code={endpoint.responseExample} />
        </div>
      )}

      {endpoint.statusCodes && endpoint.statusCodes.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {endpoint.statusCodes.map((sc) => (
            <li key={sc.code}>
              <span className="font-mono font-semibold text-foreground">{sc.code}</span> — {sc.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const authEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/auth/google',
    summary: 'Starts the Google OAuth 2.0 login flow by redirecting the browser to the Google consent screen.',
    auth: false,
    statusCodes: [
      { code: 302, description: 'Redirect to Google' },
      { code: 503, description: 'Google OAuth is not configured on the server' },
    ],
  },
  {
    method: 'GET',
    path: '/auth/google/callback',
    summary: 'Google OAuth callback. On success, signs a JWT and redirects to the frontend with the token in the query string.',
    auth: false,
    responseExample: `302 Found
Location: ${'{FRONTEND_URL}'}/auth/callback?token=<jwt>`,
  },
  {
    method: 'GET',
    path: '/auth/me',
    summary: 'Returns the profile of the currently authenticated user.',
    auth: true,
    responseExample: `{
  "id": "…",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "user"
}`,
    statusCodes: [{ code: 404, description: 'User not found' }],
  },
  {
    method: 'POST',
    path: '/auth/logout',
    summary: 'Ends the current session.',
    auth: false,
    responseExample: `{ "message": "Logged out" }`,
  },
]

const reviewEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/reviews',
    summary: 'Creates a review, runs it through the sentiment model, persists it and broadcasts a real-time notification.',
    auth: true,
    params: [
      { name: 'text', in: 'body', type: 'string', required: true, description: 'Review text, 10 to 5000 characters.' },
      { name: 'language', in: 'body', type: 'string', description: "ISO language code, defaults to 'en'." },
    ],
    responseExample: `// 201 Created
{
  "review": {
    "id": "…",
    "text": "…",
    "predictedSentiment": "positive",
    "confidence": 0.94,
    "language": "en",
    "createdAt": "…"
  }
}`,
    statusCodes: [
      { code: 400, description: 'Missing text or text length outside 10–5000 characters' },
      { code: 500, description: 'Prediction or persistence failure' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/reviews',
    summary: "Lists the authenticated user's reviews, paginated and filterable by sentiment or date.",
    auth: true,
    params: [
      { name: 'sentiment', in: 'query', type: 'string', description: 'Filter by positive, negative or neutral.' },
      { name: 'limit', in: 'query', type: 'number', description: 'Max results per page, capped at 100 (default 20).' },
      { name: 'offset', in: 'query', type: 'number', description: 'Pagination offset (default 0).' },
      { name: 'date', in: 'query', type: 'string', description: 'Exact day filter, format YYYY-MM-DD.' },
      { name: 'month', in: 'query', type: 'string', description: 'Month filter, format YYYY-MM.' },
      { name: 'year', in: 'query', type: 'string', description: 'Year filter, format YYYY.' },
    ],
    responseExample: `{
  "reviews": [ /* Review[] */ ],
  "total": 42
}`,
    statusCodes: [{ code: 400, description: 'date, month or year does not match the expected format' }],
  },
  {
    method: 'GET',
    path: '/api/v1/reviews/:id',
    summary: 'Returns a single review owned by the authenticated user.',
    auth: true,
    params: [{ name: 'id', in: 'path', type: 'string', required: true, description: 'Review identifier.' }],
    responseExample: `{ "review": { /* … */ } }`,
    statusCodes: [
      { code: 403, description: 'The review belongs to another user' },
      { code: 404, description: 'Review not found' },
    ],
  },
]

const healthEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/health',
    summary: 'Main API liveness check.',
    auth: false,
    responseExample: `{ "status": "ok", "service": "main-api" }`,
  },
  {
    method: 'GET',
    path: '/health',
    summary: 'ML service liveness check, reports whether the sentiment model is loaded (internal service, not exposed to the frontend).',
    auth: false,
    responseExample: `{ "status": "ok", "model_loaded": true }`,
  },
  {
    method: 'GET',
    path: '/metrics',
    summary: 'Prometheus metrics for the ML service (request/latency/error counters), scraped by the monitoring stack.',
    auth: false,
  },
]

const notificationEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/notify',
    summary: 'Broadcasts an event to every connected WebSocket client. Called internally after a prediction; not intended for third-party use.',
    auth: false,
    params: [
      { name: 'type', in: 'body', type: 'string', required: true, description: 'Event type identifier.' },
      { name: 'data', in: 'body', type: 'object', required: true, description: 'Event payload.' },
    ],
    statusCodes: [{ code: 200, description: 'Event broadcast (empty body)' }],
  },
  {
    method: 'WS',
    path: '/ (upgrade)',
    summary: 'WebSocket channel exposed by the notification service. Clients receive a JSON message for every event broadcast via /notify.',
    auth: false,
    responseExample: `{
  "type": "prediction",
  "data": {
    "id": "…",
    "text": "…",
    "predictedSentiment": "positive",
    "confidence": 0.94,
    "createdAt": "…"
  }
}`,
  },
]

const graphqlQueries = [
  { name: 'me', signature: 'me: User', auth: false, description: 'Current user profile. Returns null instead of an error when unauthenticated.' },
  { name: 'reviewStats', signature: 'reviewStats: SentimentStats!', auth: true, description: 'Counts of reviews by sentiment (positive, negative, neutral, total).' },
  { name: 'sentimentDistribution', signature: 'sentimentDistribution(days: Int = 30): [ReviewOverTime!]!', auth: true, description: 'Daily sentiment counts over the last N days.' },
  { name: 'recentReviews', signature: 'recentReviews(limit: Int = 10): [Review!]!', auth: true, description: 'Most recent reviews, newest first (limit capped at 100).' },
]

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'auth', label: 'Authentication' },
  { id: 'auth-endpoints', label: 'Auth Endpoints' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'external', label: 'External Prediction' },
  { id: 'graphql', label: 'GraphQL API' },
  { id: 'notifications', label: 'Real-time Notifications' },
  { id: 'health', label: 'Health & Monitoring' },
  { id: 'examples', label: 'Code Examples' },
] as const

export default function ApiDocs() {
  return (
    <div className="mx-auto max-w-4xl lg:flex lg:gap-10">
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-fit lg:w-48 lg:shrink-0">
        <nav className="space-y-1">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <motion.div id="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">API Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            ReviewSense is made of three services: the main API (REST + GraphQL, authentication,
            reviews and external predictions), the ML service (sentiment inference), and the
            notification service (real-time WebSocket broadcasts). This page covers every endpoint
            exposed across the three of them.
          </p>
        </motion.div>

        <motion.section id="auth" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Authentication</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Users sign in interactively via Google OAuth 2.0 (<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">/auth/google</code>).
            The callback issues a JWT, which every protected REST, GraphQL and external endpoint expects
            as a bearer token in the{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Authorization</code>{' '}
            header:
          </p>
          <div className="mt-3">
            <CodeBlock code="Authorization: Bearer <token>" />
          </div>
        </motion.section>

        <motion.section id="auth-endpoints" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Auth Endpoints</h2>
          <p className="mt-2 text-sm text-muted-foreground">Base URL: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{API_URL}</code></p>
          <div className="mt-3 space-y-4">
            {authEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.method + endpoint.path} endpoint={endpoint} />
            ))}
          </div>
        </motion.section>

        <motion.section id="reviews" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Reviews</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            CRUD-style access to the authenticated user's own reviews. Base URL:{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{API_URL}</code>
          </p>
          <div className="mt-3 space-y-4">
            {reviewEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.method + endpoint.path} endpoint={endpoint} />
            ))}
          </div>
        </motion.section>

        <motion.section id="external" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">External Prediction API</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submits a piece of text and returns its predicted sentiment, without persisting a review.
            Intended for integrating ReviewSense predictions into your own application.
          </p>
          <div className="mt-3">
            <EndpointCard
              endpoint={{
                method: 'POST',
                path: ENDPOINT_PATH,
                summary: 'Runs sentiment prediction on arbitrary text.',
                auth: true,
                params: [
                  { name: 'text', in: 'body', type: 'string', required: true, description: 'Text to analyze, minimum 10 characters (no upper limit).' },
                ],
                responseExample: exampleResponseBody,
                statusCodes: [
                  { code: 400, description: 'Missing text or text shorter than 10 characters' },
                  { code: 500, description: 'Prediction failure' },
                ],
              }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Example request body:</p>
          <div className="mt-2">
            <CodeBlock code={exampleRequestBody} />
          </div>
        </motion.section>

        <motion.section id="graphql" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">GraphQL API</h2>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm">
            <MethodBadge method="POST" />
            <code className="font-mono text-sm text-foreground">/graphql</code>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Base URL: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{GRAPHQL_URL}</code>.
            Introspection is enabled outside of production. Every query resolves against the bearer
            token passed in the <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Authorization</code> header.
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-card/60 text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Query</th>
                  <th className="px-3 py-2 font-medium">Auth</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {graphqlQueries.map((query) => (
                  <tr key={query.name} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-foreground">{query.signature}</td>
                    <td className="px-3 py-2">
                      <AuthBadge required={query.auth} />
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{query.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Example query:</p>
          <div className="mt-2">
            <CodeBlock code={graphqlSnippet} />
          </div>
        </motion.section>

        <motion.section id="notifications" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Real-time Notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The notification service is a separate deployment (default port 4000). It exposes a
            WebSocket endpoint that clients connect to for live updates, and an internal HTTP endpoint
            that other services use to publish events.
          </p>
          <div className="mt-3 space-y-4">
            {notificationEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.method + endpoint.path} endpoint={endpoint} />
            ))}
          </div>
        </motion.section>

        <motion.section id="health" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Health & Monitoring</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Liveness and metrics endpoints used by orchestration and monitoring, not by end users.
          </p>
          <div className="mt-3 space-y-4">
            {healthEndpoints.map((endpoint, i) => (
              <EndpointCard key={`${endpoint.method}-${endpoint.path}-${i}`} endpoint={endpoint} />
            ))}
          </div>
        </motion.section>

        <motion.section id="examples" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Code Examples</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Calling the external prediction endpoint from outside the app:
          </p>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">curl</h3>
              <div className="mt-2">
                <CodeBlock code={curlSnippet} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">JavaScript</h3>
              <div className="mt-2">
                <CodeBlock code={jsSnippet} />
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
