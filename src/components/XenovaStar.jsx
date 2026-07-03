import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { panelOpenRef } from '../utils/perf'
import { createStarTexture } from '../utils/proceduralTextures'

export default function XenovaStar({ config }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const coronaRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const lastTimeRef = useRef(0)

  // ── Procedural Solar Plasma Texture (Hologram lines) ───────────
  const starTexture = useMemo(() => {
    const canvas = createStarTexture()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      starTexture.dispose()
    }
  }, [starTexture])

  // ── Animation Loop ─────────────────────────────────────────────
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (panelOpenRef.current && t - lastTimeRef.current < 0.2) return
    if (panelOpenRef.current) lastTimeRef.current = t

    // 1. Churning solar hologram lines coordinates
    if (starTexture) {
      starTexture.offset.x = t * 0.008
      starTexture.offset.y = t * 0.004
    }

    // 2. Solar core rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.06
    }

    // 3. Inner pulsing core glow
    if (glowRef.current) {
      const s = 1.12 + Math.sin(t * 1.5) * 0.02
      glowRef.current.scale.setScalar(s)
      glowRef.current.material.opacity = 0.16 + Math.sin(t * 2.0) * 0.02
    }

    // 4. Outer corona wireframe
    if (coronaRef.current) {
      coronaRef.current.rotation.z = t * 0.03
      coronaRef.current.rotation.x = t * 0.015
      coronaRef.current.material.opacity = 0.03 + Math.sin(t * 1.5) * 0.01
    }

    // 5. Dyson Reactor rings rotation (Dials)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.1
      ring1Ref.current.rotation.y = t * 0.2
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.15
      ring2Ref.current.rotation.z = t * 0.25
    }
  })



  return (
    <group>
      {/* 1. Boiling Solar Core - solid, textured, hot burning */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.size, 64, 32]} />
        <meshStandardMaterial
          map={starTexture}
          emissive={new THREE.Color('#ff6a00')}
          emissiveIntensity={1.2}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Inner Orange Glow Halo */}
      <mesh ref={glowRef} scale={1.25}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial
          color="#ff6a00"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Corona - warm yellow-orange pulsing */}
      <mesh ref={coronaRef} scale={1.85}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial
          color="#ffa500"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Dyson Reactor containment rings (Holographic Gyro Dials) */}
      {/* Inner Ring */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[config.size * 1.25, config.size * 1.28, 64]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Ring */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[config.size * 1.45, config.size * 1.48, 64]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Warm dual-tone radial lighting — sun illuminates planets with warm glow */}
      <pointLight color="#ff6a00" intensity={3.5} distance={60} decay={1.6} />
      <pointLight color="#ffa500" intensity={1.2} distance={30} decay={2.0} />
    </group>
  )
}
