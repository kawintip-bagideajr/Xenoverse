import { motion } from 'framer-motion'
import { useState } from 'react'
import { isMobile } from '../../utils/perf'

const CHANNELS = [
  {
    icon: '✉',
    label: 'EMAIL',
    sub: 'Direct Message',
    value: 'xenova.team@gmail.com',
    url: 'mailto:xenova.team@gmail.com',
    accent: '#00f5ff',
  },
  {
    icon: '◈',
    label: 'INSTAGRAM',
    sub: '@thexenova',
    value: 'instagram.com/thexenova',
    url: 'https://www.instagram.com/thexenova/',
    accent: '#e879f9',
  },
  {
    icon: '⬡',
    label: 'FACEBOOK',
    sub: 'TheXenova',
    value: 'facebook.com/TheXenova',
    url: 'https://www.facebook.com/TheXenova',
    accent: '#60a5fa',
  },
  {
    icon: '✕',
    label: 'TWITTER / X',
    sub: '@Xenova38',
    value: 'x.com/Xenova38',
    url: 'https://x.com/Xenova38',
    accent: '#f8fafc',
  },
  {
    icon: '⌥',
    label: 'GITHUB',
    sub: 'Xenova Projects',
    value: 'github.com/xenova',
    url: 'https://github.com/kawintip-bagideajr',
    accent: '#a78bfa',
  },
]

export default function ContactSection({ planet }) {
  const c = planet.color
  const [hovered, setHovered] = useState(null)

  return (
    <div className="space-y-4">

      {/* Header */}
      <motion.div
        className="relative rounded-xl overflow-hidden"
        style={{ background: `${c}06`, border: `1px solid ${c}20` }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% -20%, ${c}20, transparent 65%)` }} />
        <div className="px-5 py-4">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: `${c}80`, letterSpacing: '0.45em' }}>
            SYS // COMM_LINK
          </div>
          <div className="mt-1" style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', letterSpacing: '0.12em' }}>
            GET IN TOUCH
          </div>
          <div className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Open for projects, collabs, and ideas
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${c}60, transparent)` }} />
      </motion.div>

      {/* Channels */}
      <div className="space-y-2.5">
        {CHANNELS.map((ch, i) => (
          <motion.a
            key={ch.label}
            href={ch.url}
            target={ch.url.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl relative overflow-hidden"
            style={{
              background: hovered === i ? `${ch.accent}0d` : 'rgba(255,255,255,0.025)',
              border: `1px solid ${hovered === i ? `${ch.accent}45` : 'rgba(255,255,255,0.07)'}`,
              textDecoration: 'none',
              transition: 'background 0.25s, border-color 0.25s',
            }}
            initial={isMobile ? { opacity: 0, y: 12 } : { opacity: 0, x: -16 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Left accent bar */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
              style={{ background: ch.accent, opacity: hovered === i ? 1 : 0, transition: 'opacity 0.2s' }}
            />

            {/* Icon box */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: hovered === i ? `${ch.accent}20` : `${ch.accent}0c`,
                border: `1px solid ${hovered === i ? `${ch.accent}50` : `${ch.accent}20`}`,
                color: ch.accent,
                fontSize: 15,
                fontWeight: 700,
                transition: 'all 0.2s',
                boxShadow: hovered === i ? `0 0 14px ${ch.accent}25` : 'none',
              }}
            >
              {ch.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                color: hovered === i ? '#fff' : 'rgba(255,255,255,0.7)',
                letterSpacing: '0.18em',
                transition: 'color 0.2s',
              }}>
                {ch.label}
              </div>
              <div className="mt-0.5 truncate" style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: hovered === i ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)',
                transition: 'color 0.2s',
              }}>
                {ch.value}
              </div>
            </div>

            {/* Arrow */}
            <motion.div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: ch.accent,
                flexShrink: 0,
                opacity: hovered === i ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              ↗
            </motion.div>
          </motion.a>
        ))}
      </div>

      {/* Footer note */}
      <motion.div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: '#34d399' }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          We respond within 24 hours
        </span>
      </motion.div>
    </div>
  )
}
