import { isLowEnd } from './perf'

function getRes() {
  return isLowEnd ? { w: 512, h: 256 } : { w: 1024, h: 512 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC PRIMITIVE LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

function gLine(ctx, x1, y1, x2, y2, color, lw = 1, a = 0.85, blur = 8) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = lw
  ctx.globalAlpha = a; ctx.shadowColor = color; ctx.shadowBlur = blur
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  // Second pass for extra glow
  ctx.shadowBlur = blur * 2; ctx.globalAlpha = a * 0.35; ctx.stroke()
  ctx.restore()
}

function gArc(ctx, cx, cy, r, color, lw = 1, a = 0.8, blur = 8, s = 0, e = Math.PI * 2) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = lw
  ctx.globalAlpha = a; ctx.shadowColor = color; ctx.shadowBlur = blur
  ctx.beginPath(); ctx.arc(cx, cy, r, s, e); ctx.stroke()
  ctx.shadowBlur = blur * 2.5; ctx.globalAlpha = a * 0.3; ctx.stroke()
  ctx.restore()
}

function gDot(ctx, x, y, r, color, a = 0.95, blur = 12) {
  ctx.save()
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5)
  g.addColorStop(0, color); g.addColorStop(0.4, color); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.globalAlpha = a
  ctx.shadowColor = color; ctx.shadowBlur = blur
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  // Bright core
  ctx.shadowBlur = blur * 0.5; ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function gText(ctx, text, x, y, color, size = 9, a = 0.9, blur = 8) {
  ctx.save()
  ctx.font = `bold ${size}px monospace`; ctx.fillStyle = color
  ctx.globalAlpha = a; ctx.shadowColor = color; ctx.shadowBlur = blur
  ctx.fillText(text, x, y)
  ctx.shadowBlur = blur * 2; ctx.globalAlpha = a * 0.4
  ctx.fillText(text, x, y)
  ctx.restore()
}

function scanlines(ctx, w, h, color, spacing = 3, a = 0.06) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = a
  for (let y = 0; y < h; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.restore()
}

function dataBar(ctx, x, y, bw, filled, color, bh = 4, a = 0.9) {
  ctx.save()
  ctx.globalAlpha = a * 0.15; ctx.fillStyle = color; ctx.fillRect(x, y, bw, bh)
  ctx.globalAlpha = a; ctx.fillStyle = color
  ctx.shadowColor = color; ctx.shadowBlur = 8
  ctx.fillRect(x, y, bw * Math.min(filled, 1), bh)
  ctx.shadowBlur = 16; ctx.globalAlpha = a * 0.35
  ctx.fillRect(x, y, bw * Math.min(filled, 1), bh)
  ctx.restore()
}

function hud(ctx, w, h, color, a = 0.9, L = 22) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 2
  ctx.globalAlpha = a; ctx.shadowColor = color; ctx.shadowBlur = 10
  ;[[4,4],[w-4,4],[4,h-4],[w-4,h-4]].forEach(([x,y],i) => {
    const sx = i%2===0?1:-1, sy = i<2?1:-1
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+sx*L,y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+sy*L); ctx.stroke()
  })
  // Double glow pass
  ctx.shadowBlur = 20; ctx.globalAlpha = a * 0.3
  ;[[4,4],[w-4,4],[4,h-4],[w-4,h-4]].forEach(([x,y],i) => {
    const sx = i%2===0?1:-1, sy = i<2?1:-1
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+sx*L,y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+sy*L); ctx.stroke()
  })
  ctx.restore()
}

function hexGrid(ctx, w, h, color, lw = 0.5, a = 0.2) {
  const r = 22, dx = r * Math.sqrt(3), dy = r * 1.5
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = a
  ctx.shadowColor = color; ctx.shadowBlur = 2
  for (let row = -1; row < h/dy+1; row++) {
    for (let col = -1; col < w/dx+1; col++) {
      const cx = col*dx + (row%2===0?0:dx/2), cy = row*dy
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI/3)*i - Math.PI/6
        const x = cx + r*Math.cos(ang), y = cy + r*Math.sin(ang)
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
      }
      ctx.closePath(); ctx.stroke()
    }
  }
  ctx.restore()
}

function matrixRain(ctx, w, h, color, density = 0.03, a = 0.4) {
  ctx.save()
  ctx.fillStyle = color; ctx.font = 'bold 8px monospace'; ctx.globalAlpha = a
  ctx.shadowColor = color; ctx.shadowBlur = 3
  const chars = '01アイウエオカキ<>{}[]#%!?/\\=+·•'
  const cols = Math.floor(w/10), rows = Math.floor(h/12)
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (Math.random() > density) continue
      const fade = 1 - r / rows
      ctx.globalAlpha = a * fade
      ctx.fillText(chars[Math.floor(Math.random()*chars.length)], c*10+2, r*12+10)
    }
  }
  ctx.restore()
}

