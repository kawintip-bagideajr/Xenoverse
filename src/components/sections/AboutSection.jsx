import { motion } from 'framer-motion'
import AnimCounter from '../ui/AnimCounter'
import TypewriterText from '../ui/TypewriterText'
import ScanCard from '../ui/ScanCard'
import { isMobile } from '../../utils/perf'
import BluePFP  from '../../assets/pfp/BluePFP.jpg'
import AumimPFP from '../../assets/pfp/AumimPFP.jpg'
import TaePFP   from '../../assets/pfp/TaePFP.jpg'
import ProudPFP from '../../assets/pfp/ProudPFP.jpg'

const CREW = [
  {
    id:       'blueblue',
    name:     'THANABODE JANDA',
    nickname: 'BLUEBLUE',
    role:     'LEAD DEVELOPER',
    tag:      'LEAD',
    isLead:   true,
    color:    '#00f5ff',
    pfp:      BluePFP,
    fb:       'https://www.facebook.com/thana.bodi.784064',
    ig:       'https://www.instagram.com/thanabode1/',
  },
  {
    id:       'aumim',
    name:     'KAWINTIP SURIYA',
    nickname: 'AUMIM',
    role:     'PROJECT MANAGER',
    tag:      'PM',
    isLead:   false,
    color:    '#a78bfa',
    pfp:      AumimPFP,
    fb:       'https://www.facebook.com/kawintip.suriya',
    ig:       'https://www.instagram.com/pipopiposan_/',
  },
  {
    id:       'taetae',
    name:     'WIPHON JANDA',
    nickname: 'TAETAE',
    role:     'FULL-STACK DEVELOPER',
    tag:      'DEV',
    isLead:   false,
    color:    '#34d399',
    pfp:      TaePFP,
    fb:       'https://www.facebook.com/cchanthrdaawiphl',
    ig:       'https://www.instagram.com/cchanthrdaawiphl/',
  },
  {
    id:       'proud',
    name:     'NICHANAN KAMLON',
    nickname: 'PROUD',
    role:     'UI / UX DESIGNER',
    tag:      'DSN',
    isLead:   false,
    color:    '#f9a8d4',
    pfp:      ProudPFP,
    fb:       'https://www.facebook.com/ni.chnanth.kha.holn',
    ig:       'https://www.instagram.com/nichnanthkhmaaohln/',
  },
]

const STATS = [
  { value: 4,  suffix: '',  label: 'CREW MEMBERS',      placeholder: '4' },
  { value: 1,  suffix: '+', label: 'PRODUCTS LAUNCHED', placeholder: '1' },
  { value: 0,  suffix: '',  label: 'COMPROMISES MADE',  placeholder: '0' },
]

const VALUES = [
  { icon: '⚡', label: 'PRECISION OVER SPEED',  sub: 'Ship it right, or don\'t ship it' },
  { icon: '🎨', label: 'DESIGN IS THINKING',    sub: 'Great products start before the first line of code' },
  { icon: '🔭', label: 'SMALL STARS, LONG BURN', sub: 'We grow quiet, then undeniable' },
  { icon: '🤝', label: 'ZERO COMPROMISE',        sub: 'Four minds. One standard.' },
]

