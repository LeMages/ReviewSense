import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'

interface StatCardProps {
  label: string
  value: number
  color: string
  suffix?: string
  subtitle?: string
}

export default function StatCard({ label, value, color, suffix = '', subtitle }: StatCardProps) {
  const animated = useCountUp(value)

  return (
    <motion.div
      className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-colors hover:border-white/10"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-foreground tabular-nums">
        {animated.toLocaleString()}{suffix}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  )
}