function holoBase(ctx, w, h, darkColor, midColor) {
  // Solid dark base
  ctx.fillStyle = darkColor; ctx.fillRect(0, 0, w, h)
  // Radial vignette — brighter center
  const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, h*0.72)
  g.addColorStop(0, midColor)
  g.addColorStop(0.6, darkColor)
  g.addColorStop(1, '#000000')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  // Scanline interference pattern (hologram flicker bands)
  ctx.save()
  for (let y = 0; y < h; y += 6) {
    ctx.globalAlpha = 0.06
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillRect(0, y, w, 1)
    ctx.globalAlpha = 0.025
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fillRect(0, y+1, w, 5)
  }
  ctx.restore()
}

// ─── 1. ABOUT — TERRA SCAN 01 ────────────────────────────────────────────────
// Holographic topographic survey map — geo-scanner HUD
export function createAboutTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  const C = '#00e5ff', C2 = '#0099cc', Cw = '#ffffff'

  holoBase(ctx, w, h, '#000912', '#001828')

  // Latitude grid lines
  for (let i = 1; i < 8; i++) {
    const y = (i/8) * h
    const isEq = i === 4
    gLine(ctx, 0, y, w, y, C, isEq ? 1.2 : 0.4, isEq ? 0.5 : 0.16, isEq ? 6 : 2)
    const deg = (4-i) * 22.5
    gText(ctx, `${Math.abs(deg|0)}${deg>=0?'°N':'°S'}`, 5, y-2, C, 6, 0.38, 2)
  }

  // Longitude grid lines
  for (let i = 1; i < 14; i++) {
    const x = (i/14) * w
    const isPrime = i === 7
    gLine(ctx, x, 0, x, h, C, isPrime ? 1 : 0.35, isPrime ? 0.4 : 0.12, isPrime ? 5 : 1)
    if (i % 2 === 0) {
      const deg = (i-7) * 25
      gText(ctx, `${Math.abs(deg)}°`, x+2, 10, C, 6, 0.32, 2)
    }
  }

  // Topographic contour regions
  const topos = [
    { cx: 0.22*w, cy: 0.42*h, rx: 0.13*w, ry: 0.18*h, lvl: 5 },
    { cx: 0.62*w, cy: 0.36*h, rx: 0.11*w, ry: 0.15*h, lvl: 4 },
    { cx: 0.42*w, cy: 0.68*h, rx: 0.16*w, ry: 0.13*h, lvl: 4 },
    { cx: 0.80*w, cy: 0.58*h, rx: 0.09*w, ry: 0.12*h, lvl: 3 },
    { cx: 0.10*w, cy: 0.62*h, rx: 0.08*w, ry: 0.11*h, lvl: 3 },
  ].slice(0, isLowEnd ? 3 : 5)

  topos.forEach(({ cx, cy, rx, ry, lvl }) => {
    for (let l = lvl; l >= 1; l--) {
      const sc = l / lvl
      ctx.save()
      ctx.strokeStyle = C
      ctx.lineWidth = 0.4 + sc * 0.5
      ctx.globalAlpha = 0.1 + sc * 0.28
      ctx.shadowColor = C; ctx.shadowBlur = 2 + sc * 4
      ctx.beginPath()
      for (let p = 0; p <= 44; p++) {
        const ang = (p/44) * Math.PI * 2
        const jit = 1 + Math.sin(ang*3+l)*0.07 + Math.sin(ang*6+l*1.4)*0.04
        const x = cx + Math.cos(ang) * rx * sc * jit
        const y = cy + Math.sin(ang) * ry * sc * jit
        p===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
      }
      ctx.closePath(); ctx.stroke()
      ctx.restore()
    }
  })

  // Survey scan ring (equatorial)
  for (let r = 1; r <= 5; r++) {
    gArc(ctx, w/2, h/2, (r/5)*h*0.38, C, 0.5, 0.05+(5-r)*0.028, 3)
  }

  // POI / city markers with crosshairs
  const pois = [
    [0.22*w,0.40*h],[0.62*w,0.34*h],[0.42*w,0.66*h],
    [0.12*w,0.28*h],[0.78*w,0.72*h],[0.55*w,0.2*h],
  ]
  pois.forEach(([x,y]) => {
    gDot(ctx, x, y, 2.5, C, 0.85, 8)
    gLine(ctx, x-6, y, x+6, y, C, 0.7, 0.55, 3)
    gLine(ctx, x, y-6, x, y+6, C, 0.7, 0.55, 3)
  })

  // Bio-stats data panel (bottom right)
  const stats = [['O²',0.78],['H²O',0.71],['BIO',0.62],['ATM',0.95]]
  stats.forEach(([label,val],i) => {
    const bx = w-100, by = h-52+i*11
    gText(ctx, label, bx, by+8, C, 7, 0.55, 3)
    dataBar(ctx, bx+22, by+3, 58, val, C, 3, 0.55)
    gText(ctx, `${(val*100)|0}%`, bx+83, by+8, C, 7, 0.45, 2)
  })

  // Reticle targeting overlay (upper right)
  const rx = w*0.82, ry = h*0.28, rr = Math.min(w,h)*0.09
  gArc(ctx, rx, ry, rr, C, 1, 0.55, 6)
  gArc(ctx, rx, ry, rr*0.58, C, 0.6, 0.4, 3)
  ;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
    gLine(ctx, rx+dx*rr*0.7, ry+dy*rr*0.7, rx+dx*(rr+8), ry+dy*(rr+8), C, 1, 0.6, 4)
  })
  gText(ctx, 'BIO-SCAN', rx-20, ry-rr-5, C, 7, 0.5, 3)

  scanlines(ctx, w, h, C, 3, 0.035)
  hud(ctx, w, h, C, 0.55)
  gText(ctx, 'TERRA SCAN 01 · BIO SURVEY', 8, 14, C, 9, 0.78, 7)
  gText(ctx, 'GEO SURVEY: ACTIVE · SYS: ONLINE', 8, h-8, C, 7, 0.5, 3)

  return canvas
}

