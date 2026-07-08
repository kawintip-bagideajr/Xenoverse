import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isLowEnd, panelOpenRef } from '../utils/perf'
import { createNebulaTexture } from '../utils/proceduralTextures'

function NebulaCloud({ position, color, scale, speed, texture }) {
  const spriteRef = useRef()
  const lastTimeRef = useRef(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (panelOpenRef.current && t - lastTimeRef.current < 0.2) return
    if (panelOpenRef.current) lastTimeRef.current = t
    if (spriteRef.current) {
      spriteRef.current.material.rotation = t * speed
      // Gentle breathing effect for the gaseous clouds
      spriteRef.current.material.opacity = (isLowEnd ? 0.14 : 0.26) + Math.sin(t * 0.35 + position[0]) * 0.06
    }
  })

  return (
    <sprite ref={spriteRef} position={position} scale={scale}>
      <spriteMaterial
        map={texture}
        color={new THREE.Color(color)}
        transparent
        opacity={0.26}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  )
}

function StarDust() {
  const pointsRef = useRef()
  const { positions, colors } = useMemo(() => {
    const count = isLowEnd ? 1200 : 2800
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const cyanColor = new THREE.Color('#7dd3fc')
    const whiteColor = new THREE.Color('#ffffff')
    const purpleColor = new THREE.Color('#c084fc')
    const blueColor = new THREE.Color('#60a5fa')

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 25 + Math.random() * 85
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.25 // keep dust relatively flat for disc galaxy feel
      positions[i * 3 + 2] = r * Math.cos(phi)

      const pick = Math.random()
      const c = pick < 0.35 ? cyanColor : pick < 0.6 ? purpleColor : pick < 0.8 ? blueColor : whiteColor
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }, [])

  const lastTimeRef = useRef(0)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (panelOpenRef.current && t - lastTimeRef.current < 0.2) return
    if (panelOpenRef.current) lastTimeRef.current = t
    if (pointsRef.current) pointsRef.current.rotation.y = t * 0.008
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={isLowEnd ? 0.08 : 0.15} vertexColors transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// Vivid deep-space nebula cloud placements — warm orange/red vs cool blue contrast
const CLOUDS = [
  { position: [-42, 6, -72],  color: '#0ea5e9', scale: [72, 48, 1], speed: 0.0022 },   // cool blue
  { position: [52, -12, -52], color: '#ea6a00', scale: [78, 54, 1], speed: -0.0018 },  // warm orange
  { position: [-68, -6, 18],  color: '#9333ea', scale: [62, 42, 1], speed: 0.003 },    // purple
  { position: [28, 22, -85],  color: '#c23000', scale: [85, 58, 1], speed: -0.0012 },  // deep red-orange
  { position: [-18, -22, -55],color: '#1d4ed8', scale: [52, 36, 1], speed: 0.004 },    // deep blue
  { position: [68, 12, -38],  color: '#ff6a00', scale: [62, 44, 1], speed: -0.0020 },  // bright orange
  { position: [-50, 18, -40], color: '#0c4a9f', scale: [56, 38, 1], speed: 0.0015 },   // midnight blue
  { position: [40, -18, -65], color: '#7c3aed', scale: [68, 46, 1], speed: -0.0025 },  // violet
]

export default function NebulaEffect() {
  const nebulaTexture = useMemo(() => {
    const canvas = createNebulaTexture()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nebulaTexture.dispose()
    }
  }, [nebulaTexture])

  return (
    <>
      {CLOUDS.map((c, i) => (
        <NebulaCloud key={i} {...c} texture={nebulaTexture} />
      ))}
      <StarDust />
    </>
  )
}
