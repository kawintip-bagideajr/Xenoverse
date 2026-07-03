import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

export default function GlitchText({ text, className = '', style = {}, interval = 3500 }) {
  const [display, setDisplay] = useState(text)
  const [glitching, setGlitching] = useState(false)
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  const runGlitch = () => {
    setGlitching(true)
    let iteration = 0
    const maxIter = text.length * 3

    const tick = () => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < iteration / 3) return text[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      iteration++
      if (iteration < maxIter) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(text)
        setGlitching(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    timerRef.current = setInterval(runGlitch, interval)
    // Run once on mount after small delay
    const init = setTimeout(runGlitch, 600)
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(init)
      cancelAnimationFrame(rafRef.current)
    }
  }, [text, interval])

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={runGlitch}
    >
      {display}
    </span>
  )
}