// ─── 2. SKILLS — NEURAL MATRIX ───────────────────────────────────────────────
// Holographic neural-network topology — skill mastery visualization
export function createSkillsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  const C = '#c084fc', C2 = '#7c3aed', CA = '#f0abfc'

  holoBase(ctx, w, h, '#06000f', '#0e001e')

  // Hex grid base
  hexGrid(ctx, w, h, C, 0.5, 0.22)

  // Neural network nodes and connections
  const nodeCount = isLowEnd ? 20 : 36
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    x: (0.05 + Math.random() * 0.9) * w,
    y: (0.08 + Math.random() * 0.84) * h,
    size: 1.5 + Math.random() * 3.5,
    strength: Math.random(),
  }))

  // Draw connections (nearest neighbors)
  nodes.forEach((a, i) => {
    nodes.slice(i+1).forEach(b => {
      const dx = a.x-b.x, dy = a.y-b.y
      const dist = Math.sqrt(dx*dx+dy*dy)
      if (dist > w*0.22) return
      const strength = (1 - dist/(w*0.22)) * (a.strength+b.strength) * 0.5
      const useAccent = a.strength > 0.8 && b.strength > 0.8
      const col = useAccent ? CA : C
      // Connection with gradient fade
      const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y)
      grad.addColorStop(0, col + Math.floor(strength*255).toString(16).padStart(2,'0'))
      grad.addColorStop(1, col + '00')
      ctx.save()
      ctx.strokeStyle = grad; ctx.lineWidth = 0.5 + strength * 0.7
      ctx.globalAlpha = 0.3 + strength * 0.45
      ctx.shadowColor = col; ctx.shadowBlur = 3 + strength * 4
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke()
      ctx.restore()
    })
  })

  // Node dots
  nodes.forEach(({ x, y, size, strength }) => {
    const col = strength > 0.75 ? CA : strength > 0.45 ? C : C2
    gDot(ctx, x, y, size, col, 0.7 + strength*0.3, 6 + strength*8)
    if (strength > 0.75) {
      gArc(ctx, x, y, size+5, col, 0.6, 0.25, 4)
    }
  })

  // Central processing core (bright pulsing node)
  const corex = w*0.5, corey = h*0.48
  for (let r = 4; r >= 1; r--) {
    gArc(ctx, corex, corey, r*8, CA, 1, 0.1*r, r*3)
  }
  gDot(ctx, corex, corey, 5, CA, 1, 12)
  gText(ctx, 'CORE', corex-12, corey-15, CA, 7, 0.65, 5)

  // Skill radar chart (upper left quadrant)
  const radarCx = w*0.18, radarCy = h*0.3, radarR = h*0.17
  const radarAxes = 6
  const radarVals = [0.95, 0.88, 0.78, 0.92, 0.72, 0.85]
  // Axes
  for (let i = 0; i < radarAxes; i++) {
    const ang = (i/radarAxes)*Math.PI*2 - Math.PI/2
    gLine(ctx, radarCx, radarCy,
      radarCx+Math.cos(ang)*radarR, radarCy+Math.sin(ang)*radarR, C, 0.5, 0.25, 2)
  }
  // Grid rings
  for (let r = 1; r <= 3; r++) {
    const rr = (r/3)*radarR
    ctx.save(); ctx.strokeStyle = C2; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.2
    ctx.beginPath()
    for (let i = 0; i <= radarAxes; i++) {
      const ang = (i/radarAxes)*Math.PI*2 - Math.PI/2
      const x = radarCx+Math.cos(ang)*rr, y = radarCy+Math.sin(ang)*rr
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
    }
    ctx.closePath(); ctx.stroke(); ctx.restore()
  }
  // Data polygon
  ctx.save()
  ctx.strokeStyle = CA; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.65
  ctx.fillStyle = CA + '18'
  ctx.shadowColor = CA; ctx.shadowBlur = 6
  ctx.beginPath()
  radarVals.forEach((v,i) => {
    const ang = (i/radarAxes)*Math.PI*2 - Math.PI/2
    const x = radarCx+Math.cos(ang)*radarR*v
    const y = radarCy+Math.sin(ang)*radarR*v
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
  })
  ctx.closePath(); ctx.stroke(); ctx.fill()
  ctx.restore()

  // Skill bars (right panel)
  const skills = [['REACT',0.95],['THREE.JS',0.88],['TS',0.82],['DESIGN',0.78],['NODE',0.72]]
  skills.forEach(([name, val], i) => {
    const bx = w*0.62, by = h*0.14 + i*13
    gText(ctx, name, bx, by+8, C, 7, 0.55, 3)
    dataBar(ctx, bx+46, by+3, w*0.25, val, CA, 3, 0.6)
    gText(ctx, `${(val*100)|0}`, bx+46+w*0.25+4, by+8, CA, 7, 0.5, 3)
  })

  matrixRain(ctx, w, h, C2, 0.018, 0.28)
  scanlines(ctx, w, h, C, 3, 0.035)
  hud(ctx, w, h, C, 0.5)
  gText(ctx, 'NEURAL MATRIX · SKILL TOPOLOGY', 8, 14, C, 9, 0.75, 7)
  gText(ctx, 'NETWORK: ACTIVE · NODES: ONLINE', 8, h-8, C, 7, 0.5, 3)

  return canvas
}

