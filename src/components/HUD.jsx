import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { PLANETS } from '../data/planets'
import GlitchText from './ui/GlitchText'
import { soundEngine } from '../audio/soundEngine'

function LiveCoords() {
  const [coords, setCoords] = useState({ lat: 23.4512, lon: 118.2341, alt: 42000, spd: 0.38 })
  useEffect(() => {
    const iv = setInterval(() => {
      setCoords((c) => ({
        lat: +(c.lat + (Math.random() - 0.5) * 0.003).toFixed(4),
        lon: +(c.lon + (Math.random() - 0.5) * 0.004).toFixed(4),
        alt: Math.round(c.alt + (Math.random() - 0.5) * 12),
        spd: +(0.35 + Math.random() * 0.08).toFixed(3),
      }))
    }, 1200)
    return () => clearInterval(iv)
  }, [])

  const row = (label, val) => (
    <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em' }}>
      <span style={{ color: 'rgba(0,245,255,0.3)', width: 24 }}>{label}</span>
      <motion.span style={{ color: 'rgba(0,245,255,0.7)' }} key={val} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {val}
      </motion.span>
    </div>
  )
  return (
    <div className="space-y-0.5">
      {row('LAT', `${coords.lat}° N`)}
      {row('LON', `${coords.lon}° E`)}
      {row('ALT', `${coords.alt.toLocaleString()} AU`)}
      {row('SPD', `${coords.spd}c`)}
    </div>
  )
}

