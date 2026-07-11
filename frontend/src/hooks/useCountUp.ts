import { useEffect, useState, useRef } from 'react'

export function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const startValueRef = useRef(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setCount(target)
      return
    }

    startValueRef.current = count
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startValueRef.current + (target - startValueRef.current) * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return count
}