// ─── 3. EXPERIENCE — MISSION TACTICAL ────────────────────────────────────────
// Holographic tactical briefing display — mission status and log
export function createExperienceTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  const C = '#fb923c', C2 = '#f97316', CA = '#fbbf24'

  holoBase(ctx, w, h, '#0c0200', '#150400')

  // Tactical grid (angled)
  ctx.save()
  ctx.strokeStyle = C; ctx.lineWidth = 0.4; ctx.globalAlpha = 0.1
  const step = 28
  for (let x = -h; x < w+h; x += step) {
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+h,h); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x-h,h); ctx.stroke()
  }
  ctx.restore()

  // Large targeting reticle (right side)
  const rx = w*0.74, ry = h*0.45, rr = h*0.3
  gArc(ctx, rx, ry, rr, C, 1, 0.35, 5)
  gArc(ctx, rx, ry, rr*0.7, C, 0.6, 0.22, 3)
  gArc(ctx, rx, ry, rr*0.35, CA, 0.8, 0.45, 6)
  gDot(ctx, rx, ry, 3, CA, 0.9, 8)
  // Crosshairs
  gLine(ctx, rx-rr-10, ry, rx+rr+10, ry, C, 0.5, 0.25, 3)
  gLine(ctx, rx, ry-rr-10, rx, ry+rr+10, C, 0.5, 0.25, 3)
  // Degree ticks
  for (let deg = 0; deg < 360; deg += 15) {
    const ang = (deg * Math.PI) / 180
    const inner = deg % 90 === 0 ? rr*0.88 : deg % 45 === 0 ? rr*0.92 : rr*0.95
    gLine(ctx,
      rx+Math.cos(ang)*inner, ry+Math.sin(ang)*inner,
      rx+Math.cos(ang)*rr,    ry+Math.sin(ang)*rr,
      C, 0.7, 0.35, 2)
  }
  gText(ctx, 'LOCK-ON', rx-18, ry-rr-10, CA, 7, 0.65, 5)
  gText(ctx, 'T: 00:30:14', rx-22, ry+rr+14, C, 7, 0.55, 3)

  // Mission timeline (horizontal bar)
  const tx = w*0.04, ty = h*0.22, tw = w*0.55, th = 6
  gLine(ctx, tx, ty+th/2, tx+tw, ty+th/2, C, 1.5, 0.35, 4)
  const missions = [
    { t: 0.0, label: 'M-001', done: true },
    { t: 0.28, label: 'M-002', done: true },
    { t: 0.60, label: 'M-003', done: false },
    { t: 1.0, label: 'M-004', done: false },
  ]
  missions.forEach(({ t, label, done }) => {
    const mx = tx + t * tw
    gDot(ctx, mx, ty+th/2, done ? 4 : 3, done ? CA : C, done ? 0.9 : 0.55, done ? 8 : 4)
    gText(ctx, label, mx-12, ty-6, done ? CA : C, 7, done ? 0.7 : 0.4, done ? 5 : 2)
    if (done) gText(ctx, '✓', mx-3, ty+th+12, CA, 8, 0.7, 4)
  })
  // Progress fill
  dataBar(ctx, tx, ty, tw*0.42, 1, C, th, 0.4)

  // Status gauges (3 circular)
  const gauges = [
    { cx: w*0.08, cy: h*0.62, r: h*0.1, val: 0.97, label: 'PWR' },
    { cx: w*0.22, cy: h*0.62, r: h*0.1, val: 0.82, label: 'SHD' },
    { cx: w*0.36, cy: h*0.62, r: h*0.1, val: 1.0,  label: 'SYS' },
  ]
  gauges.forEach(({ cx, cy, r, val, label }) => {
    gArc(ctx, cx, cy, r, C2, 1, 0.2, 2, 0, Math.PI*2)
    gArc(ctx, cx, cy, r, CA, 1.8, 0.7, 6, -Math.PI/2, -Math.PI/2 + val*Math.PI*2)
    gText(ctx, `${(val*100)|0}%`, cx-10, cy+4, CA, 8, 0.75, 5)
    gText(ctx, label, cx-9, cy+r+12, C, 7, 0.55, 3)
  })

  // Mission log text
  const logs = [
    '> M-001: INITIATED — COMPLETED',
    '> M-002: DEPLOYED  — COMPLETED',
    '> M-003: BRIEFED   — ACTIVE',
    '> M-004: SCHEDULED — LOCKED',
  ]
  logs.forEach((line, i) => {
    const done = i < 2
    gText(ctx, line, w*0.04, h*0.82+i*11, done ? CA : C, 7, done ? 0.6 : 0.35, done ? 4 : 2)
  })

  scanlines(ctx, w, h, C, 4, 0.03)
  hud(ctx, w, h, C, 0.5)
  gText(ctx, 'MISSION TACTICAL · EXPERIENCE', 8, 14, C, 9, 0.75, 7)
  gText(ctx, 'UPTIME: 30D 14H · STATUS: ACTIVE', 8, h-8, C, 7, 0.5, 3)

  return canvas
}

