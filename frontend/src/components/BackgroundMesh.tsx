import { useEffect, useRef } from 'react'

export default function BackgroundMesh() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const el = containerRef.current
    if (!el) return

    let t = 0
    const animate = () => {
      t += 0.0002
      const x1 = 50 + Math.sin(t * 0.7) * 25
      const y1 = 50 + Math.cos(t * 0.6) * 25
      const x2 = 50 + Math.sin(t * 0.9 + 2) * 30
      const y2 = 50 + Math.cos(t * 0.5 + 1) * 30
      const x3 = 50 + Math.sin(t * 0.4 + 4) * 20
      const y3 = 50 + Math.cos(t * 0.8 + 3) * 20

      el.style.background = `
        radial-gradient(ellipse 80% 60% at ${x1}% ${y1}%, hsla(239, 84%, 67%, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse 60% 70% at ${x2}% ${y2}%, hsla(190, 90%, 54%, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse 50% 80% at ${x3}% ${y3}%, hsla(262, 83%, 73%, 0.05) 0%, transparent 60%)
      `
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 50%, hsla(239, 84%, 67%, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse 60% 70% at 50% 50%, hsla(190, 90%, 54%, 0.04) 0%, transparent 60%)
        `,
      }}
    />
  )
}
