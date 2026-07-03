import { useEffect, useRef, useState } from 'react'

export default function AnimCounter({ target, suffix = '', duration = 1800, delay = 0, placeholder = '???' }) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); observer.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started || target === 0) return
    const startTime = performance.now() + delay
    const tick = (now) => {
      if (now < startTime) { requestAnimationFrame(tick); return }
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration, delay])

  return (
    <span ref={ref} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
      <span style={{ display: 'inline-block', animation: started ? 'counter-up 0.4s ease-out forwards' : 'none' }}>
        {target === 0 ? placeholder : `${value}${suffix}`}
      </span>
    </span>
  )
}
