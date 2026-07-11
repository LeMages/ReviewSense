import { motion } from 'framer-motion'
import type { SentimentLabel } from '../types'

const COLOR_MAP: Record<string, string> = {
  positive: 'hsl(var(--positive))',
  negative: 'hsl(var(--negative))',
  neutral: 'hsl(var(--neutral))',
}

interface NeuralPulseProps {
  sentiment: SentimentLabel | null
}

export default function NeuralPulse({ sentiment }: NeuralPulseProps) {
  const color = sentiment ? COLOR_MAP[sentiment] : 'hsl(var(--muted-foreground))'

  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: `${color}40` }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.05, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2"
          style={{ borderColor: `${color}60` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.1, 0.45] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2"
          style={{ borderColor: `${color}80` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="relative h-8 w-8 rounded-full shadow-lg"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 24px ${color}60, 0 0 48px ${color}30`,
          }}
        />
      </div>
    </div>
  )
}