// ─── 4. PROJECTS — CODE VAULT ────────────────────────────────────────────────
// Holographic code repository — circuit board + matrix cascade
export function createProjectsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  const C = '#34d399', C2 = '#10b981', CA = '#6ee7b7'

  holoBase(ctx, w, h, '#000a03', '#001206')

  // Blueprint grid
  ctx.save()
  ctx.strokeStyle = C; ctx.lineWidth = 0.4; ctx.globalAlpha = 0.1
  const step = 32
  for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke() }
  for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }
  ctx.restore()

  // Matrix rain cascade (primary visual)
  matrixRain(ctx, w, h, C2, 0.045, 0.55)

  // Circuit board traces with nodes
  const nodeCount = isLowEnd ? 18 : 35
  const nodes = Array.from({ length: nodeCount }, () => ({
    x: Math.round(Math.random() * (w/step)) * step,
    y: Math.round(Math.random() * (h/step)) * step,
    active: Math.random() > 0.4,
  }))

  // Right-angle circuit paths
  nodes.forEach((a, i) => {
    const b = nodes[(i+1) % nodes.length]
    const col = a.active && b.active ? CA : C
    ctx.save()
    ctx.strokeStyle = col; ctx.lineWidth = a.active ? 1.0 : 0.6
    ctx.globalAlpha = a.active ? 0.55 : 0.25
    ctx.shadowColor = col; ctx.shadowBlur = a.active ? 5 : 2
    ctx.beginPath(); ctx.moveTo(a.x, a.y)
    if (Math.random() > 0.5) {
      ctx.lineTo(b.x, a.y); ctx.lineTo(b.x, b.y)
    } else {
      ctx.lineTo(a.x, b.y); ctx.lineTo(b.x, b.y)
    }
    ctx.stroke(); ctx.restore()
    // Node dot
    gDot(ctx, a.x, a.y, a.active ? 3 : 1.5, col, a.active ? 0.8 : 0.4, a.active ? 6 : 2)
    if (a.active) gArc(ctx, a.x, a.y, 6, CA, 0.5, 0.3, 4)
  })

  // Git commit graph (center column visual)
  const gitx = w*0.55, gity = h*0.12, gitstep = h*0.13
  const commits = [
    { y: 0, branch: false, hash: 'a3f2c9d', msg: 'feat: add 3D scene' },
    { y: 1, branch: true,  hash: '8b1e4fa', msg: 'fix: perf optimize' },
    { y: 2, branch: true,  hash: 'c7d5a12', msg: 'feat: hologram HUD' },
    { y: 3, branch: false, hash: 'f9e3b08', msg: 'feat: deploy CI/CD' },
  ]
  // Main trunk line
  gLine(ctx, gitx, gity, gitx, gity+gitstep*3.2, C, 1, 0.4, 3)
  commits.forEach(({ y, branch, hash, msg }, i) => {
    const cy = gity + y * gitstep
    gDot(ctx, gitx, cy, 4, branch ? CA : C, 0.85, 7)
    if (branch) {
      const bx = gitx + 30
      gLine(ctx, gitx, cy, bx, cy-gitstep*0.4, CA, 0.8, 0.5, 4)
      gLine(ctx, bx, cy-gitstep*0.4, bx, cy+gitstep*0.4, CA, 0.8, 0.3, 3)
      gLine(ctx, bx, cy+gitstep*0.4, gitx, cy+gitstep, CA, 0.8, 0.5, 4)
    }
    gText(ctx, hash.substring(0,7), gitx+10, cy+4, branch ? CA : C, 7, 0.65, 4)
    gText(ctx, msg, gitx+10, cy+14, C, 6.5, 0.38, 2)
  })
  gText(ctx, 'GIT LOG', gitx-5, gity-10, CA, 7, 0.6, 4)

  // Compile progress bar
  const cpx = w*0.04, cpy = h*0.88
  gText(ctx, 'COMPILE', cpx, cpy+8, CA, 7, 0.6, 4)
  dataBar(ctx, cpx+50, cpy+3, w*0.35, 0.72, C, 4, 0.65)
  gText(ctx, '72%', cpx+50+w*0.35+5, cpy+8, CA, 7, 0.55, 3)
  gText(ctx, '[ BUILDING ]', cpx, cpy+20, C, 6.5, 0.4, 2)

  // File stats
  const fstats = [['FILES', '47'],['LINES', '3.2K'],['TESTS', '98%']]
  fstats.forEach(([k,v], i) => {
    const fx = w*0.04 + i*(w*0.12), fy = h*0.65
    gText(ctx, k, fx, fy, C, 7, 0.45, 3)
    gText(ctx, v, fx, fy+12, CA, 9, 0.7, 5)
  })

  scanlines(ctx, w, h, C, 3, 0.03)
  hud(ctx, w, h, C, 0.5)
  gText(ctx, 'PROJECT VAULT · CODE MATRIX', 8, 14, C, 9, 0.75, 7)
  gText(ctx, 'STATUS: BUILDING · DEPLOY: READY', 8, h-8, C, 7, 0.5, 3)

  return canvas
}

