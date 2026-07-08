import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const FOUNDING_DATE = new Date('2026-06-03T00:00:00')

function DayCounter({ color }) {
  const [days, setDays] = useState(0)
  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - FOUNDING_DATE.getTime()
      setDays(Math.floor(diff / 86400000))
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: `${color}08`, border: `1px solid ${color}25` }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18, transparent 65%)` }} />
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <div className="text-center">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: `${color}70`, letterSpacing: '0.5em' }}>
          XENOVA · ACTIVE SINCE JUN 3, 2026
        </div>
        <motion.div
          className="mt-2"
          style={{ fontFamily: 'var(--font-display)', fontSize: 52, color, lineHeight: 1, textShadow: `0 0 40px ${color}60` }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {days}
        </motion.div>
        <div className="mt-1" style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.4em' }}>
          DAYS IN ORBIT
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        {[
          { val: '4', lbl: 'CREW' },
          { val: '1', lbl: 'PRODUCT' },
          { val: '∞', lbl: 'DRIVE' },
        ].map(s => (
          <div key={s.lbl} className="text-center">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.25em', marginTop: 3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const MISSIONS = [
  {
    id: '001',
    date: 'Jun 3, 2026',
    title: 'XENOVA FOUNDED',
    desc: 'Four people. One conviction. No investors. No roadmap handed down from above. Just a crew that refused to wait for permission. On day zero, we chose to build something real.',
    tags: ['Day 0', 'Self-Funded', 'Team of 4'],
    status: 'MILESTONE',
    locked: false,
  },
  {
    id: '002',
    date: 'Jun 9, 2026',
    title: 'THAIJN — MISSION LAUNCHED',
    desc: 'Six days after founding, first product locked in. A Thai language learning platform powered by AI — gamified XP, AI conversation partner, adventure learning paths. We didn\'t plan forever. We started.',
    tags: ['EdTech', 'AI', 'Web App'],
    status: 'ACTIVE',
    locked: false,
    url: 'https://thaijourney.vercel.app/',
  },
  {
    id: '003',
    date: 'Jul 8, 2026',
    title: 'XENOVERSE — PORTFOLIO DEPLOYED',
    desc: 'Built the team\'s own identity from scratch. A fully interactive 3D space portfolio powered by React Three Fiber — procedural planet textures, holographic HUD panels, starburst star, custom cursor, and real-time nebula. Every section is a planet you orbit into.',
    tags: ['Three.js', 'React', 'WebGL', 'Procedural'],
    status: 'LIVE',
    locked: false,
    url: 'https://xenoverse-portfolio.vercel.app',
  },
  {
    id: '004',
    date: 'Q3 · 2026',
    title: 'NEXT MISSION',
    desc: null,
    tags: [],
    status: 'INCOMING',
    locked: true,
  },
  {
    id: '005',
    date: 'CLASSIFIED',
    title: 'CLASSIFIED',
    desc: null,
    tags: [],
    status: 'CLASSIFIED',
    locked: true,
  },
]

export default function ExperienceSection({ planet }) {
  const c = planet.color

  return (
    <div className="space-y-4">

      {/* Day counter hero */}
      <DayCounter color={c} />

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.4em' }}>
          MISSION LOG
        </div>
      </motion.div>

      {/* Mission cards */}
      <div className="space-y-3">
          {MISSIONS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {m.locked ? (
                /* Locked / classified card */
                <motion.div
                  className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 3.5 + i * 0.4, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: c }}
                      animate={{ opacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                    />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.25em' }}>
                      MISSION {m.id}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: `${c}35`, letterSpacing: '0.1em' }}>
                      {m.date}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.2em' }}>
                    ██████
                  </div>
                </motion.div>
              ) : (
                /* Active card */
                <motion.div
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{ background: `${c}06`, border: `1px solid ${c}18` }}
                  whileHover={{ background: `${c}0d`, borderColor: `${c}35`, x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                    style={{ background: `linear-gradient(90deg, ${c}50, transparent 55%)` }} />

                  {/* Mission ID + date + status */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: `${c}60`, letterSpacing: '0.18em' }}>
                      MISSION {m.id}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>·</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>
                      {m.date}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 7,
                      color: c, background: `${c}14`, border: `1px solid ${c}28`,
                      borderRadius: 20, padding: '1px 7px', letterSpacing: '0.18em', marginLeft: 'auto',
                    }}>
                      {m.status}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#fff', letterSpacing: '0.1em', marginBottom: 8 }}>
                    {m.title}
                  </div>

                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.85 }}>
                    {m.desc}
                  </p>

                  {m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {m.tags.map(tag => (
                        <span key={tag} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 8,
                          color: 'rgba(255,255,255,0.28)',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 4, padding: '2px 8px', letterSpacing: '0.08em',
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  {m.url && (
                    <motion.a
                      href={m.url} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5"
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9, color: c,
                        textDecoration: 'none', letterSpacing: '0.18em', opacity: 0.75,
                      }}
                      whileHover={{ opacity: 1, x: 2 }}
                    >
                      VISIT PROJECT <span style={{ fontSize: 11 }}>↗</span>
                    </motion.a>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
      </div>

    </div>
  )
}
