import { isLowEnd } from './perf'

function getRes() {
  return isLowEnd ? { w: 512, h: 256 } : { w: 1024, h: 512 }
}

// ─── Low-level draw helpers ──────────────────────────────────────────────────

function fill(ctx, w, h, color) {
  ctx.fillStyle = color; ctx.fillRect(0, 0, w, h)
}

// Pseudo-random from seed (deterministic, no Math.random)
function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

// Value noise — smooth interpolated noise field
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
  const a = hash(ix,   iy),   b = hash(ix+1, iy)
  const c = hash(ix,   iy+1), d = hash(ix+1, iy+1)
  return a + (b-a)*ux + (c-a)*uy + (d-c)*ux*uy + (a-b)*ux*uy
}

// Fractal Brownian Motion — layered noise for organic look
function fbm(x, y, oct = 5) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < oct; i++) {
    v += a * noise(x * f, y * f)
    a *= 0.5; f *= 2.1
  }
  return v
}

// Draw glow circle
function glowCircle(ctx, x, y, r, color, a = 0.8) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(0.3, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill()
  ctx.restore()
}

// Glow line
function glowLine(ctx, x1, y1, x2, y2, color, lw, a, blur) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = lw
  ctx.globalAlpha = a; ctx.shadowColor = color; ctx.shadowBlur = blur
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  ctx.restore()
}

