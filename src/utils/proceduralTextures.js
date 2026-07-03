import { isLowEnd } from './perf'

function getRes() {
  return isLowEnd ? { w: 512, h: 256 } : { w: 1024, h: 512 }
}

// ─── Shared drawing helpers ──────────────────────────────────────────────────

function clearCanvas(ctx, w, h, bg = 'rgba(0,0,0,0)') {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
}

function hexGrid(ctx, w, h, color, lineWidth = 0.5, opacity = 0.25) {
  const r = 22
  const dx = r * Math.sqrt(3)
  const dy = r * 1.5
  ctx.save()
  ctx.strokeStyle = color
  ctx.globalAlpha = opacity
  ctx.lineWidth = lineWidth
  for (let row = -1; row < h / dy + 1; row++) {
    for (let col = -1; col < w / dx + 1; col++) {
      const cx = col * dx + (row % 2 === 0 ? 0 : dx / 2)
      const cy = row * dy
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }
  ctx.restore()
}

function cartesianGrid(ctx, w, h, color, step = 32, opacity = 0.18) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.5
  ctx.globalAlpha = opacity
  for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
  ctx.restore()
}

function scanlines(ctx, w, h, color, opacity = 0.06) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.globalAlpha = opacity
  for (let y = 0; y < h; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
  ctx.restore()
}

function circleReticle(ctx, cx, cy, r, color, opacity = 0.6) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.globalAlpha = opacity
  // outer ring
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  // inner ring
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke()
  // crosshair ticks
  const tLen = r * 0.35
  ;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
    ctx.beginPath()
    ctx.moveTo(cx + dx * (r * 0.65), cy + dy * (r * 0.65))
    ctx.lineTo(cx + dx * (r + tLen), cy + dy * (r + tLen))
    ctx.stroke()
  })
  ctx.restore()
}

function waveform(ctx, x0, y0, w, h, color, freq = 3.5, opacity = 0.7, ampScale = 0.38) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2
  ctx.globalAlpha = opacity
  ctx.shadowColor = color
  ctx.shadowBlur = 4
  ctx.beginPath()
  for (let i = 0; i <= w; i++) {
    const t = i / w
    const amp = Math.sin(t * Math.PI * freq) * h * ampScale
      + Math.sin(t * Math.PI * freq * 2.1 + 1) * h * 0.12
    const yy = y0 + h / 2 + amp
    i === 0 ? ctx.moveTo(x0 + i, yy) : ctx.lineTo(x0 + i, yy)
  }
  ctx.stroke()
  ctx.restore()
}

function matrixText(ctx, w, h, color, density = 0.04, opacity = 0.55) {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `bold ${isLowEnd ? 7 : 8}px monospace`
  ctx.globalAlpha = opacity
  const chars = '01アイウエオカキクケコ<>{}[]#%@!?/\\=+-'
  const cols = Math.floor(w / 10)
  const rows = Math.floor(h / 12)
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (Math.random() > density) continue
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], c * 10 + 2, r * 12 + 10)
    }
  }
  ctx.restore()
}

function cornerHUD(ctx, w, h, color, opacity = 0.55) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.globalAlpha = opacity
  const L = 18
  ;[
    [4, 4], [w - 4, 4], [4, h - 4], [w - 4, h - 4],
  ].forEach(([x, y], i) => {
    const sx = i % 2 === 0 ? 1 : -1
    const sy = i < 2 ? 1 : -1
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * L); ctx.stroke()
  })
  ctx.restore()
}