export default function AboutSection({ planet }) {
  const c = planet.color

  return (
    <div className="space-y-5">

      {/* Identity card */}
      <ScanCard color={c} delay={0.05} style={{ background: `${c}06`, border: `1px solid ${c}20` }}>
        <div className="p-5 relative overflow-hidden">
          {/* Corner radial */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            style={{ background: `radial-gradient(circle at top right, ${c}18, transparent 70%)` }} />

          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              style={{ background: '#000', border: `1.5px solid ${c}40` }}
              animate={{ boxShadow: [`0 0 0 0 ${c}30`, `0 0 0 8px transparent`] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img src="/xenova-logo.png" alt="Xenova" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
            </motion.div>

            <div>
              <div className="font-bold text-base tracking-wider text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>
                XENOVA
              </div>
              <div className="mt-0.5 tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: c }}>
                DEVELOPMENT TEAM
              </div>
              <div className="mt-0.5 tracking-widest" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
                2 DEV · 1 DESIGNER · 1 PM
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', lineHeight: 1.75 }}>
            <TypewriterText
              text="Xenova is a four-person development team specializing in application development, web solutions, and digital innovation. We combine engineering precision with design thinking to deliver products that are built to perform and built to last."
              speed={18}
              delay={300}
              showCursor={false}
            />
          </p>
        </div>
      </ScanCard>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.4em' }}>
          CREW METRICS
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center p-4 rounded-xl relative overflow-hidden"
              style={{ background: `${c}08`, border: `1px solid ${c}20` }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04, background: `${c}12` }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${c}10, transparent 70%)` }} />
              <div className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: c, textShadow: `0 0 16px ${c}80` }}>
                <AnimCounter target={s.value} suffix={s.suffix} placeholder={s.placeholder} delay={i * 150} />
              </div>
              <div className="mt-1 tracking-widest" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Crew Members */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.4em' }}>
          CREW ROSTER
        </div>
        <div className="flex flex-col gap-2">
          {CREW.map((m, i) => (
            <motion.div
              key={m.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl"
              style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0"
                style={{
                  width: isMobile ? 48 : 40,
                  height: isMobile ? 48 : 40,
                  borderRadius: 12,
                  backgroundImage: `url(${m.pfp})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: `${m.color}18`,
                  border: `1.5px solid ${m.color}40`,
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: isMobile ? 13 : 12,
                    color: m.color,
                    letterSpacing: '0.15em',
                  }}>
                    {m.nickname}
                  </span>
                  {m.isLead && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 6,
                      color: m.color,
                      opacity: 0.7,
                      letterSpacing: '0.15em',
                    }}>★</span>
                  )}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.08em',
                  marginTop: 1,
                }}>
                  {m.role}
                </div>
              </div>

              {/* Social buttons — row of small circles */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {m.fb && (
                  <motion.a href={m.fb} target="_blank" rel="noopener noreferrer" title="Facebook"
                    style={{ width: isMobile?36:30, height: isMobile?36:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(24,119,242,0.15)', border:'1px solid rgba(24,119,242,0.3)', textDecoration:'none', flexShrink:0 }}
                    whileHover={{ scale:1.15, background:'rgba(24,119,242,0.3)' }} whileTap={{ scale:0.88 }}
                  >
                    <svg width={isMobile?15:13} height={isMobile?15:13} viewBox="0 0 24 24" fill="#60a5fa">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </motion.a>
                )}
                {m.ig && (
                  <motion.a href={m.ig} target="_blank" rel="noopener noreferrer" title="Instagram"
                    style={{ width: isMobile?36:30, height: isMobile?36:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(225,48,108,0.12)', border:'1px solid rgba(225,48,108,0.28)', textDecoration:'none', flexShrink:0 }}
                    whileHover={{ scale:1.15, background:'rgba(225,48,108,0.26)' }} whileTap={{ scale:0.88 }}
                  >
                    <svg width={isMobile?15:13} height={isMobile?15:13} viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`ig-${m.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F58529"/><stop offset="50%" stopColor="#DD2A7B"/><stop offset="100%" stopColor="#8134AF"/>
                        </linearGradient>
                      </defs>
                      <path fill={`url(#ig-${m.id})`} d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </motion.a>
                )}
              </div>

            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mission */}
      <ScanCard color={c} delay={0.3} style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.1)' }}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-[1px]" style={{ background: c }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: `${c}80`, letterSpacing: '0.4em' }}>
              DIRECTIVE ALPHA-7
            </span>
            <div className="flex-1 h-[1px]" style={{ background: `${c}20` }} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-body)', lineHeight: 1.8 }}>
            Every constellation started as four points of light in the dark. We are not the biggest. Not yet. But every product we ship, every problem we crack, every user we reach — pulls us closer to the edge of the horizon. We rise slow. We rise sure.
          </p>
        </div>
      </ScanCard>

      {/* Values */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.4em' }}>
          CORE VALUES
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.label}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: `${c}06`, border: `1px solid ${c}14` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ background: `${c}0f`, scale: 1.02 }}
            >
              <span className="text-lg mt-0.5 flex-shrink-0">{v.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: c, letterSpacing: '0.2em' }}>
                  {v.label}
                </div>
                <div className="mt-0.5" style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  {v.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
