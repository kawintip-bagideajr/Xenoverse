import { useEffect, useRef } from 'react'
import { isMobile } from '../utils/perf'

export default function CustomCursor() {
  const dotRef  = useRef()
  const ringRef = useRef()

  useEffect(() => {
    if (isMobile) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let cx = -200, cy = -200

    const move = (e) => {
      cx = e.clientX
      cy = e.clientY
      dot.style.transform  = `translate(${cx}px, ${cy}px)`
      ring.style.transform = `translate(${cx}px, ${cy}px)`
    }

    const enter = (e) => {
      if (e.target.closest('button, a, [role="button"], input, textarea')) {
        ring.classList.add('cursor-hover')
      }
    }
    const leave = (e) => {
      if (!e.relatedTarget?.closest('button, a, [role="button"], input, textarea')) {
        ring.classList.remove('cursor-hover')
      }
    }
    const down = () => ring.classList.add('cursor-click')
    const up   = () => ring.classList.remove('cursor-click')

    window.addEventListener('mousemove', move,  { passive: true })
    window.addEventListener('mouseover', enter, { passive: true })
    window.addEventListener('mouseout',  leave, { passive: true })
    window.addEventListener('mousedown', down,  { passive: true })
    window.addEventListener('mouseup',   up,    { passive: true })
    document.documentElement.style.cursor = 'none'

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', enter)
      window.removeEventListener('mouseout',  leave)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup',   up)
      document.documentElement.style.cursor = ''
    }
  }, [])

  if (isMobile) return null

  return (
    <>
      <style>{`
        *, *::before, *::after { cursor: none !important; }
        .cursor-ring {
          width: 30px; height: 30px;
          margin-left: -15px; margin-top: -15px;
          opacity: 0.55;
          transition: width .18s ease, height .18s ease,
                      margin .18s ease, opacity .18s ease, transform .06s linear;
        }
        .cursor-ring.cursor-hover {
          width: 48px; height: 48px;
          margin-left: -24px; margin-top: -24px;
          opacity: 0.9;
        }
        .cursor-ring.cursor-click {
          width: 22px; height: 22px;
          margin-left: -11px; margin-top: -11px;
          opacity: 1;
        }
      `}</style>

      {/* Center dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 5, height: 5,
          marginLeft: -2.5, marginTop: -2.5,
          borderRadius: '50%',
          background: '#00f5ff',
          boxShadow: '0 0 6px #00f5ff, 0 0 14px rgba(0,245,255,0.5)',
          transition: 'transform .06s linear',
        }}
      />

      {/* Reticle ring */}
      <div
        ref={ringRef}
        className="cursor-ring fixed top-0 left-0 pointer-events-none z-[9998]"
      >
        <svg width="100%" height="100%" viewBox="0 0 30 30" fill="none">
          {/* Corner brackets */}
          <path d="M1 9 L1 1 L9 1"   stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M21 1 L29 1 L29 9" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1 21 L1 29 L9 29" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M29 21 L29 29 L21 29" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Cross hairs */}
          <line x1="15" y1="11" x2="15" y2="13" stroke="#00f5ff" strokeWidth="1" opacity="0.4"/>
          <line x1="15" y1="17" x2="15" y2="19" stroke="#00f5ff" strokeWidth="1" opacity="0.4"/>
          <line x1="11" y1="15" x2="13" y2="15" stroke="#00f5ff" strokeWidth="1" opacity="0.4"/>
          <line x1="17" y1="15" x2="19" y2="15" stroke="#00f5ff" strokeWidth="1" opacity="0.4"/>
        </svg>
      </div>
    </>
  )
}
