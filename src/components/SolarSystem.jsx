import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANETS, STAR_CONFIG } from '../data/planets'
import Planet from './Planet'
import XenovaStar from './XenovaStar'
import { isLowEnd } from '../utils/perf'

function OrbitRing({ radius }) {
  const pointsRef = useRef()
  const count = isLowEnd ? 90 : 160

  // 1. Concentric particle telemetry track
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      pos[i * 3] = Math.cos(a) * radius
      pos[i * 3 + 1] = 0
      pos[i * 3 + 2] = Math.sin(a) * radius
    }
    return [pos]
  }, [radius, count])

  // Alternate rotation direction for adjacent tracks (contra-rotating gears)
  const rotationDirection = useMemo(() => {
    return (Math.floor(radius * 10) % 2 === 0 ? 1 : -1) * 0.04
  }, [radius])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * rotationDirection
    }
  })

  return (
    <group>
      {/* Holographic glowing points track */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={isLowEnd ? 0.04 : 0.06}
          color="#ffffff"
          transparent
          opacity={0.1}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Faint solid ring underlay for tracking outline */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.01, radius + 0.01, isLowEnd ? 64 : 128]} />
        <meshBasicMaterial
          color="#cccccc"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function SolarSystem({ onPlanetClick, activePlanet, planetPositionsRef }) {
  const groupRef = useRef()

  return (
    <group ref={groupRef}>
      <XenovaStar config={STAR_CONFIG} />

      {PLANETS.map((planet) => (
        <group key={planet.id}>
          <OrbitRing radius={planet.orbitRadius} />
          <Planet
            data={planet}
            onClick={() => onPlanetClick(planet)}
            isActive={activePlanet?.id === planet.id}
            planetPositionsRef={planetPositionsRef}
          />
        </group>
      ))}
    </group>
  )
}
