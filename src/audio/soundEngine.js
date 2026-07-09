// Procedural sci-fi sound engine — no audio files needed

class SoundEngine {
  constructor() {
    this.ctx      = null
    this.master   = null
    this.muted    = false
    this._ambient = null
  }

  // ── Bootstrap ──────────────────────────────────────────────────
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.45
      this.master.connect(this.ctx.destination)
      if (this.ctx.state === 'suspended') this.ctx.resume()
    } catch { /* unsupported */ }
  }

  // ── Internal helpers ───────────────────────────────────────────
  _ok() {
    if (this.muted || !this.ctx) return false
    if (this.ctx.state !== 'running') { this.ctx.resume().catch(() => {}); return false }
    return true
  }

  _g(v = 1) {
    const g = this.ctx.createGain()
    g.gain.value = v
    g.connect(this.master)
    return g
  }

  _osc(type, freq) {
    const o = this.ctx.createOscillator()
    o.type = type
    o.frequency.value = freq
    return o
  }

  // One-shot oscillator tone with exponential decay
  _tone(freq, startT, dur, vol, type = 'sine', freqEnd = null) {
    const g = this._g(0)
    const o = this._osc(type, freq)
    o.connect(g)
    g.gain.setValueAtTime(vol, startT)
    g.gain.exponentialRampToValueAtTime(0.001, startT + dur)
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, startT + dur)
    o.start(startT)
    o.stop(startT + dur + 0.01)
  }

  // Filtered noise burst
  _noise(startT, dur, vol, bpFreq = 2500, q = 1) {
    const size  = Math.floor(this.ctx.sampleRate * dur)
    const buf   = this.ctx.createBuffer(1, size, this.ctx.sampleRate)
    const data  = buf.getChannelData(0)
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = bpFreq; f.Q.value = q
    const g = this._g(0)
    src.connect(f); f.connect(g)
    g.gain.setValueAtTime(vol, startT)
    g.gain.exponentialRampToValueAtTime(0.001, startT + dur)
    src.start(startT); src.stop(startT + dur + 0.01)
  }

  // ── Public sounds ──────────────────────────────────────────────

  planetHover() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    this._tone(1100, t, 0.07, 0.06, 'sine')
  }

  planetClick() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    // Dramatic sweep down
    this._tone(1800, t, 0.45, 0.22, 'sine', 220)
    // White noise sizzle at start
    this._noise(t, 0.18, 0.14, 3000, 0.8)
    // Deep impact thump
    this._tone(120, t + 0.12, 0.3, 0.18, 'sine', 40)
    // Confirmation ping
    this._tone(880, t + 0.3, 0.25, 0.1, 'sine')
  }

  uiClick() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    this._tone(900,  t,        0.08, 0.12, 'sine')
    this._tone(1350, t + 0.05, 0.07, 0.09, 'sine')
  }

  panelOpen() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    // Rising sweep
    this._tone(350, t, 0.22, 0.16, 'sine', 950)
    // Noise rush
    this._noise(t, 0.12, 0.08, 4000, 1.5)
    // Settle ping
    this._tone(1200, t + 0.2, 0.18, 0.1, 'sine')
  }

  panelClose() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    this._tone(800, t, 0.2, 0.12, 'sine', 280)
    this._noise(t, 0.1, 0.05, 2000, 1)
  }

  warp() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    // Big power-down sweep
    this._tone(2200, t, 0.7,  0.2,  'sawtooth', 55)
    // Noise tearing
    this._noise(t, 0.5, 0.18, 1500, 0.5)
    // Sub thump
    this._tone(80,  t + 0.1, 0.5, 0.22, 'sine', 35)
    // Re-emerge
    this._tone(90,  t + 0.85, 0.55, 0.001, 'sine', 700)
    const g = this._g(0)
    const o = this._osc('sine', 90)
    o.frequency.exponentialRampToValueAtTime(700, t + 1.4)
    o.connect(g)
    g.gain.setValueAtTime(0.001, t + 0.85)
    g.gain.linearRampToValueAtTime(0.14, t + 1.1)
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5)
    o.start(t + 0.85); o.stop(t + 1.5)
  }

  bootBeep(index) {
    if (!this._ok()) return
    // Musical scale: C D E F G A B C (MIDI note frequencies)
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319]
    const t = this.ctx.currentTime
    const freq = notes[index % notes.length]
    this._tone(freq, t, 0.065, 0.07, 'square')
  }

  nextPlanet() {
    if (!this._ok()) return
    const t = this.ctx.currentTime
    this._tone(600, t, 0.15, 0.12, 'sine', 1000)
    this._noise(t + 0.05, 0.1, 0.06, 3500, 1)
  }

  // ── Synthetic reverb via noise impulse response ────────────────
  _createReverb(duration = 4.5) {
    const rate = this.ctx.sampleRate
    const len  = Math.floor(rate * duration)
    const buf  = this.ctx.createBuffer(2, len, rate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2)
    }
    const conv = this.ctx.createConvolver()
    conv.buffer = buf
    return conv
  }

  // ── Cinematic space ambient ────────────────────────────────────
  startAmbient() {
    if (!this.ctx || this._ambient) return
    const t = this.ctx.currentTime

    // Master out with slow fade-in
    const out = this.ctx.createGain()
    out.gain.setValueAtTime(0, t)
    out.gain.linearRampToValueAtTime(this.muted ? 0 : 0.45, t + 3)
    out.connect(this.master)

    // Reverb bus
    const reverb = this._createReverb(4.5)
    const rvbOut = this.ctx.createGain(); rvbOut.gain.value = 0.75
    reverb.connect(rvbOut); rvbOut.connect(out)

    const nodes = []

    // ── Sub bass A1 (55 Hz) – dry only, LFO breathing ──
    const sub = this._osc('sine', 55)
    const subG = this.ctx.createGain(); subG.gain.value = 0.8
    sub.connect(subG); subG.connect(out)
    const subLFO = this._osc('sine', 0.055)
    const subLFOG = this.ctx.createGain(); subLFOG.gain.value = 2.5
    subLFO.connect(subLFOG); subLFOG.connect(sub.frequency)
    sub.start(); subLFO.start()
    nodes.push(sub, subLFO)

    // ── Pad – A minor add9 voicing (A2 C3 E3 A3 B3) ──
    // Lowpass filter sweeps open slowly for cinematic reveal
    const padFilter = this.ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.setValueAtTime(260, t)
    padFilter.frequency.linearRampToValueAtTime(2400, t + 28)
    padFilter.Q.value = 1.2
    const padDry = this.ctx.createGain(); padDry.gain.value = 0.42
    const padWet = this.ctx.createGain(); padWet.gain.value = 0.58
    padFilter.connect(padDry); padDry.connect(out)
    padFilter.connect(padWet); padWet.connect(reverb)

    ;[
      [110,   0.55,  0,    0.075],
      [130.8, 0.42, -7,    0.088],
      [164.8, 0.38,  5,    0.095],
      [220,   0.28, -3,    0.070],
      [246.9, 0.18,  8,    0.110],
    ].forEach(([f, v, det, lfoRate]) => {
      const o = this._osc('sine', f)
      o.detune.value = det
      const g = this.ctx.createGain(); g.gain.value = v * 0.85
      const lfo = this._osc('sine', lfoRate)
      const lfoG = this.ctx.createGain(); lfoG.gain.value = v * 0.15
      lfo.connect(lfoG); lfoG.connect(g.gain)
      o.connect(g); g.connect(padFilter)
      o.start(); lfo.start()
      nodes.push(o, lfo)
    })

    // ── Airy high shimmer (wet only) ──
    ;[[880, 0.06, 0], [1108, 0.04, 6], [1320, 0.03, -4]].forEach(([f, v, det], i) => {
      const o = this._osc('sine', f)
      o.detune.value = det
      const g = this.ctx.createGain(); g.gain.value = v
      const lfo = this._osc('sine', 0.10 + i * 0.023)
      const lfoG = this.ctx.createGain(); lfoG.gain.value = v * 0.45
      lfo.connect(lfoG); lfoG.connect(g.gain)
      o.connect(g); g.connect(reverb)
      o.start(); lfo.start()
      nodes.push(o, lfo)
    })

    // ── Bell melody – A minor pentatonic, random, wet only ──
    const bells = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3]
    const playBell = () => {
      if (!this._ambient) return
      const now  = this.ctx.currentTime
      const freq = bells[Math.floor(Math.random() * bells.length)]
      ;[[freq, 0.16, 4.0], [freq * 2.006, 0.06, 2.8]].forEach(([f, v, dur]) => {
        const o = this._osc('sine', f)
        const g = this.ctx.createGain()
        g.gain.setValueAtTime(v, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + dur)
        o.connect(g); g.connect(reverb)
        o.start(now); o.stop(now + dur + 0.1)
      })
      this._bellTimer = setTimeout(playBell, 2800 + Math.random() * 2200)
    }
    this._bellTimer = setTimeout(playBell, 1500)

    this._ambient = { out, nodes }
  }

  _setAmbientVol(v) {
    if (!this._ambient) return
    this._ambient.out.gain.setTargetAtTime(v, this.ctx.currentTime, 0.8)
  }

  setBgmVolume(v) {
    this._bgmVol = v
    if (!this.muted) this._setAmbientVol(v * 0.45)
  }

  // ── Toggle mute ───────────────────────────────────────────────
  toggle() {
    this.muted = !this.muted
    this._setAmbientVol(this.muted ? 0 : (this._bgmVol ?? 1) * 0.45)
    return !this.muted   // true = sound ON
  }

  get enabled() { return !this.muted }
}

export const soundEngine = new SoundEngine()
