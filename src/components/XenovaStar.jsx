import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { panelOpenRef } from '../utils/perf'
import { createStarTexture } from '../utils/proceduralTextures'

// Starburst ray texture — 8 spike rays for lens flare effect
function buildStarburstCanvas() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  const cx = size / 2, cy = size / 2

  // 8 spike rays (alternating long/short)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const isMain = i % 2 === 0
    const len = isMain ? size * 0.49 : size * 0.36
    const hw = isMain ? size * 0.014 : size * 0.008

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)

    const g = ctx.createLinearGradient(0, 0, len, 0)
    g.addColorStop(0,    'rgba(255,255,220,1.0)')
    g.addColorStop(0.04, 'rgba(255,210,80,0.9)')
    g.addColorStop(0.2,  'rgba(255,130,20,0.55)')
    g.addColorStop(0.55, 'rgba(255,60,0,0.18)')
    g.addColorStop(1,    'rgba(0,0,0,0)')

    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(-2, -hw)
    ctx.lineTo(len, 0)
    ctx.lineTo(-2, hw)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Bright core glow
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.22)
  cg.addColorStop(0,   'rgba(255,255,255,1.0)')
  cg.addColorStop(0.15,'rgba(255,240,130,0.95)')
  cg.addColorStop(0.4, 'rgba(255,160,30,0.55)')
  cg.addColorStop(0.75,'rgba(255,60,0,0.15)')
  cg.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.fillStyle = cg; ctx.fillRect(0, 0, size, size)

  return canvas
}

export default function XenovaStar({ config }) {
  const meshRef      = useRef()
  const glowRef      = useRef()
  const coronaRef    = useRef()
  const ring1Ref     = useRef()
  const ring2Ref     = useRef()
  const burst1Ref    = useRef()
  const burst2Ref    = useRef()
  const haloRef      = useRef()
  const lastTimeRef  = useRef(0)

  const starTexture = useMemo(() => {
    const canvas = createStarTexture()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])

  const starburstTex = useMemo(() => {
    const tex = new THREE.CanvasTexture(buildStarburstCanvas())
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => {
    return () => {
      starTexture.dispose()
      starburstTex.dispose()
    }
  }, [starTexture, starburstTex])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (panelOpenRef.current && t - lastTimeRef.current < 0.2) return
    if (panelOpenRef.current) lastTimeRef.current = t

    // Solar plasma texture scroll
    if (starTexture) {
      starTexture.offset.x = t * 0.008
      starTexture.offset.y = t * 0.004
    }

    // Core rotation
    if (meshRef.current) meshRef.current.rotation.y = t * 0.06

    // Inner halo pulse
    if (glowRef.current) {
      const s = 1.28 + Math.sin(t * 1.4) * 0.05
      glowRef.current.scale.setScalar(s)
      glowRef.current.material.opacity = 0.45 + Math.sin(t * 2.0) * 0.06
    }

    // Outer corona slow pulse
    if (coronaRef.current) {
      coronaRef.current.rotation.z = t * 0.025
      coronaRef.current.rotation.x = t * 0.012
      const s = 2.6 + Math.sin(t * 0.8) * 0.12
      coronaRef.current.scale.setScalar(s)
      coronaRef.current.material.opacity = 0.12 + Math.sin(t * 1.2) * 0.04
    }

    // Far halo breathe
    if (haloRef.current) {
      const s = 4.5 + Math.sin(t * 0.5) * 0.3
      haloRef.current.scale.setScalar(s)
      haloRef.current.material.opacity = 0.055 + Math.sin(t * 0.7) * 0.02
    }

    // Starburst rays slow rotation + pulse
    if (burst1Ref.current) {
      burst1Ref.current.material.rotation = t * 0.04
      burst1Ref.current.material.opacity  = 0.55 + Math.sin(t * 1.8) * 0.1
    }
    if (burst2Ref.current) {
      burst2Ref.current.material.rotation = -t * 0.025 + Math.PI / 8
      burst2Ref.current.material.opacity  = 0.28 + Math.sin(t * 1.3 + 1) * 0.08
    }

    // Dyson rings
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
      {/* 1. Solar Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.size, 64, 32]} />
        <meshStandardMaterial
          map={starTexture}
          emissiveMap={starTexture}
          emissive={new THREE.Color('#ff8c00')}
          emissiveIntensity={1.8}
          roughness={0.5}
          metalness={0.0}
        />
      </mesh>

      {/* 2. Starburst ray sprites — main spike effect */}
      <sprite ref={burst1Ref} scale={[config.size * 16, config.size * 16, 1]}>
        <spriteMaterial
          map={starburstTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.55}
        />
      </sprite>

      {/* 2b. Second starburst (offset 22.5°, slightly smaller, orange tint) */}
      <sprite ref={burst2Ref} scale={[config.size * 11, config.size * 11, 1]}>
        <spriteMaterial
          map={starburstTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color="#ffaa00"
          opacity={0.3}
        />
      </sprite>

      {/* 3. Inner glow halo — tight bright pulse */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial
          color="#ffcc44"
          transparent
          opacity={0.48}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Mid corona warm layer */}
      <mesh scale={1.9}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Outer pulsing corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[config.size, 24, 24]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 6. Far ambient halo — deep orange nebula bloom */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[config.size, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 7. Dyson Reactor rings */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[config.size * 1.25, config.size * 1.29, 64]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.55}
          blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[config.size * 1.48, config.size * 1.52, 64]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.32}
          blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* 8. Lighting */}
      <pointLight color="#ff8800" intensity={8.0}  distance={90}  decay={1.3} />
      <pointLight color="#ffcc00" intensity={3.5}  distance={50}  decay={1.6} />
      <pointLight color="#ffffff" intensity={1.8}  distance={22}  decay={2.0} />
    </group>
  )
}
