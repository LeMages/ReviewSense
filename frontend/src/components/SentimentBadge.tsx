import type { SentimentLabel } from '../types'

const STYLES: Record<string, string> = {
  positive: 'bg-positive/15 text-positive border-positive/30',
  negative: 'bg-negative/15 text-negative border-negative/30',
  neutral: 'bg-neutral/15 text-neutral border-neutral/30',
  unknown: 'bg-secondary text-muted-foreground border-border',
}

interface SentimentBadgeProps {
  sentiment: SentimentLabel | null
  className?: string
}

export default function SentimentBadge({ sentiment, className = '' }: SentimentBadgeProps) {
  const style = sentiment ? STYLES[sentiment] : STYLES.unknown
  const label = sentiment ?? 'Unknown'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${style} ${className}`}
    >
      {label}
    </span>
  )
}
