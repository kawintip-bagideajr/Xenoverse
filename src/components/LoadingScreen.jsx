import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundEngine } from '../audio/soundEngine'

const BOOT_LINES = [
  { text: 'INITIALIZING XENOVA NAVIGATION SYSTEM...', ok: true },
  { text: 'CALIBRATING STELLAR COORDINATES...', ok: true },
  { text: 'LOADING HYPERDRIVE PROTOCOLS...', ok: true },
  { text: 'SCANNING PLANETARY BODIES...', ok: true },
  { text: 'ESTABLISHING QUANTUM LINK...', ok: true },
  { text: 'DEPLOYING HOLOGRAPHIC INTERFACE...', ok: true },
  { text: 'XENOVERSE READY.', ok: true, highlight: true },
]

export default function LoadingScreen({ onComplete }) {
  const [lines, setLines] = useState([])
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  const progress = (lines.length / BOOT_LINES.length) * 100

  const handleEnter = () => {
    soundEngine.uiClick?.()
    setDone(true)
    setTimeout(onComplete, 700)
  }

  useEffect(() => {
    soundEngine.init()
    let i = 0
    const iv = setInterval(() => {
      if (i < BOOT_LINES.length) {
        soundEngine.bootBeep(i)
        setLines(p => [...p, BOOT_LINES[i]])
        i++
        if (i === BOOT_LINES.length) {
          clearInterval(iv)
          setTimeout(() => setReady(true), 400)
        }
      }
    }, 330)
    return () => clearInterval(iv)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between overflow-hidden scan-line-overlay"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Holo grid bg */}
          <div className="absolute inset-0 holo-grid opacity-40 pointer-events-none" />

          {/* Scan beam */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6), transparent)' }}
            animate={{ top: ['-2px', '100vh'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Radial vignette */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' }}
          />

          {/* Logo hero — top section */}
        <motion.div
          className="relative z-20 flex justify-center items-center w-full"
          style={{ flex: '0 0 auto', paddingTop: '5vh' }}
          initial={{ opacity: 0, scale: 1.04, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/xenova-logo.png"
            alt="XENOVERSE"
            style={{
              maxWidth: 'min(560px, 88vw)',
              maxHeight: '46vh',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 32px rgba(0,245,255,0.35)) drop-shadow(0 0 80px rgba(0,245,255,0.12))',
            }}
          />
        </motion.div>

        {/* Terminal + progress + enter — bottom section */}
        <div className="relative z-20 flex flex-col items-center gap-5 w-full max-w-sm px-6 pb-8">

            {/* Terminal */}
            <motion.div
              className="w-full glass-panel rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-400/15">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span
                  className="text-[10px] tracking-[0.35em]"
                  style={{ color: 'rgba(0,245,255,0.55)', fontFamily: 'var(--font-mono)' }}
                >
                  SYSTEM BOOT LOG
                </span>
                <div className="flex-1" />
                <span style={{ color: 'rgba(0,245,255,0.25)', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                  XENV-OS 2.0
                </span>
              </div>

              <div className="space-y-1 min-h-[126px]">
                {lines.filter(Boolean).map((line, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span style={{ color: 'rgba(0,245,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, flexShrink: 0, marginTop: 1 }}>›</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.05em',
                        color: line.highlight
                          ? '#00f5ff'
                          : i === lines.length - 1
                          ? 'rgba(0,245,255,0.7)'
                          : 'rgba(0,245,255,0.35)',
                        textShadow: line.highlight ? '0 0 8px rgba(0,245,255,0.8)' : 'none',
                      }}
                    >
                      {line.text}
                    </span>
                    {line.ok && i < lines.length - 1 && (
                      <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: 9, marginLeft: 'auto', flexShrink: 0 }}>OK</span>
                    )}
                  </motion.div>
                ))}
                {lines.length > 0 && lines.length < BOOT_LINES.length && (
                  <span
                    className="inline-block w-[7px] h-[12px] ml-4"
                    style={{ background: '#00f5ff', animation: 'blink 0.7s infinite' }}
                  />
                )}
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex justify-between mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,245,255,0.4)', letterSpacing: '0.3em' }}>
                <span>INITIALIZING</span>
                <span>{Math.floor(progress)}%</span>
              </div>

              {/* Multi-segment bar */}
              <div className="relative h-[3px] w-full overflow-hidden" style={{ background: 'rgba(0,245,255,0.08)' }}>
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, rgba(0,245,255,0.4) 0%, #00f5ff 90%, #fff 100%)',
                    boxShadow: '0 0 12px rgba(0,245,255,0.9), 0 0 24px rgba(0,245,255,0.4)',
                    transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
                {/* Shimmer on the bar */}
                <motion.div
                  className="absolute top-0 h-full w-8"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)' }}
                  animate={{ left: ['-10%', '110%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
                />
              </div>

              {/* Tick marks */}
              <div className="flex justify-between mt-1">
                {[0, 25, 50, 75, 100].map((t) => (
                  <div key={t} className="flex flex-col items-center gap-0.5">
                    <div className="w-[1px] h-[3px]" style={{ background: progress >= t ? 'rgba(0,245,255,0.5)' : 'rgba(0,245,255,0.1)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: progress >= t ? 'rgba(0,245,255,0.4)' : 'rgba(0,245,255,0.1)', letterSpacing: '0.1em' }}>{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Enter button */}
            <AnimatePresence>
              {ready && (
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.button
                    onClick={handleEnter}
                    className="w-full relative overflow-hidden rounded-lg py-3.5 flex items-center justify-center gap-3"
                    style={{
                      background: 'rgba(0,245,255,0.06)',
                      border: '1px solid rgba(0,245,255,0.4)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 13,
                      letterSpacing: '0.4em',
                      color: '#00f5ff',
                      cursor: 'pointer',
                    }}
                    animate={{ boxShadow: ['0 0 16px rgba(0,245,255,0.15)', '0 0 32px rgba(0,245,255,0.35)', '0 0 16px rgba(0,245,255,0.15)'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ background: 'rgba(0,245,255,0.12)', boxShadow: '0 0 40px rgba(0,245,255,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.12), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
                    />
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ fontSize: 10 }}
                    >
                      ▶
                    </motion.span>
                    <span>ENTER XENOVERSE</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