// ─── 5. CONTACT — COMMS ARRAY ────────────────────────────────────────────────
// Holographic communications radar — signal tracking and transmission
export function createContactTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  const C = '#7dd3fc', C2 = '#38bdf8', CA = '#e0f2fe'

  holoBase(ctx, w, h, '#00080f', '#000e1a')

  // Radar concentric rings (centered left)
  const rcx = w*0.28, rcy = h*0.5
  const maxR = h*0.42
  for (let r = 1; r <= 5; r++) {
    const rr = (r/5) * maxR
    gArc(ctx, rcx, rcy, rr, C, r === 5 ? 1 : 0.5, 0.1 + (5-r)*0.04, 3+r)
  }

  // Radar sweep arcs (4 "aged" sweeps suggesting rotation)
  const sweepAngles = [0, -0.3, -0.6, -0.9]
  sweepAngles.forEach((offset, i) => {
    const ang = Math.PI * 0.15 + offset
    const opacity = 0.5 - i * 0.1
    const width = 1.5 - i * 0.3
    gArc(ctx, rcx, rcy, maxR*0.95, C2, width, opacity, 5+i,
      ang - 0.15, ang + 0.15)
    // Sweep line
    gLine(ctx,
      rcx, rcy,
      rcx + Math.cos(ang)*maxR*0.92,
      rcy + Math.sin(ang)*maxR*0.92,
      C2, width, opacity * 0.7, 4)
  })

  // Cardinal direction labels
  const cardinals = [['N',0,-1],['E',1,0],['S',0,1],['W',-1,0]]
  cardinals.forEach(([label, dx, dy]) => {
    const lx = rcx + dx*(maxR+15) - 5
    const ly = rcy + dy*(maxR+15) + 4
    gText(ctx, label, lx, ly, label==='N'?CA:C, label==='N'?9:8, label==='N'?0.85:0.55, label==='N'?6:3)
  })

  // Contact blips on radar
  const blips = [
    { ang: -0.2, dist: 0.55 }, { ang: 1.1, dist: 0.72 },
    { ang: 2.3, dist: 0.38 }, { ang: 3.8, dist: 0.85 },
  ]
  blips.forEach(({ ang, dist }) => {
    const bx = rcx + Math.cos(ang)*maxR*dist
    const by = rcy + Math.sin(ang)*maxR*dist
    gDot(ctx, bx, by, 3, CA, 0.85, 8)
    gArc(ctx, bx, by, 7, CA, 0.6, 0.25, 4)
  })
  gText(ctx, '4 CONTACTS', rcx-24, rcy+maxR+18, C2, 7, 0.55, 3)

  // Frequency spectrum (right panel)
  const spx = w*0.58, spy = h*0.18, spw = w*0.34, sph = h*0.3
  gText(ctx, 'FREQ SPECTRUM', spx, spy-6, C2, 7, 0.6, 4)
  gLine(ctx, spx, spy, spx, spy+sph, C, 0.6, 0.35, 2)
  gLine(ctx, spx, spy+sph, spx+spw, spy+sph, C, 0.6, 0.35, 2)
  const bars = 28
  for (let i = 0; i < bars; i++) {
    const amp = 0.1 + Math.random() * 0.88
    const bx = spx + (i/bars) * spw
    const bh = sph * amp
    const active = amp > 0.7
    ctx.save()
    ctx.fillStyle = active ? CA : C2
    ctx.globalAlpha = active ? 0.65 : 0.35
    ctx.shadowColor = active ? CA : C2; ctx.shadowBlur = active ? 5 : 2
    ctx.fillRect(bx, spy+sph-bh, spw/bars*0.7, bh)
    ctx.restore()
  }

  // Signal waveform
  ctx.save()
  ctx.strokeStyle = CA; ctx.lineWidth = 1.2
  ctx.globalAlpha = 0.5; ctx.shadowColor = CA; ctx.shadowBlur = 5
  ctx.beginPath()
  for (let i = 0; i <= spw; i++) {
    const t = i/spw
    const y = (spy+sph+h*0.08) + Math.sin(t*Math.PI*8)*h*0.05 + Math.sin(t*Math.PI*18)*h*0.018
    i===0 ? ctx.moveTo(spx+i, y) : ctx.lineTo(spx+i, y)
  }
  ctx.stroke(); ctx.restore()
  gText(ctx, 'SIGNAL WAVEFORM', spx, spy+sph+h*0.14+8, C, 7, 0.5, 3)

  // Comms status panel
  const chans = [['UPLINK','ACTIVE'],['DOWNLINK','ACTIVE'],['P2P','STANDBY'],['BROADCAST','READY']]
  chans.forEach(([ch, status], i) => {
    const cx = w*0.58, cy = h*0.7 + i*12
    const isActive = status === 'ACTIVE'
    gDot(ctx, cx, cy+4, 2.5, isActive ? CA : C, isActive ? 0.85 : 0.45, isActive ? 6 : 2)
    gText(ctx, ch, cx+10, cy+8, C, 7, 0.5, 2)
    gText(ctx, status, cx+10+w*0.11, cy+8, isActive ? CA : C2, 7, isActive ? 0.7 : 0.4, isActive ? 4 : 2)
  })

  scanlines(ctx, w, h, C, 3, 0.035)
  hud(ctx, w, h, C, 0.5)
  gText(ctx, 'COMMS ARRAY · OPEN CHANNEL', 8, 14, C, 9, 0.75, 7)
  gText(ctx, 'FREQ: 2.4GHz · SIGNAL: STRONG', 8, h-8, C, 7, 0.5, 3)

  return canvas
}

