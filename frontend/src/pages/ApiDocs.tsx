import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

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

const sections = [
  { id: 'endpoint', label: 'Endpoint' },
  { id: 'auth', label: 'Authentication' },
  { id: 'request', label: 'Request Body' },
  { id: 'response', label: 'Response' },
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">API Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Integrate ReviewSense sentiment predictions directly into your own
            application using the external prediction API.
          </p>
        </motion.div>

        <motion.section id="endpoint" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Endpoint</h2>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm">
            <span className="rounded bg-primary/15 px-2 py-1 font-mono text-xs font-semibold text-primary">
              POST
            </span>
            <code className="font-mono text-sm text-foreground">{ENDPOINT_PATH}</code>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Submits a piece of text and returns its predicted sentiment.
          </p>
        </motion.section>

        <motion.section id="auth" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Authentication</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every request must include a bearer token in the{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Authorization</code>{' '}
            header:
          </p>
          <div className="mt-3">
            <CodeBlock code="Authorization: Bearer <token>" />
          </div>
        </motion.section>

        <motion.section id="request" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Request Body</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A JSON object with a single{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">text</code>{' '}
            field containing the review to analyze.
          </p>
          <div className="mt-3">
            <CodeBlock code={exampleRequestBody} />
          </div>
        </motion.section>

        <motion.section id="response" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Response</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Returns the predicted sentiment (<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">positive</code>,{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">negative</code>, or{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">neutral</code>) along with a confidence
            score between 0 and 1.
          </p>
          <div className="mt-3">
            <CodeBlock code={exampleResponseBody} />
          </div>
        </motion.section>

        <motion.section id="examples" className="mt-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-lg font-medium text-foreground">Code Examples</h2>
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
