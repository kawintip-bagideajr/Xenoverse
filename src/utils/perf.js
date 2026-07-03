const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined
const cpu = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined

export const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua)

// Low-end: mobile OR < 4 GB RAM OR ≤ 4 CPU threads
export const isLowEnd = isMobile
  || (mem !== undefined && mem < 4)
  || (cpu !== undefined && cpu <= 4)

// Pixel ratio: phones with 3× DPI would shade 9× pixels — cap hard at 1
export const maxDPR = isMobile ? 1 : isLowEnd ? 1.5 : 2

// Set to true while PlanetPanel is mounted — Three.js hooks read this to throttle frames
export const panelOpenRef = { current: false }
