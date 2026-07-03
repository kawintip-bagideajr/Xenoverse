import { useEffect, useState } from 'react'

export default function TypewriterText({ text, delay = 0, speed = 28, className = '', style = {}, showCursor = true }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, delay, speed])

  return (
    <span className={className} style={style}>
      {displayed}
      {showCursor && !done && (
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            background: '#00f5ff',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            animation: 'blink 0.7s infinite',
          }}
        />
      )}
    </span>
  )
}