// ─── 1. ABOUT — Cyan Terrain Scanner ─────────────────────────────────────────
// Bioluminescent ocean world with glowing continent outlines
export function createAboutTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Deep ocean base
  fill(ctx, w, h, '#000d1a')

  // FBM terrain height field → color
  const oct = isLowEnd ? 4 : 6
  for (let px = 0; px < w; px++) {
    for (let py = 0; py < h; py++) {
      const nx = px / w * 4, ny = py / h * 2
      const n = fbm(nx, ny, oct)

      let r=0, g=0, b=0, a=0
      if (n > 0.62) {           // land — teal-green highlands
        const t = (n - 0.62) / 0.38
        r = Math.floor(t * 30)
        g = Math.floor(80 + t * 120)
        b = Math.floor(80 + t * 60)
        a = 0.85
      } else if (n > 0.52) {   // shallow coast — glowing cyan edge
        const t = (n - 0.52) / 0.10
        r = Math.floor(t * 10)
        g = Math.floor(160 + t * 60)
        b = Math.floor(180 + t * 50)
        a = 0.6
      } else if (n > 0.35) {   // mid ocean — dark blue
        const t = (n - 0.35) / 0.17
        r = 0; g = Math.floor(30 + t * 50); b = Math.floor(80 + t * 80)
        a = 0.7
      } else {                  // deep ocean — near-black
        r = 0; g = Math.floor(10 + n*30); b = Math.floor(30 + n*60)
        a = 0.5
      }
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`
      ctx.fillRect(px, py, 1, 1)
    }
  }

  // Glowing coastline contour pass
  ctx.save()
  for (let px = 1; px < w-1; px++) {
    for (let py = 1; py < h-1; py++) {
      const nx = px/w*4, ny = py/h*2
      const n  = fbm(nx, ny, oct)
      const nr = fbm((px+1)/w*4, ny, oct)
      const nd = fbm(nx, (py+1)/h*2, oct)
      const isEdge = Math.abs(n-0.52) < 0.03 ||
        (n > 0.52 && nr < 0.52) || (n > 0.52 && nd < 0.52)
      if (isEdge) {
        ctx.globalAlpha = 0.8
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 6
        ctx.fillStyle = '#00e5ff'
        ctx.fillRect(px, py, 1, 1)
      }
    }
  }
  ctx.restore()

  // Polar ice caps
  const topG = ctx.createLinearGradient(0, 0, 0, h*0.12)
  topG.addColorStop(0, 'rgba(200,235,255,0.85)')
  topG.addColorStop(1, 'rgba(200,235,255,0)')
  ctx.fillStyle = topG; ctx.fillRect(0, 0, w, h*0.12)

  const botG = ctx.createLinearGradient(0, h*0.88, 0, h)
  botG.addColorStop(0, 'rgba(200,235,255,0)')
  botG.addColorStop(1, 'rgba(200,235,255,0.80)')
  ctx.fillStyle = botG; ctx.fillRect(0, h*0.88, w, h*0.12)

  // Cloud wisps
  for (let i = 0; i < (isLowEnd ? 30 : 70); i++) {
    const cx = Math.floor(hash(i,1)*w), cy = Math.floor(hash(i,2)*h)
    const cr = 12 + hash(i,3)*55
    glowCircle(ctx, cx, cy, cr, 'rgba(220,240,255,0.06)', 1)
  }

  // Atmosphere limb glow (cyan edge)
  const atm = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.7)
  atm.addColorStop(0,'rgba(0,200,255,0)')
  atm.addColorStop(0.8,'rgba(0,200,255,0)')
  atm.addColorStop(1,'rgba(0,200,255,0.2)')
  ctx.fillStyle = atm; ctx.fillRect(0,0,w,h)

  return canvas
}

// ─── 2. SKILLS — Purple Hex Nebula Grid ──────────────────────────────────────
// Glowing honeycomb tech-web with energy nodes
export function createSkillsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  fill(ctx, w, h, '#050010')

  // Purple noise base
  for (let px = 0; px < w; px += 2) {
    for (let py = 0; py < h; py += 2) {
      const n = fbm(px/w*5, py/h*2.5, 4)
      const b = Math.floor(n * 60)
      ctx.fillStyle = `rgba(${Math.floor(n*35)},${Math.floor(n*10)},${b},0.9)`
      ctx.fillRect(px, py, 2, 2)
    }
  }

  // Hexagonal grid
  const hexR = isLowEnd ? 28 : 22
  const dx = hexR * Math.sqrt(3)
  const dy = hexR * 1.5

  ctx.save()
  for (let row = -1; row < h/dy+2; row++) {
    for (let col = -1; col < w/dx+2; col++) {
      const cx = col*dx + (row%2===0?0:dx/2)
      const cy = row*dy
      const energy = hash(col, row)
      const isHot  = energy > 0.82

      // Hex stroke
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI/3)*i - Math.PI/6
        const x = cx + hexR*Math.cos(ang)
        const y = cy + hexR*Math.sin(ang)
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
      }
      ctx.closePath()
      ctx.strokeStyle = isHot ? '#e879f9' : '#7c3aed'
      ctx.lineWidth   = isHot ? 1.2 : 0.5
      ctx.globalAlpha = isHot ? 0.8 : 0.22
      ctx.shadowColor = isHot ? '#e879f9' : '#9333ea'
      ctx.shadowBlur  = isHot ? 12 : 3
      ctx.stroke()

      // Hot hex fill glow
      if (isHot) {
        const hg = ctx.createRadialGradient(cx,cy,0,cx,cy,hexR*0.9)
        hg.addColorStop(0, 'rgba(232,121,249,0.22)')
        hg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = hg; ctx.globalAlpha = 1; ctx.fill()
      }

      // Node dot at vertex intersections
      if (energy > 0.6) {
        glowCircle(ctx, cx, cy, isHot?4:2.5, isHot?'#f0abfc':'#a855f7', isHot?0.9:0.45)
      }
    }
  }
  ctx.restore()

  // Floating energy arcs between hot nodes
  const hotNodes = []
  for (let row = 0; row < h/dy+1; row++) {
    for (let col = 0; col < w/dx+1; col++) {
      if (hash(col,row) > 0.88) {
        hotNodes.push({ x: col*dx+(row%2===0?0:dx/2), y: row*dy })
      }
    }
  }
  hotNodes.slice(0, isLowEnd?8:16).forEach((a,i) => {
    const b = hotNodes[(i+3) % hotNodes.length]
    if (!b) return
    glowLine(ctx, a.x, a.y, b.x, b.y, '#c084fc', 0.7, 0.35, 8)
  })

  // Limb glow
  const atm = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.7)
  atm.addColorStop(0,'rgba(168,85,247,0)')
  atm.addColorStop(0.8,'rgba(168,85,247,0)')
  atm.addColorStop(1,'rgba(168,85,247,0.22)')
  ctx.fillStyle = atm; ctx.fillRect(0,0,w,h)

  return canvas
}

// ─── 3. EXPERIENCE — Volcanic Lava World ─────────────────────────────────────
// Molten crust with glowing lava veins — procedural crack network
export function createExperienceTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  fill(ctx, w, h, '#0a0100')

  // Rocky terrain base via FBM
  for (let px = 0; px < w; px += (isLowEnd?2:1)) {
    for (let py = 0; py < h; py += (isLowEnd?2:1)) {
      const n = fbm(px/w*6, py/h*3, 5)
      const r = Math.floor(18 + n*55)
      const g = Math.floor(5  + n*18)
      ctx.fillStyle = `rgba(${r},${g},2,0.95)`
      ctx.fillRect(px, py, isLowEnd?2:1, isLowEnd?2:1)
    }
  }

  // Lava crack veins — Voronoi-style cell boundaries
  const cells = Array.from({ length: isLowEnd?18:32 }, (_,i) => ({
    x: hash(i,7) * w, y: hash(i,13) * h
  }))

  for (let px = 0; px < w; px += 2) {
    for (let py = 0; py < h; py += 2) {
      // Find 2 nearest cells
      let d1=1e9, d2=1e9
      cells.forEach(c => {
        const d = Math.hypot(px-c.x, py-c.y)
        if (d < d1) { d2=d1; d1=d } else if (d < d2) { d2=d }
      })
      // Boundary = where d2-d1 is small
      const edge = d2 - d1
      if (edge < 6) {
        const brightness = Math.max(0, 1 - edge/6)
        const heat = brightness * brightness
        const r = Math.floor(255 * heat)
        const g = Math.floor(100 * heat * heat)
        ctx.save()
        ctx.globalAlpha = heat * 0.9
        ctx.shadowColor = `rgb(${r},${g},0)`
        ctx.shadowBlur  = 8 * heat
        ctx.fillStyle   = `rgb(${r},${g},0)`
        ctx.fillRect(px, py, 2, 2)
        ctx.restore()
      }
    }
  }

  // Hot lava pools at some cell centers
  cells.slice(0, isLowEnd?6:12).forEach((c, i) => {
    if (hash(i,99) > 0.5) return
    const r = 5 + hash(i,77)*22
    const pg = ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,r)
    pg.addColorStop(0, 'rgba(255,240,60,0.9)')
    pg.addColorStop(0.3,'rgba(255,120,0,0.7)')
    pg.addColorStop(0.7,'rgba(200,30,0,0.3)')
    pg.addColorStop(1,  'rgba(0,0,0,0)')
    ctx.save(); ctx.fillStyle=pg; ctx.fillRect(0,0,w,h); ctx.restore()
  })

  // Limb glow — deep red-orange
  const atm = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.7)
  atm.addColorStop(0,'rgba(255,80,0,0)')
  atm.addColorStop(0.8,'rgba(255,80,0,0)')
  atm.addColorStop(1,'rgba(255,80,0,0.2)')
  ctx.fillStyle=atm; ctx.fillRect(0,0,w,h)

  return canvas
}

// ─── 4. PROJECTS — Bioluminescent Cyber Planet ───────────────────────────────
// Dark surface with glowing circuit-vein network — emerald green energy
export function createProjectsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  fill(ctx, w, h, '#000800')

  // Dark terrain noise
  for (let px = 0; px < w; px += (isLowEnd?2:1)) {
    for (let py = 0; py < h; py += (isLowEnd?2:1)) {
      const n = fbm(px/w*5, py/h*2.5, 4)
      const g = Math.floor(8 + n*30)
      ctx.fillStyle = `rgba(0,${g},${Math.floor(n*8)},0.95)`
      ctx.fillRect(px, py, isLowEnd?2:1, isLowEnd?2:1)
    }
  }

  // Circuit vein network — Voronoi boundaries again, green this time
  const cells = Array.from({ length: isLowEnd?22:40 }, (_,i) => ({
    x: hash(i,3)*w, y: hash(i,9)*h
  }))

  for (let px = 0; px < w; px += 2) {
    for (let py = 0; py < h; py += 2) {
      let d1=1e9, d2=1e9
      cells.forEach(c => {
        const d = Math.hypot(px-c.x, py-c.y)
        if (d<d1){d2=d1;d1=d} else if(d<d2)d2=d
      })
      const edge = d2-d1
      if (edge < 5) {
        const b = Math.max(0,1-edge/5)
        const intensity = b*b
        ctx.save()
        ctx.globalAlpha = intensity * 0.85
        ctx.shadowColor = '#00ff88'
        ctx.shadowBlur  = 10*intensity
        ctx.fillStyle   = `rgba(0,${Math.floor(180+intensity*75)},${Math.floor(intensity*80)},1)`
        ctx.fillRect(px, py, 2, 2)
        ctx.restore()
      }
    }
  }

  // Bright node dots at cell centers
  cells.slice(0, isLowEnd?8:18).forEach((c,i) => {
    const energy = hash(i,55)
    if (energy < 0.4) return
    glowCircle(ctx, c.x, c.y, 3+energy*6, '#00ff88', energy*0.8)
  })

  // Scanning latitude lines (subtle)
  for (let py = 0; py < h; py += (isLowEnd?24:16)) {
    const a = 0.04 + hash(0,py)*0.06
    glowLine(ctx, 0, py, w, py, '#00cc66', 0.5, a, 3)
  }

  // Limb glow
  const atm = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.7)
  atm.addColorStop(0,'rgba(0,200,80,0)')
  atm.addColorStop(0.8,'rgba(0,200,80,0)')
  atm.addColorStop(1,'rgba(0,200,80,0.2)')
  ctx.fillStyle=atm; ctx.fillRect(0,0,w,h)

  return canvas
}

// ─── 5. CONTACT — Ice Crystal World ──────────────────────────────────────────
// Glacial surface with angular crystal facets and aurora streaks
export function createContactTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  fill(ctx, w, h, '#000811')

  // Ice base — layered blue-white noise
  for (let px = 0; px < w; px += (isLowEnd?2:1)) {
    for (let py = 0; py < h; py += (isLowEnd?2:1)) {
      const n  = fbm(px/w*5, py/h*2.5, 5)
      const n2 = fbm(px/w*12+5, py/h*6+3, 3)
      const t  = n * 0.7 + n2 * 0.3
      const r  = Math.floor(20  + t*60)
      const g  = Math.floor(60  + t*130)
      const b  = Math.floor(110 + t*145)
      ctx.fillStyle = `rgba(${r},${g},${b},0.92)`
      ctx.fillRect(px, py, isLowEnd?2:1, isLowEnd?2:1)
    }
  }

  // Crystal facet boundaries — Voronoi with icy blue glow
  const cells = Array.from({ length: isLowEnd?20:38 }, (_,i) => ({
    x: hash(i,5)*w, y: hash(i,11)*h
  }))

  for (let px = 0; px < w; px += 2) {
    for (let py = 0; py < h; py += 2) {
      let d1=1e9, d2=1e9
      cells.forEach(c => {
        const d = Math.hypot(px-c.x,py-c.y)
        if(d<d1){d2=d1;d1=d} else if(d<d2)d2=d
      })
      const edge = d2-d1
      if (edge < 5) {
        const b2 = Math.max(0,1-edge/5)
        const intensity = b2*b2
        ctx.save()
        ctx.globalAlpha = intensity*0.9
        ctx.shadowColor='#a0d4ff'; ctx.shadowBlur=8*intensity
        ctx.fillStyle=`rgba(${Math.floor(140+intensity*115)},${Math.floor(200+intensity*55)},255,1)`
        ctx.fillRect(px,py,2,2)
        ctx.restore()
      }
    }
  }

  // Aurora streaks (horizontal blurred bands)
  const auroraColors = ['rgba(100,220,200,','rgba(80,140,255,','rgba(160,80,255,']
  for (let i = 0; i < (isLowEnd?4:8); i++) {
    const ay = hash(i,44)*h
    const col = auroraColors[i % auroraColors.length]
    const ag = ctx.createLinearGradient(0,ay-20,0,ay+20)
    ag.addColorStop(0,col+'0)')
    ag.addColorStop(0.5,col+`${0.08+hash(i,55)*0.1})`)
    ag.addColorStop(1,col+'0)')
    ctx.fillStyle=ag; ctx.fillRect(0,ay-20,w,40)
  }

  // Polar ice cap glow
  const topG = ctx.createLinearGradient(0,0,0,h*0.18)
  topG.addColorStop(0,'rgba(210,240,255,0.9)')
  topG.addColorStop(1,'rgba(210,240,255,0)')
  ctx.fillStyle=topG; ctx.fillRect(0,0,w,h*0.18)

  const botG = ctx.createLinearGradient(0,h*0.82,0,h)
  botG.addColorStop(0,'rgba(210,240,255,0)')
  botG.addColorStop(1,'rgba(210,240,255,0.85)')
  ctx.fillStyle=botG; ctx.fillRect(0,h*0.82,w,h*0.18)

  // Limb glow
  const atm = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.7)
  atm.addColorStop(0,'rgba(100,180,255,0)')
  atm.addColorStop(0.8,'rgba(100,180,255,0)')
  atm.addColorStop(1,'rgba(100,180,255,0.22)')
  ctx.fillStyle=atm; ctx.fillRect(0,0,w,h)

  return canvas
}

// ─── 6. CLOUDS (About planet cloud alpha layer) ───────────────────────────────
export function createCloudsTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000000'; ctx.fillRect(0,0,w,h)

  // FBM-based cloud alpha
  for (let px = 0; px < w; px += 2) {
    for (let py = 0; py < h; py += 2) {
      const n = fbm(px/w*4+10, py/h*2+10, 4)
      const a = n > 0.58 ? Math.min((n-0.58)/0.22, 1) : 0
      if (a > 0) {
        ctx.fillStyle = `rgba(255,255,255,${a*0.75})`
        ctx.fillRect(px, py, 2, 2)
      }
    }
  }
  return canvas
}

// ─── 7. RINGS (Skills Saturn rings) ──────────────────────────────────────────
export function createRingsTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0,0,size,size)
  const cx=size/2, cy=size/2

  for (let r = 90; r < 230; r++) {
    const t = (r-90)/(230-90)
    // Noise in ring density
    const density = 0.5 + Math.sin(t*Math.PI*12)*0.3 + Math.sin(t*Math.PI*31)*0.15
    const fade = t>0.9?(1-t)/0.1:t<0.06?t/0.06:1
    const gap  = t>0.42&&t<0.48?0.05:1
    const red  = Math.floor(168+Math.sin(t*Math.PI*4)*24)
    const grn  = Math.floor(85 +Math.cos(t*Math.PI*3)*20)
    ctx.strokeStyle = `rgba(${red},${grn},255,${density*fade*gap*0.6})`
    ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke()
  }
  return canvas
}

// ─── 8. STAR (Solar plasma boiling core) ─────────────────────────────────────
export function createStarTexture() {
  const { w, h } = getRes()
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Radial base: white-hot → orange → dark red
  const base = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,h/2)
  base.addColorStop(0,    '#fffde8')
  base.addColorStop(0.12, '#ffe060')
  base.addColorStop(0.35, '#ff7800')
  base.addColorStop(0.65, '#cc2800')
  base.addColorStop(0.88, '#6a0a00')
  base.addColorStop(1,    '#180300')
  ctx.fillStyle = base; ctx.fillRect(0,0,w,h)

  // FBM plasma turbulence overlay
  for (let px = 0; px < w; px += 2) {
    for (let py = 0; py < h; py += 2) {
      const n = fbm(px/w*8, py/h*4, 5)
      const hot = n > 0.62
      if (hot) {
        const t = (n-0.62)/0.38
        ctx.save()
        ctx.globalAlpha = t * 0.3
        ctx.fillStyle = `rgba(255,${Math.floor(200+t*55)},${Math.floor(t*80)},1)`
        ctx.fillRect(px,py,2,2)
        ctx.restore()
      }
    }
  }

  // Convection current lines
  ctx.save()
  for (let i = 0; i < (isLowEnd?18:38); i++) {
    const ly = hash(i,1)*h
    ctx.strokeStyle=`rgba(255,${150+Math.floor(hash(i,2)*105)},20,${0.06+hash(i,3)*0.14})`
    ctx.lineWidth = 0.8 + hash(i,4)*2.2
    ctx.beginPath(); ctx.moveTo(0,ly)
    for (let x=0; x<=w; x+=14) ctx.lineTo(x, ly+(hash(x,i)-0.5)*22)
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
  ctx.clearRect(0,0,size,size)
  const cx=size/2, cy=size/2
  ;[{r:64,a:0.30},{r:50,a:0.38},{r:36,a:0.46},{r:22,a:0.55},{r:10,a:0.68}].forEach(({r,a})=>{
    const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r)
    g.addColorStop(0,`rgba(255,255,255,${a})`)
    g.addColorStop(0.35,`rgba(255,255,255,${a*0.5})`)
    g.addColorStop(0.7,`rgba(255,255,255,${a*0.15})`)
    g.addColorStop(1,'rgba(255,255,255,0)')
    ctx.fillStyle=g; ctx.fillRect(0,0,size,size)
  })
  return canvas
}