// ─── 6. CLOUDS (About planet cloud alpha layer) ───────────────────────────────
export function createCloudsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, w, h)
  const patches = isLowEnd ? 35 : 70
  for (let i = 0; i < patches; i++) {
    const px = Math.random() * w, py = Math.random() * h
    const pr = 12 + Math.random() * 70
    const alpha = 0.08 + Math.random() * 0.2
    const g = ctx.createRadialGradient(px, py, 0, px, py, pr)
    g.addColorStop(0, `rgba(255,255,255,${alpha})`)
    g.addColorStop(0.5, `rgba(255,255,255,${alpha*0.45})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  }
  return canvas
}

// ─── 7. RINGS (Skills Saturn rings) ──────────────────────────────────────────
export function createRingsTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  const cx = size/2, cy = size/2
  for (let r = 90; r < 230; r++) {
    const t = (r-90)/(230-90)
    const alpha = 0.45 + Math.sin(t * Math.PI * 10) * 0.4
    const fade = t > 0.9 ? (1-t)/0.1 : t < 0.06 ? t/0.06 : 1
    const div = t > 0.42 && t < 0.48 ? 0.02 : 1
    const red   = Math.floor(168 + Math.sin(t*Math.PI*4)*24)
    const green = Math.floor(85  + Math.cos(t*Math.PI*3)*20)
    ctx.strokeStyle = `rgba(${red},${green},255,${alpha*fade*div*0.55})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke()
  }
  return canvas
}