function MiniRadar() {
  const [blips, setBlips] = useState([{ x: 0.6, y: 0.3 }, { x: 0.2, y: 0.7 }, { x: 0.8, y: 0.6 }])
  useEffect(() => {
    const iv = setInterval(() => {
      setBlips((b) => b.map((p) => ({
        x: Math.max(0.05, Math.min(0.95, p.x + (Math.random() - 0.5) * 0.05)),
        y: Math.max(0.05, Math.min(0.95, p.y + (Math.random() - 0.5) * 0.05)),
      })))
    }, 1600)
    return () => clearInterval(iv)
  }, [])
  const size = 56
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size/2} cy={size/2} r={size/2-1} fill="none" stroke="rgba(0,245,255,0.12)" strokeWidth="1" />
        <circle cx={size/2} cy={size/2} r={size/3} fill="none" stroke="rgba(0,245,255,0.07)" strokeWidth="1" />
        <circle cx={size/2} cy={size/2} r={size/6} fill="none" stroke="rgba(0,245,255,0.05)" strokeWidth="1" />
        <line x1={size/2} y1="1" x2={size/2} y2={size-1} stroke="rgba(0,245,255,0.05)" strokeWidth="1" />
        <line x1="1" y1={size/2} x2={size-1} y2={size/2} stroke="rgba(0,245,255,0.05)" strokeWidth="1" />
        <motion.line x1={size/2} y1={size/2} x2={size-2} y2={size/2} stroke="rgba(0,245,255,0.5)" strokeWidth="1.5"
          animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${size/2}px`, originY: `${size/2}px` }} />
        {blips.map((b, i) => (
          <motion.circle key={i} cx={b.x*size} cy={b.y*size} r="2" fill="#00f5ff"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.5 }} />
        ))}
        <circle cx={size/2} cy={size/2} r="2.5" fill="#00f5ff" style={{ filter: 'drop-shadow(0 0 3px #00f5ff)' }} />
      </svg>
    </div>
  )
}

function SystemStatus() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(iv)
  }, [])
  const bars = [
    { label: 'SHIELDS', val: 94 + Math.sin(tick) * 3 },
    { label: 'POWER',   val: 87 + Math.cos(tick) * 4 },
    { label: 'SIGNAL',  val: 100 },
  ]
  return (
    <div className="space-y-1">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0,245,255,0.3)', letterSpacing: '0.1em', width: 38 }}>{b.label}</span>
          <div className="flex-1 h-[2px] rounded-full" style={{ background: 'rgba(0,245,255,0.08)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: b.val > 90 ? '#00f5ff' : b.val > 70 ? '#fbbf24' : '#f87171' }}
              animate={{ width: `${Math.floor(b.val)}%` }} transition={{ duration: 0.8 }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0,245,255,0.4)', width: 22, textAlign: 'right' }}>{Math.floor(b.val)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function HUD({ activePlanet, onNavClick }) {
  const [time, setTime] = useState('')
  const [soundOn, setSoundOn] = useState(true)
  useEffect(() => {
    const update = () => {
      const d = new Date()
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <>
      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4">

          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.6, ease: [0.16,1,0.3,1] }}>
            <div className="text-base sm:text-lg font-black tracking-[0.25em] neon-text holo-flicker" style={{ fontFamily: 'var(--font-display)' }}>
              <GlitchText text="XENOVERSE" interval={5500} />
            </div>
            <div className="tracking-[0.4em] mt-0.5 hidden sm:block" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0,245,255,0.35)' }}>
              STELLAR PORTFOLIO SYSTEM
            </div>
          </motion.div>

          {/* Clock — center on md+ */}
          <motion.div
            className="hidden md:flex flex-col items-center gap-0.5 absolute left-1/2 -translate-x-1/2 top-3"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
          >
            <div className="neon-text-sm text-base font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>{time}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0,245,255,0.28)', letterSpacing: '0.3em' }}>STELLAR TIME</div>
          </motion.div>

          {/* Right: sector info + sound toggle (desktop only) */}
          <motion.div className="hidden sm:flex flex-col items-end gap-1.5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,245,255,0.35)', letterSpacing: '0.15em' }}>
              PILOT: <span style={{ color: '#00f5ff' }}>XENOVA CREW</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0,245,255,0.22)', letterSpacing: '0.15em' }}>
              <AnimatePresence mode="wait">
                <motion.span key={activePlanet?.id ?? 'none'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {activePlanet ? `SECTOR: ${activePlanet.section}` : 'XENOVA PRIME'}
                </motion.span>
              </AnimatePresence>
            </div>
            {/* Sound toggle */}
            <motion.button
              className="pointer-events-auto flex items-center gap-1.5 px-2 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.18em',
                color: soundOn ? 'rgba(0,245,255,0.6)' : 'rgba(0,245,255,0.2)',
                border: `1px solid ${soundOn ? 'rgba(0,245,255,0.2)' : 'rgba(0,245,255,0.07)'}`,
                background: soundOn ? 'rgba(0,245,255,0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => setSoundOn(soundEngine.toggle())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{soundOn ? '◉' : '◌'}</span>
              <span>SFX</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16,1,0.3,1] }}
      >
        <div className="flex items-end justify-between px-4 pb-4 sm:px-6 sm:pb-5 gap-3">

          {/* Left: coords + radar (desktop only) */}
          <div className="hidden lg:flex flex-col gap-2.5 min-w-[140px]">
            <LiveCoords />
            <div className="flex items-end gap-3">
              <MiniRadar />
              <SystemStatus />
            </div>
          </div>

          {/* Center: nav */}
          <div className="flex-1 flex justify-center">
            <div
              className="rounded-2xl px-2 py-2 sm:px-3 sm:py-2.5 flex items-center gap-1 sm:gap-1.5"
              style={{
                background: 'rgba(0, 2, 10, 0.88)',
                border: '1px solid rgba(0,245,255,0.14)',
                boxShadow: '0 0 24px rgba(0,245,255,0.05)',
                maxWidth: 420,
                width: '100%',
              }}
            >
              {PLANETS.map((planet, i) => (
                <motion.button
                  key={planet.id}
                  className="flex-1 relative flex flex-col items-center gap-1 px-1 py-2 sm:py-2 rounded-xl pointer-events-auto"
                  style={{
                    background: activePlanet?.id === planet.id ? `${planet.color}18` : 'transparent',
                    border: activePlanet?.id === planet.id ? `1px solid ${planet.color}45` : '1px solid transparent',
                    minHeight: 52,
                  }}
                  onClick={() => { soundEngine.uiClick(); onNavClick(planet) }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: [0.16,1,0.3,1] }}
                >
                  {activePlanet?.id === planet.id && (
                    <motion.div className="absolute inset-0 rounded-xl"
                      style={{ background: `radial-gradient(circle, ${planet.color}18, transparent)` }}
                      layoutId="nav-active-bg" />
                  )}
                  <span className="text-xl sm:text-2xl leading-none relative z-10">{planet.emoji}</span>
                  <span className="relative z-10 hidden sm:block" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 7,
                    letterSpacing: '0.15em',
                    color: activePlanet?.id === planet.id ? planet.color : 'rgba(0,245,255,0.3)',
                    textShadow: activePlanet?.id === planet.id ? `0 0 8px ${planet.color}` : 'none',
                  }}>
                    {planet.label.toUpperCase()}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: active planet status (desktop only) */}
          <div className="hidden lg:block text-right min-w-[130px]">
            <AnimatePresence mode="wait">
              {activePlanet ? (
                <motion.div key={activePlanet.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-1">
                  <div className="font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: activePlanet.color, textShadow: `0 0 10px ${activePlanet.color}` }}>
                    ● {activePlanet.section}
                  </div>
                  <motion.div className="inline-block px-2 py-0.5 rounded"
                    style={{ background: `${activePlanet.color}12`, border: `1px solid ${activePlanet.color}28` }}
                    animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: activePlanet.color, letterSpacing: '0.2em' }}>EXPLORING</span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,245,255,0.18)', letterSpacing: '0.18em' }}>
                  SELECT A PLANET
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Corner brackets ── */}
      {[
        { cls: 'top-2 left-2', d: 'M0 16 L0 0 L16 0' },
        { cls: 'top-2 right-2', d: 'M28 16 L28 0 L12 0' },
        { cls: 'bottom-[84px] sm:bottom-[88px] left-2', d: 'M0 12 L0 28 L16 28' },
        { cls: 'bottom-[84px] sm:bottom-[88px] right-2', d: 'M28 12 L28 28 L12 28' },
      ].map(({ cls, d }, i) => (
        <motion.div key={i} className={`fixed ${cls} z-20 pointer-events-none`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d={d} stroke="rgba(0,245,255,0.3)" strokeWidth="1.5" />
          </svg>
        </motion.div>
      ))}

      {/* ── Hint ── */}
      {!activePlanet && (
        <motion.div
          className="fixed z-30 pointer-events-none left-1/2 -translate-x-1/2"
          style={{ bottom: 88 }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0] }} transition={{ delay: 2, duration: 2.5, repeat: 2 }}
        >
          <div className="hidden sm:block" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,245,255,0.45)', letterSpacing: '0.4em', whiteSpace: 'nowrap' }}>
            CLICK A PLANET TO EXPLORE  —  DRAG TO ROTATE
          </div>
          <div className="block sm:hidden text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,245,255,0.45)', letterSpacing: '0.2em' }}>
            TAP A PLANET TO EXPLORE
          </div>
        </motion.div>
      )}
    </>
  )
}