function glowText(ctx, text, x, y, color, size = 9, opacity = 0.7) {
  ctx.save()
  ctx.font = `${size}px monospace`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.shadowColor = color
  ctx.shadowBlur = 6
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ─── 1. ABOUT — Cyan cartesian hologram grid ────────────────────────────────
export function createAboutTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  clearCanvas(ctx, w, h, 'rgba(0,4,20,0)')
  cartesianGrid(ctx, w, h, '#00e5ff', 36, 0.22)
  scanlines(ctx, w, h, '#00e5ff', 0.06)

  // grid nodes — glowing dots at intersections
  ctx.save()
  for (let x = 36; x < w; x += 36) {
    for (let y = 36; y < h; y += 36) {
      if (Math.random() > 0.55) continue
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 5)
      grad.addColorStop(0, 'rgba(0,230,255,0.9)')
      grad.addColorStop(1, 'rgba(0,230,255,0)')
      ctx.fillStyle = grad; ctx.globalAlpha = 1
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()

  // coordinate labels
  for (let i = 1; i < 8; i++) {
    glowText(ctx, `${i * 36 - 18},${h/2|0}`, i * w/8 + 2, h/2 - 6, '#00e5ff', 7, 0.45)
  }

  waveform(ctx, 0, h * 0.62, w, h * 0.22, '#00e5ff', 2.8, 0.55)
  circleReticle(ctx, w * 0.75, h * 0.3, 28, '#00e5ff', 0.55)
  cornerHUD(ctx, w, h, '#00e5ff', 0.6)
  glowText(ctx, 'SECTOR 01 · ABOUT', 8, 14, '#00e5ff', 9, 0.75)
  glowText(ctx, 'COORDS: 00°N 00°E', 8, h - 8, '#00e5ff', 7, 0.5)
  matrixText(ctx, w, h, '#00b4d8', 0.025, 0.35)

  return canvas
}

// ─── 2. SKILLS — Purple hex grid tech map ───────────────────────────────────
export function createSkillsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  clearCanvas(ctx, w, h, 'rgba(8,0,20,0)')
  hexGrid(ctx, w, h, '#a855f7', 0.8, 0.32)
  scanlines(ctx, w, h, '#a855f7', 0.05)

  // hex node highlights
  ctx.save()
  const r = 22; const dx = r * Math.sqrt(3); const dy = r * 1.5
  for (let row = 0; row < h / dy + 1; row++) {
    for (let col = 0; col < w / dx + 1; col++) {
      if (Math.random() > 0.18) continue
      const cx = col * dx + (row % 2 === 0 ? 0 : dx / 2)
      const cy = row * dy
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14)
      g.addColorStop(0, 'rgba(192,132,252,0.9)')
      g.addColorStop(1, 'rgba(192,132,252,0)')
      ctx.fillStyle = g; ctx.globalAlpha = 1
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()

  waveform(ctx, 0, h * 0.68, w, h * 0.2, '#c084fc', 4.2, 0.6)
  circleReticle(ctx, w * 0.22, h * 0.28, 32, '#c084fc', 0.5)
  circleReticle(ctx, w * 0.78, h * 0.72, 22, '#e879f9', 0.4)
  cornerHUD(ctx, w, h, '#a855f7', 0.55)
  glowText(ctx, 'SKILL MATRIX · NODE MAP', 8, 14, '#c084fc', 9, 0.8)
  glowText(ctx, 'NETWORK: ACTIVE', 8, h - 8, '#a855f7', 7, 0.55)
  matrixText(ctx, w, h, '#7c3aed', 0.03, 0.3)

  return canvas
}

// ─── 3. EXPERIENCE — Orange mission log terminal ─────────────────────────────
export function createExperienceTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  clearCanvas(ctx, w, h, 'rgba(12,4,0,0)')
  cartesianGrid(ctx, w, h, '#f97316', 28, 0.16)
  scanlines(ctx, w, h, '#f97316', 0.05)

  // mission log text blocks
  const logs = [
    '> MISSION LOG 001: INITIATED',
    '> MISSION LOG 002: COMPLETED',
    '> MISSION LOG 003: COMPLETED',
    '> MISSION LOG 004: IN PROGRESS',
    '> UPTIME: 99.8% · ERRORS: 0',
  ]
  logs.forEach((line, i) => {
    glowText(ctx, line, 12, 30 + i * 22, '#fb923c', 8, 0.55 - i * 0.04)
  })

  // bar chart columns
  const bars = [0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.45, 0.72, 0.88]
  const bw = w / bars.length * 0.6
  bars.forEach((v, i) => {
    const bx = (i + 0.5) * w / bars.length - bw / 2
    const bh = h * 0.22 * v
    const by = h * 0.95 - bh
    ctx.save()
    ctx.fillStyle = `rgba(249,115,22,${0.15 + v * 0.15})`
    ctx.strokeStyle = '#f97316'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.7
    ctx.fillRect(bx, by, bw, bh)
    ctx.strokeRect(bx, by, bw, bh)
    ctx.restore()
  })

  waveform(ctx, 0, h * 0.55, w, h * 0.18, '#fb923c', 5.5, 0.5)
  circleReticle(ctx, w * 0.82, h * 0.28, 30, '#f97316', 0.5)
  cornerHUD(ctx, w, h, '#f97316', 0.55)
  glowText(ctx, 'EXPERIENCE · MISSION ARCHIVE', 8, 14, '#fb923c', 9, 0.8)
  matrixText(ctx, w, h, '#92400e', 0.02, 0.25)

  return canvas
}

