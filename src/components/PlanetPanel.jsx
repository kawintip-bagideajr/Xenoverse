import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundEngine } from '../audio/soundEngine'
import { panelOpenRef, isMobile } from '../utils/perf'
import AboutSection from './sections/AboutSection'
import SkillsSection from './sections/SkillsSection'
import ExperienceSection from './sections/ExperienceSection'
import ProjectsSection from './sections/ProjectsSection'
import ContactSection from './sections/ContactSection'
import { PLANETS } from '../data/planets'

const SECTION_MAP = {
  about: AboutSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  contact: ContactSection,
}

function SectionLabel({ planet }) {
  return (
    <div className="flex items-center gap-3">
      <motion.span
        className="text-3xl"
        animate={{ rotate: [0, 8, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {planet.emoji}
      </motion.span>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 14 : 13,
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: planet.color,
            textShadow: `0 0 14px ${planet.color}90`,
          }}
        >
          {planet.section}
        </div>
        <div
          className="mt-0.5"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0,245,255,0.3)', letterSpacing: '0.25em' }}
        >
          {planet.description.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

export default function PlanetPanel({ planet, onClose, onNext }) {
  const SectionComponent = SECTION_MAP[planet.id]
  const currentIndex = PLANETS.findIndex(p => p.id === planet.id)
  const nextPlanet = PLANETS[(currentIndex + 1) % PLANETS.length]
  const scrollRef   = useRef()
  const progressRef = useRef()

  const handleScroll = () => {
    const el  = scrollRef.current
    const bar = progressRef.current
    if (!el || !bar) return
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100
    bar.style.width = `${Math.min(pct, 100)}%`
  }

  useEffect(() => {
    soundEngine.panelOpen()
    panelOpenRef.current = true
    return () => { panelOpenRef.current = false }
  }, [planet.id])

  if (isMobile) {
    /* ─── MOBILE: bottom sheet ─── */
    return (
      <AnimatePresence>
        <motion.div
          key={planet.id}
          className="fixed top-0 left-0 right-0 bottom-[80px] z-30 flex flex-col justify-end pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 pointer-events-auto"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.7)' }}
          />

          {/* Sheet */}
          <motion.div
            className="relative pointer-events-auto w-full rounded-t-3xl overflow-hidden"
            style={{ height: '88vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0, 0, 1] }}
          >
            <div
              className="w-full h-full flex flex-col rounded-t-3xl overflow-hidden"
              style={{
                background: 'rgba(4, 6, 20, 0.99)',
                borderTop: `1px solid ${planet.color}30`,
                borderLeft: `1px solid ${planet.color}15`,
                borderRight: `1px solid ${planet.color}15`,
                boxShadow: `0 -20px 60px ${planet.color}12, 0 -4px 24px rgba(0,0,0,0.6)`,
              }}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
                <motion.div
                  className="rounded-full"
                  style={{ width: 40, height: 4, background: `${planet.color}40` }}
                  animate={{ scaleX: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Color accent line */}
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${planet.color}60, transparent)`, flexShrink: 0 }} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
                <SectionLabel planet={planet} />
                <motion.button
                  onClick={() => { soundEngine.panelClose(); onClose() }}
                  className="w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(0,245,255,0.18)',
                    color: 'rgba(0,245,255,0.6)',
                  }}
                  whileTap={{ scale: 0.88 }}
                >
                  <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                    <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </div>

              {/* Divider + progress bar */}
              <div className="flex-shrink-0 relative" style={{ height: 2, background: `${planet.color}12` }}>
                <div ref={progressRef} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '0%', background: planet.color, boxShadow: `0 0 8px ${planet.color}`, transition: 'width 0.1s linear' }} />
              </div>

              {/* Content */}
              <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden scroll-panel px-4 py-5">
                {SectionComponent && <SectionComponent planet={planet} />}
              </div>

              {/* Footer */}
              <div
                className="flex items-center gap-3 px-4 flex-shrink-0"
                style={{
                  borderTop: `1px solid ${planet.color}10`,
                  paddingTop: 12,
                  paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
                }}
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: planet.color, boxShadow: `0 0 6px ${planet.color}` }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: planet.color, letterSpacing: '0.2em' }}>
                    LIVE
                  </span>
                </div>

                <motion.button
                  onClick={() => { soundEngine.nextPlanet(); onNext() }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl relative overflow-hidden"
                  style={{
                    background: `${nextPlanet.color}10`,
                    border: `1px solid ${nextPlanet.color}35`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: nextPlanet.color,
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    minHeight: 48,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{nextPlanet.emoji}</span>
                  <span>NEXT: {nextPlanet.label.toUpperCase()}</span>
                  <span style={{ fontSize: 13 }}>→</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  /* ─── DESKTOP: side panel ─── */
  return (
    <AnimatePresence>
      <motion.div
        key={planet.id}
        className="fixed inset-0 z-30 flex items-center justify-end pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 pointer-events-auto"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }}
        />

        {/* Panel */}
        <motion.div
          className="relative pointer-events-auto h-[calc(88vh-80px)] sm:h-[88vh] mt-auto mb-[80px] sm:mb-auto mr-2 sm:mr-3 overflow-hidden"
          style={{ width: 'min(92vw, 480px)' }}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 220 }}
        >
          {/* Running border light */}
          <div className="absolute -inset-px rounded-l-2xl md:rounded-2xl pointer-events-none z-20 overflow-hidden" style={{ opacity: 0.7 }}>
            <motion.div
              className="absolute top-0 left-0"
              style={{ width: '50%', height: '2px', background: `linear-gradient(90deg, transparent, ${planet.color}, transparent)` }}
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            />
            <motion.div
              className="absolute top-0 right-0"
              style={{ width: '2px', height: '40%', background: `linear-gradient(180deg, transparent, ${planet.color}, transparent)` }}
              animate={{ y: ['-100%', '350%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute bottom-0 right-0"
              style={{ width: '50%', height: '2px', background: `linear-gradient(90deg, transparent, ${planet.color}, transparent)` }}
              animate={{ x: ['100%', '-300%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0"
              style={{ width: '2px', height: '40%', background: `linear-gradient(180deg, transparent, ${planet.color}, transparent)` }}
              animate={{ y: ['100%', '-350%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.8, repeatDelay: 1 }}
            />
          </div>

          {/* Main panel */}
          <div
            className="w-full h-full flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0, 2, 10, 0.9)',
              backdropFilter: 'blur(36px)',
              border: `1px solid ${planet.color}20`,
              boxShadow: `0 0 60px ${planet.color}15, 0 0 120px ${planet.color}06, inset 0 0 60px rgba(0,0,0,0.5)`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-30 holo-grid" style={{ borderRadius: 'inherit' }} />

            {/* Header */}
            <motion.div
              className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 z-10"
              style={{ borderBottom: `1px solid ${planet.color}15` }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-tl-2xl"
                style={{ background: `linear-gradient(180deg, ${planet.color}80, transparent)` }}
              />
              <SectionLabel planet={planet} />
              <motion.button
                onClick={() => { soundEngine.panelClose(); onClose() }}
                className="w-8 h-8 flex items-center justify-center rounded-full relative z-10"
                style={{ border: '1px solid rgba(0,245,255,0.18)', color: 'rgba(0,245,255,0.5)' }}
                whileHover={{ scale: 1.1, background: 'rgba(0,245,255,0.08)', color: '#00f5ff', boxShadow: '0 0 12px rgba(0,245,255,0.3)' }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.button>
            </motion.div>

            {/* Divider + scroll progress */}
            <div className="flex-shrink-0 relative" style={{ height: 2, background: `${planet.color}12` }}>
              <div ref={progressRef} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '0%', background: planet.color, boxShadow: `0 0 8px ${planet.color}`, transition: 'width 0.1s linear' }} />
            </div>

            {/* Content */}
            <motion.div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden scroll-panel px-4 sm:px-6 py-4 sm:py-6 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {SectionComponent && <SectionComponent planet={planet} />}
            </motion.div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 sm:px-5 py-2.5 flex-shrink-0 z-10 gap-3"
              style={{ borderTop: `1px solid ${planet.color}10` }}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: planet.color, boxShadow: `0 0 6px ${planet.color}` }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: planet.color, letterSpacing: '0.2em' }}>
                  LIVE
                </span>
              </div>

              <motion.button
                onClick={() => { soundEngine.nextPlanet(); onNext() }}
                className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg relative overflow-hidden"
                style={{
                  background: `${nextPlanet.color}10`,
                  border: `1px solid ${nextPlanet.color}30`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: nextPlanet.color,
                  letterSpacing: '0.18em',
                  cursor: 'pointer',
                }}
                whileHover={{ background: `${nextPlanet.color}20`, boxShadow: `0 0 16px ${nextPlanet.color}25` }}
                whileTap={{ scale: 0.96 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${nextPlanet.color}15, transparent)` }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                />
                <span>{nextPlanet.emoji}</span>
                <span>NEXT: {nextPlanet.label.toUpperCase()}</span>
                <span style={{ fontSize: 11 }}>→</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
