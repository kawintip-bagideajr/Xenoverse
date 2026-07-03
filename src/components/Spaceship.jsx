import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { panelOpenRef } from '../utils/perf'

export default function Spaceship() {
  const groupRef = useRef()
  const engineGlowRef = useRef()
  const thrusterRef = useRef()
  const leftLightRef = useRef()
  const rightLightRef = useRef()
  
  const lastTimeRef = useRef(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (panelOpenRef.current && t - lastTimeRef.current < 0.2) return
    if (panelOpenRef.current) lastTimeRef.current = t

    // 1. Slow, floaty ship oscillation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.2 + 1.8
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.04
      groupRef.current.rotation.x = 0.16 + Math.sin(t * 0.25) * 0.01
    }

    // 2. Engine and thruster trail pulses (subtle)
    if (engineGlowRef.current) {
      engineGlowRef.current.material.opacity = 0.5 + Math.sin(t * 8) * 0.1
      const s = 0.9 + Math.sin(t * 10) * 0.08
      engineGlowRef.current.scale.set(s, s, 1)
    }
    if (thrusterRef.current) {
      thrusterRef.current.material.opacity = 0.3 + Math.sin(t * 10) * 0.1
    }

    // 3. Flashing navigation lights on wingtips
    if (leftLightRef.current) {
      leftLightRef.current.material.opacity = (Math.floor(t * 1.5) % 2 === 0) ? 0.8 : 0.1
    }
    if (rightLightRef.current) {
      rightLightRef.current.material.opacity = (Math.floor(t * 1.5) % 2 !== 0) ? 0.8 : 0.1
    }
  })

  return (
    <group
      ref={groupRef}
      position={[4.0, 1.8, 8]}
      rotation={[0.18, -0.6, 0]}
      scale={0.4} // Scaled down significantly to keep it subtle and not steal planet focus
    >
      {/* ── Spaceship Fuselage (Metallic Chrome Hull) ── */}
      <mesh>
        <coneGeometry args={[0.11, 1.1, 6]} />
        <meshStandardMaterial
          color="#1b2a47"
          emissive="#000d1a"
          emissiveIntensity={0.15}
          metalness={0.95}
          roughness={0.25}
        />
      </mesh>

      {/* Cockpit dome */}
      <mesh position={[0, 0.2, 0.02]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00b4d8"
          emissiveIntensity={0.6}
          transparent
          opacity={0.65}
          metalness={0.4}
          roughness={0.1}
        />
      </mesh>

      {/* Wings */}
      {/* Left wing */}
      <mesh position={[-0.32, -0.15, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.4, 0.03, 0.16]} />
        <meshStandardMaterial
          color="#1b2a47"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* Right wing */}
      <mesh position={[0.32, -0.15, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.4, 0.03, 0.16]} />
        <meshStandardMaterial
          color="#1b2a47"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* Tail fin */}
      <mesh position={[0, -0.35, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.25, 4]} />
        <meshStandardMaterial
          color="#1b2a47"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* ── Navigation Lights (Tiny wingtip indicators) ── */}
      {/* Left Wingtip Nav Light (Red) */}
      <mesh ref={leftLightRef} position={[-0.5, -0.22, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.6} />
      </mesh>

      {/* Right Wingtip Nav Light (Green) */}
      <mesh ref={rightLightRef} position={[0.5, -0.22, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#33ff33" transparent opacity={0.6} />
      </mesh>

      {/* ── Engine Glow & Thruster Trail ── */}
      <mesh ref={engineGlowRef} position={[0, -0.52, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} />
      </mesh>

      <mesh ref={thrusterRef} position={[0, -0.7, 0]}>
        <coneGeometry args={[0.05, 0.3, 6]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.25} />
      </mesh>

      {/* Dim point light for engine */}
      <pointLight position={[0, -0.5, 0]} color="#00f5ff" intensity={0.15} distance={1.8} decay={2} />
    </group>
  )
}