// ─── 4. PROJECTS — Green data vault grid ────────────────────────────────────
export function createProjectsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  clearCanvas(ctx, w, h, 'rgba(0,10,4,0)')
  cartesianGrid(ctx, w, h, '#10b981', 40, 0.2)
  hexGrid(ctx, w, h, '#34d399', 0.4, 0.1)
  scanlines(ctx, w, h, '#10b981', 0.05)

  // data packets
  const pkts = 18
  for (let i = 0; i < pkts; i++) {
    const px = Math.random() * w
    const py = Math.random() * h
    const pw = 30 + Math.random() * 60
    ctx.save()
    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 0.8
    ctx.globalAlpha = 0.3 + Math.random() * 0.3
    ctx.strokeRect(px, py, pw, 10)
    ctx.fillStyle = `rgba(52,211,153,${0.08 + Math.random() * 0.12})`
    ctx.fillRect(px, py, pw * (0.3 + Math.random() * 0.7), 10)
    ctx.restore()
  }

  waveform(ctx, 0, h * 0.58, w, h * 0.2, '#34d399', 3.0, 0.55)
  circleReticle(ctx, w * 0.5, h * 0.32, 35, '#10b981', 0.5)
  circleReticle(ctx, w * 0.15, h * 0.75, 18, '#34d399', 0.35)
  cornerHUD(ctx, w, h, '#10b981', 0.55)
  glowText(ctx, 'PROJECT VAULT · DATA MATRIX', 8, 14, '#34d399', 9, 0.8)
  glowText(ctx, 'FILES: CLASSIFIED · DECRYPTING…', 8, h - 8, '#10b981', 7, 0.5)
  matrixText(ctx, w, h, '#065f46', 0.035, 0.4)

  return canvas
}

// ─── 5. CONTACT — Ice blue comms freq display ────────────────────────────────
export function createContactTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  clearCanvas(ctx, w, h, 'rgba(0,8,20,0)')
  cartesianGrid(ctx, w, h, '#7dd3fc', 32, 0.16)
  scanlines(ctx, w, h, '#7dd3fc', 0.05)

  // signal frequency bars
  const bars = 40
  for (let i = 0; i < bars; i++) {
    const amp = 0.05 + Math.random() * 0.55
    const bx = (i / bars) * w * 0.9 + w * 0.05
    const bh = h * 0.3 * amp
    const by = h * 0.55 - bh / 2
    ctx.save()
    ctx.fillStyle = `rgba(125,211,252,${0.25 + amp * 0.45})`
    ctx.globalAlpha = 1
    ctx.fillRect(bx, by, w / bars * 0.55, bh)
    ctx.restore()
  }

  waveform(ctx, 0, h * 0.72, w, h * 0.16, '#7dd3fc', 6.5, 0.55)
  circleReticle(ctx, w * 0.78, h * 0.28, 28, '#38bdf8', 0.5)
  cornerHUD(ctx, w, h, '#7dd3fc', 0.55)
  glowText(ctx, 'COMMS · OPEN CHANNEL', 8, 14, '#7dd3fc', 9, 0.8)
  glowText(ctx, 'FREQ: 2.4GHz · SIGNAL: STRONG', 8, h - 8, '#7dd3fc', 7, 0.5)

  // transmission pulses
  for (let i = 0; i < 5; i++) {
    const pulse = (i + 1) * w / 6
    ctx.save()
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 0.8
    ctx.globalAlpha = 0.25 - i * 0.04
    ctx.beginPath()
    ctx.moveTo(pulse, 0); ctx.lineTo(pulse, h)
    ctx.stroke()
    ctx.restore()
  }

  matrixText(ctx, w, h, '#0369a1', 0.02, 0.3)

  return canvas
}

