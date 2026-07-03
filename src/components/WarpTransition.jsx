import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function WarpTransition({ target }) {
  const lineCount = 80

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden flex items-center justify-center"
      style={{ background: 'transparent' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Radial warp lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: lineCount }).map((_, i) => {
          const angle = (i / lineCount) * 360
          const delay = Math.random() * 0.3
          const len = 20 + Math.random() * 60
          return (
            <motion.div
              key={i}
              className="absolute origin-left"
              style={{
                left: '50%',
                top: '50%',
                width: `${len}vw`,
                height: '1px',
                background: `linear-gradient(90deg, rgba(0,245,255,0.9), transparent)`,
                transform: `rotate(${angle}deg)`,
                boxShadow: '0 0 4px rgba(0,245,255,0.6)',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, delay, ease: [0.2, 0.8, 0.9, 1] }}
            />
          )
        })}
      </div>

      {/* Flash overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, times: [0, 0.3, 1] }}
      />

      {/* Vignette darkening */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.95) 100%)' }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: 1.4, times: [0, 0.5, 1] }}
      />

      {/* Target label */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8] }}
        transition={{ duration: 1.4, times: [0, 0.4, 1] }}
      >
        <div className="text-6xl mb-3">{target?.emoji}</div>
        <div className="text-xs tracking-[0.5em] text-cyan-400 font-mono">
          WARPING TO {target?.section}
        </div>
      </motion.div>
    </motion.div>
  )
}