// ─── 8. STAR (Solar plasma boiling core) ─────────────────────────────────────
export function createStarTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  const baseGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, h/2)
  baseGrad.addColorStop(0,    '#fffde8')
  baseGrad.addColorStop(0.12, '#ffe060')
  baseGrad.addColorStop(0.35, '#ff7800')
  baseGrad.addColorStop(0.65, '#cc2800')
  baseGrad.addColorStop(0.88, '#6a0a00')
  baseGrad.addColorStop(1,    '#180300')
  ctx.fillStyle = baseGrad; ctx.fillRect(0, 0, w, h)
  const glows = isLowEnd ? 65 : 150
  for (let i = 0; i < glows; i++) {
    const ang = Math.random() * Math.PI * 2
    const dist = Math.random() * w * 0.48
    const px = w/2 + Math.cos(ang)*dist, py = h/2 + Math.sin(ang)*dist*0.5
    const pr = 12 + Math.random() * 80
    const hot = Math.random()
    let c
    if (hot > 0.72)      c = `rgba(255,252,${Math.floor(Math.random()*100)},0.22)`
    else if (hot > 0.38) c = `rgba(255,${115+Math.floor(Math.random()*80)},0,0.16)`
    else                 c = `rgba(${195+Math.floor(Math.random()*60)},40,0,0.12)`
    const g = ctx.createRadialGradient(px, py, 0, px, py, pr)
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  }
  ctx.save()
  const lines = isLowEnd ? 18 : 38
  for (let i = 0; i < lines; i++) {
    const ly = Math.random() * h
    ctx.strokeStyle = `rgba(255,${150+Math.floor(Math.random()*105)},20,${0.05+Math.random()*0.15})`
    ctx.lineWidth = 0.8 + Math.random() * 2.2
    ctx.beginPath(); ctx.moveTo(0, ly)
    for (let x = 0; x <= w; x += 14) ctx.lineTo(x, ly+(Math.random()-0.5)*22)
    ctx.stroke()
  }
  ctx.restore()
  ctx.save()
  const flares = isLowEnd ? 5 : 10
  for (let f = 0; f < flares; f++) {
    const ang = (f/flares)*Math.PI*2 + Math.random()*0.5
    const len = h*(0.18+Math.random()*0.22)
    ctx.strokeStyle = `rgba(255,215,90,${0.07+Math.random()*0.1})`
    ctx.lineWidth = 1.2 + Math.random() * 2.2
    ctx.shadowColor = 'rgba(255,180,0,0.35)'; ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(w/2, h/2)
    ctx.lineTo(w/2+Math.cos(ang)*len, h/2+Math.sin(ang)*len*0.5)
    ctx.stroke()
  }
  ctx.restore()
  return canvas
}

// ─── 9. NEBULA (soft sprite cloud) ───────────────────────────────────────────
export function createNebulaTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  const cx = size/2, cy = size/2
  const layers = [
    {r:64,a:0.30},{r:50,a:0.38},{r:36,a:0.46},{r:22,a:0.55},{r:10,a:0.68},
  ]
  layers.forEach(({r, a}) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(0.35, `rgba(255,255,255,${a*0.5})`)
    g.addColorStop(0.7, `rgba(255,255,255,${a*0.15})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
  })
  return canvas
}
