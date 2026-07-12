import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function WanderingPulse() {
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [color, setColor] = useState('hsl(var(--primary))')

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const colors = ['hsl(var(--primary))', 'hsl(var(--positive))', 'hsl(var(--chart-4))']
    const interval = setInterval(() => {
      setPos({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      })
      setColor(colors[Math.floor(Math.random() * colors.length)])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="pointer-events-none absolute h-4 w-4 rounded-full blur-sm"
      style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }}
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    />
  )
}

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center text-center overflow-hidden">
      <WanderingPulse />

      <motion.h1
        className="font-display text-[10rem] font-bold leading-none tracking-tighter"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--positive)), hsl(var(--chart-4)))',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        404
      </motion.h1>

      <motion.p
        className="mt-4 text-lg text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        This page doesn&apos;t exist. The sentiment is... lost.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Back to Safety
        </Link>
      </motion.div>
    </div>
  )
}
