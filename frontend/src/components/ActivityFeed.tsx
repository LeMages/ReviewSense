import { motion } from 'framer-motion'
import SentimentBadge from './SentimentBadge'
import type { SentimentLabel } from '../types'

interface ActivityItem {
  label: SentimentLabel | null
  text: string
  time: string
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariant = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) return null

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={`${item.time}-${i}`}
          variants={itemVariant}
          className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3 backdrop-blur-sm"
        >
          <SentimentBadge sentiment={item.label} />
          <p className="flex-1 truncate text-sm text-foreground">{item.text}</p>
          <span className="font-mono text-xs text-muted-foreground">{item.time}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}