// ─── 6. CLOUDS (About planet cloud layer) ────────────────────────────────────
export function createCloudsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  clearCanvas(ctx, w, h, 'rgba(0,0,0,0)')

  // Soft noise cloud patches using multiple radial gradients
  const patches = isLowEnd ? 20 : 40
  for (let i = 0; i < patches; i++) {
    const px = Math.random() * w
    const py = Math.random() * h
    const pr = 20 + Math.random() * 80
    const alpha = 0.04 + Math.random() * 0.12
    const grad = ctx.createRadialGradient(px, py, 0, px, py, pr)
    grad.addColorStop(0, `rgba(0,229,255,${alpha})`)
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
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

  const cx = size / 2; const cy = size / 2

  for (let r = 90; r < 230; r++) {
    const t = (r - 90) / (230 - 90)
    const alpha = 0.45 + Math.sin(t * Math.PI * 10) * 0.4
    const fade = t > 0.9 ? (1 - t) / 0.1 : t < 0.06 ? t / 0.06 : 1
    const div = t > 0.42 && t < 0.48 ? 0.02 : 1

    const red   = Math.floor(168 + Math.sin(t * Math.PI * 4) * 24)
    const green = Math.floor(85  + Math.cos(t * Math.PI * 3) * 20)
    const blue  = 255

    ctx.strokeStyle = `rgba(${red},${green},${blue},${alpha * fade * div * 0.55})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }

  return canvas
}

// ─── 8. STAR (Solar plasma boiling core) ─────────────────────────────────────
export function createStarTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Base dark fill
  ctx.fillStyle = '#160800'
  ctx.fillRect(0, 0, w, h)

  // Plasma noise via overlapping radial glows
  const glows = isLowEnd ? 60 : 140
  for (let i = 0; i < glows; i++) {
    const px = Math.random() * w
    const py = Math.random() * h
    const pr = 8 + Math.random() * 90
    const hot = Math.random()
    let c
    if (hot > 0.72) c = `rgba(255,240,${Math.floor(Math.random()*80)},0.22)` // yellow hot
    else if (hot > 0.38) c = `rgba(255,${100+Math.floor(Math.random()*80)},0,0.18)` // orange
    else c = `rgba(${180+Math.floor(Math.random()*75)},40,0,0.14)` // deep red
    const grad = ctx.createRadialGradient(px, py, 0, px, py, pr)
    grad.addColorStop(0, c)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  // Bright convection lines
  ctx.save()
  const lines = isLowEnd ? 12 : 28
  for (let i = 0; i < lines; i++) {
    const ly = Math.random() * h
    ctx.strokeStyle = `rgba(255,${140+Math.floor(Math.random()*115)},0,${0.08+Math.random()*0.14})`
    ctx.lineWidth = 1 + Math.random() * 2.5
    ctx.beginPath(); ctx.moveTo(0, ly)
    for (let x = 0; x <= w; x += 16) {
      ctx.lineTo(x, ly + (Math.random() - 0.5) * 18)
    }
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

  const cx = size / 2; const cy = size / 2
  const layers = [
    { r: 64, a: 0.18 }, { r: 48, a: 0.22 }, { r: 32, a: 0.28 },
    { r: 18, a: 0.35 }, { r: 8,  a: 0.45 },
  ]
  layers.forEach(({ r, a }) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(0.5, `rgba(255,255,255,${a * 0.4})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })

  return canvas
}
