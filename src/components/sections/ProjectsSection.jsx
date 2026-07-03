import { motion } from 'framer-motion'
import { useState } from 'react'

const PROJECTS = [
  {
    id: 1,
    name: 'THAIJN',
    type: 'EDTECH · AI PLATFORM',
    status: 'IN PROGRESS',
    emoji: '🇹🇭',
    year: '2026',
    desc: 'Next-generation Thai language learning platform for foreigners. Features gamified XP progression, AI Conversation Partner, Adventure Learning Path, and real-time Pronunciation Feedback — turning language study into an immersive journey.',
    tags: ['EdTech', 'AI', 'Gamification', 'Web App'],
    statusColor: '#fbbf24',
    url: 'https://thaijourney.vercel.app/',
    image: '/projects/thaijn.png',
  },
]

export default function ProjectsSection({ planet }) {
  const c = planet.color
  const [hovered, setHovered] = useState(null)

  return (
    <div className="space-y-4">

      {/* Header */}
      <motion.div
        className="rounded-xl p-4 text-center relative overflow-hidden"
        style={{ background: `${c}07`, border: `1px solid ${c}18` }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${c}14, transparent 70%)` }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: c, letterSpacing: '0.4em', textShadow: `0 0 12px ${c}60` }}>
          STELLAR CREATIONS
        </div>
        <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)' }}>
          Systems and products launched into orbit
        </p>
      </motion.div>

      {/* Projects */}
      {PROJECTS.map((proj, i) => (
        <motion.div
          key={proj.id}
          className="rounded-xl relative overflow-hidden cursor-pointer"
          style={{
            background: hovered === proj.id ? `${c}0e` : `${c}06`,
            border: `1px solid ${hovered === proj.id ? `${c}40` : `${c}16`}`,
            boxShadow: hovered === proj.id ? `0 0 28px ${c}14` : 'none',
            transition: 'all 0.3s ease',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onHoverStart={() => setHovered(proj.id)}
          onHoverEnd={() => setHovered(null)}
          whileHover={{ y: -2 }}
        >
          {/* Preview image */}
          {proj.image && (
            <div className="relative overflow-hidden" style={{ height: 160 }}>
              <img
                src={proj.image}
                alt={proj.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, rgba(0,0,8,0.92) 100%)` }} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${c}08, transparent 40%)` }} />
              {hovered === proj.id && (
                <motion.div
                  className="absolute left-0 right-0 h-[1px] pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${c}80, transparent)` }}
                  animate={{ top: ['-2px', '102%'] }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              )}
              {/* Year badge */}
              <div className="absolute top-3 right-3">
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8, color: c,
                  background: 'rgba(0,0,8,0.7)', border: `1px solid ${c}30`,
                  padding: '2px 8px', borderRadius: 4, letterSpacing: '0.15em',
                }}>{proj.year}</span>
              </div>
            </div>
          )}

          <div className="p-4 relative z-0">
            {/* Top row */}
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-2xl"
                  animate={hovered === proj.id ? { y: [-2, 2, -2] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {proj.emoji}
                </motion.span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#fff', letterSpacing: '0.18em' }}>
                    {proj.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', marginTop: 2 }}>
                    {proj.type}
                  </div>
                </div>
              </div>
              <motion.span
                className="rounded-full px-2 py-0.5 flex items-center gap-1 flex-shrink-0 ml-3"
                style={{ background: `${proj.statusColor}15`, border: `1px solid ${proj.statusColor}35`, fontFamily: 'var(--font-mono)', fontSize: 7, color: proj.statusColor, letterSpacing: '0.18em' }}
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span style={{ fontSize: 6 }}>●</span> {proj.status}
              </motion.span>
            </div>

            <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
              {proj.desc}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {proj.tags.map((tag) => (
                <span key={tag} className="rounded px-2 py-0.5"
                  style={{ background: `${c}08`, border: `1px solid ${c}20`, fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                  {tag}
                </span>
              ))}
            </div>

            {proj.url && (
              <motion.a
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl relative overflow-hidden"
                style={{
                  background: `${c}12`,
                  border: `1px solid ${c}40`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: c,
                  letterSpacing: '0.25em',
                  textDecoration: 'none',
                  display: 'flex',
                }}
                whileHover={{ background: `${c}22`, boxShadow: `0 0 20px ${c}30` }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${c}18, transparent)` }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                />
                <span>LAUNCH PROJECT</span>
                <span style={{ fontSize: 13 }}>↗</span>
              </motion.a>
            )}
          </div>
        </motion.div>
      ))}

      {/* Pipeline teaser */}
      <motion.div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: c }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.25em' }}>
              NEXT MISSION IN DEVELOPMENT
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.15)', marginTop: 2, letterSpacing: '0.1em' }}>
              CLASSIFIED · DETAILS INCOMING
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
