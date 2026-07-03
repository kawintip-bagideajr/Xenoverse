import { motion } from 'framer-motion'
import ScanCard from '../ui/ScanCard'

const levelLabel = (n) => n >= 88 ? 'EXPERT' : n >= 72 ? 'ADVANCED' : n >= 55 ? 'INTERMEDIATE' : 'LEARNING'
const levelColor = (n) => n >= 88 ? '#34d399' : n >= 72 ? '#00f5ff' : n >= 55 ? '#a78bfa' : '#fbbf24'

const SKILL_CATEGORIES = [
  {
    label: 'AI TOOLS', icon: '🤖', delay: 0.05,
    skills: [
      { name: 'Claude AI', level: 90 },
      { name: 'GLM 5.2', level: 72 },
      { name: 'Antigravity', level: 80 },
    ],
  },
  {
    label: 'WEB & APP', icon: '🌐', delay: 0.15,
    skills: [
      { name: 'React', level: 88 },
      { name: 'Next.js', level: 78 },
      { name: 'Tailwind CSS', level: 92 },
      { name: 'Framer Motion', level: 80 },
    ],
  },
  {
    label: 'DEPLOY & CLOUD', icon: '🚀', delay: 0.25,
    skills: [
      { name: 'Vercel', level: 90 },
      { name: 'GitHub', level: 85 },
      { name: 'Supabase', level: 70 },
      { name: 'Firebase', level: 68 },
    ],
  },
  {
    label: 'DESIGN', icon: '🎨', delay: 0.35,
    skills: [
      { name: 'Figma', level: 84 },
      { name: 'Canva', level: 88 },
      { name: 'UI/UX Prototyping', level: 80 },
    ],
  },
]

function SkillBar({ name, level, color, delay }) {
  const lc = levelColor(level)
  return (
    <motion.div
      className="py-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>
          {name}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: lc, letterSpacing: '0.15em', opacity: 0.85 }}>
          {levelLabel(level)}
        </span>
      </div>
      {/* Track */}
      <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: `${color}15` }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${lc})`, boxShadow: `0 0 6px ${lc}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ delay: delay + 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  )
}

export default function SkillsSection({ planet }) {
  const c = planet.color

  return (
    <div className="space-y-5">

      {/* Header */}
      <motion.div
        className="rounded-xl p-4 text-center relative overflow-hidden"
        style={{ background: `${c}07`, border: `1px solid ${c}18` }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${c}14, transparent 70%)` }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: c, letterSpacing: '0.4em', textShadow: `0 0 12px ${c}60` }}>
          TECHNOLOGY MATRIX
        </div>
        <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
          Our combined arsenal — tools, frameworks, and platforms we ship with
        </p>
      </motion.div>

      {/* 2×2 grid of categories */}
      <div className="grid grid-cols-2 gap-3">
        {SKILL_CATEGORIES.map((cat) => (
          <ScanCard
            key={cat.label}
            color={c}
            delay={cat.delay}
            style={{ background: `${c}05`, border: `1px solid ${c}14` }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{cat.icon}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: c, letterSpacing: '0.3em' }}>
                  {cat.label}
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: `${c}10` }}>
                {cat.skills.map((skill, si) => (
                  <SkillBar key={skill.name} {...skill} color={c} delay={cat.delay + si * 0.07} />
                ))}
              </div>
            </div>
          </ScanCard>
        ))}
      </div>

      {/* Overall stack tags */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        <div className="mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.4em' }}>
          FULL STACK
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SKILL_CATEGORIES.flatMap(cat => cat.skills.map(s => s.name)).map((tech, i) => (
            <motion.span
              key={tech}
              className="rounded-full px-2.5 py-1 cursor-default"
              style={{
                background: `${c}08`,
                border: `1px solid ${c}20`,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em',
              }}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                scale: 1.08,
                background: `${c}16`,
                border: `1px solid ${c}45`,
                color: c,
                boxShadow: `0 0 10px ${c}30`,
              }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
