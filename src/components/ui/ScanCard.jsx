import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { isMobile } from '../../utils/perf'

export default function ScanCard({ children, color = '#00f5ff', className = '', style = {}, delay = 0 }) {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-60, 60], [4, -4])
  const rotateY = useTransform(x, [-60, 60], [-4, 4])

  const handleMouse = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={isMobile ? undefined : handleMouse}
      onMouseLeave={isMobile ? undefined : handleLeave}
      style={isMobile ? style : { rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800, ...style }}
      className={`relative overflow-hidden rounded-xl ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Scan line that sweeps on hover */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 h-[1px] z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
        initial={{ top: '-4px', opacity: 0 }}
        whileHover={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      {/* Corner accents */}
      {[
        { top: 0, left: 0, borderTop: `1px solid ${color}60`, borderLeft: `1px solid ${color}60` },
        { top: 0, right: 0, borderTop: `1px solid ${color}60`, borderRight: `1px solid ${color}60` },
        { bottom: 0, left: 0, borderBottom: `1px solid ${color}60`, borderLeft: `1px solid ${color}60` },
        { bottom: 0, right: 0, borderBottom: `1px solid ${color}60`, borderRight: `1px solid ${color}60` },
      ].map((s, i) => (
        <div key={i} className="absolute w-3 h-3 pointer-events-none" style={s} />
      ))}
      {children}
    </motion.div>
  )
}
