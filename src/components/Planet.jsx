import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { soundEngine } from '../audio/soundEngine'
import { isLowEnd, isMobile, panelOpenRef } from '../utils/perf'
import {
  createAboutTexture,
  createSkillsTexture,
  createExperienceTexture,
  createProjectsTexture,
  createContactTexture,
  createCloudsTexture,
  createRingsTexture
} from '../utils/proceduralTextures'

// Fresnel Shader for Atmospheric Scattering Glow
const FRESNEL_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRESNEL_FRAGMENT_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform vec3 color;
  uniform float glowPower;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    // Fresnel calculation: bright at edges, dim in center
    float intensity = pow(1.0 - max(0.0, dot(normal, viewDir)), glowPower);
    gl_FragColor = vec4(color, intensity * 0.95);
  }
`

export default function Planet({ data, onClick, isActive, planetPositionsRef }) {
  const groupRef = useRef()
  const planetRef = useRef()
  const cloudsRef = useRef()
  const ringsRef = useRef()
  const glowRef = useRef()
  const cyberShellRef = useRef()
  const selectionRingRef = useRef()

  const angleRef = useRef(data.startAngle)
  const lastTimeRef = useRef(0)
  const [hovered, setHovered] = useState(false)
  const { gl } = useThree()

  // ── Procedural Textures Generation (Hologram vector maps) ──────────────────
  const planetTexture = useMemo(() => {
    let canvas = null
    if (data.id === 'about') canvas = createAboutTexture()
    else if (data.id === 'skills') canvas = createSkillsTexture()
    else if (data.id === 'experience') canvas = createExperienceTexture()
    else if (data.id === 'projects') canvas = createProjectsTexture()
    else if (data.id === 'contact') canvas = createContactTexture()

    if (!canvas) return null
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [data.id])

  const cloudsTexture = useMemo(() => {
    if (data.id !== 'about') return null
    const canvas = createCloudsTexture()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [data.id])

  const ringsTexture = useMemo(() => {
    if (data.id !== 'skills') return null
    const canvas = createRingsTexture()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [data.id])

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      planetTexture?.dispose()
      cloudsTexture?.dispose()
      ringsTexture?.dispose()
    }
  }, [planetTexture, cloudsTexture, ringsTexture])

  // Custom Shader Uniforms for Fresnel Glow
  const glowUniforms = useMemo(() => ({
    color: { value: new THREE.Color(data.glowColor) },
    glowPower: { value: 3.5 }
  }), [data.glowColor])

  // ── Animation Loop ─────────────────────────────────────────────
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (panelOpenRef.current && t - lastTimeRef.current < 0.2) return
    if (panelOpenRef.current) lastTimeRef.current = t

    // 1. Orbital position
    angleRef.current += data.speed * 0.008
    const x = Math.cos(angleRef.current) * data.orbitRadius
    const z = Math.sin(angleRef.current) * data.orbitRadius

    if (planetPositionsRef?.current) {
      planetPositionsRef.current[data.id] = { x, z }
    }

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z)
    }

    // 2. Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.15
    }

    // 3. Secondary grid shell rotation (About only)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = -t * 0.08
      cloudsRef.current.rotation.x = t * 0.03
    }

    // 4. Cyber Shield rotation (Projects only)
    if (cyberShellRef.current) {
      cyberShellRef.current.rotation.y = -t * 0.2
      cyberShellRef.current.rotation.x = t * 0.06
    }

    // 5. Selection ring pulsing
    if (selectionRingRef.current) {
      selectionRingRef.current.rotation.x = Math.PI / 2
      selectionRingRef.current.material.opacity = (hovered || isActive)
        ? 0.7 + Math.sin(t * 6.0) * 0.18
        : 0
    }

    // 6. Atmospheric Glow sizing (very tight neon rim)
    if (glowRef.current) {
      const scaleBase = 1.05
      const s = scaleBase + Math.sin(t * 3.0 + data.startAngle) * 0.01
      glowRef.current.scale.setScalar(s)
      
      const targetGlowPower = (hovered || isActive) ? 2.8 : 4.8
      glowRef.current.material.uniforms.glowPower.value = THREE.MathUtils.lerp(
        glowRef.current.material.uniforms.glowPower.value,
        targetGlowPower,
        0.1
      )
    }
  })

  // ── Hover handlers ─────────────────────────────────────────────
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    if (!isMobile) gl.domElement.style.cursor = 'pointer'
    soundEngine.planetHover()
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    if (!isMobile) gl.domElement.style.cursor = 'crosshair'
  }

  const color = new THREE.Color(data.color)

  return (
    <group ref={groupRef}>
      
      {/* 1. Core Holographic Planet Mesh */}
      <mesh
        ref={planetRef}
        onClick={(e) => { e.stopPropagation(); soundEngine.planetClick(); onClick(e) }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[data.size, 64, 32]} />
        <meshStandardMaterial
          map={planetTexture}
          roughness={0.5}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={isActive ? 0.9 : hovered ? 0.55 : 0.22}
        />

        {/* Floating Label (Skip on mobile for performance) */}
        {!isMobile && (hovered || isActive) && (
          <Html
            center
            distanceFactor={12}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.95)',
                border: `1px solid ${data.color}`,
                padding: '4px 12px',
                borderRadius: '2px',
                color: data.color,
                fontSize: '10px',
                letterSpacing: '0.28em',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                boxShadow: `0 0 16px ${data.color}35`,
                transform: 'translateY(-35px)',
              }}
            >
              {data.emoji} {data.label.toUpperCase()}
            </div>
          </Html>
        )}
      </mesh>

      {/* 2. Secondary grid outer shell (About planet only) */}
      {data.id === 'about' && cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[data.size * 1.025, 32, 32]} />
          <meshStandardMaterial
            alphaMap={cloudsTexture}
            transparent
            color="#ffffff"
            roughness={1.0}
            metalness={0.0}
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Realistic Rings (Skills planet only) */}
      {data.id === 'skills' && ringsTexture && (
        <mesh ref={ringsRef} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[data.size * 5.4, data.size * 5.4]} />
          <meshBasicMaterial
            map={ringsTexture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 4. Atmosphere haze ring */}
      <mesh>
        <ringGeometry args={[data.size * 1.02, data.size * 1.18, 64]} />
        <meshBasicMaterial
          color={data.glowColor}
          transparent
          opacity={isActive ? 0.28 : hovered ? 0.18 : 0.10}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Fresnel Rim Glow — shines outward from sphere edge */}
      {!isLowEnd && (
        <mesh ref={glowRef} scale={1.18}>
          <sphereGeometry args={[data.size, 32, 32]} />
          <shaderMaterial
            vertexShader={FRESNEL_VERTEX_SHADER}
            fragmentShader={FRESNEL_FRAGMENT_SHADER}
            uniforms={glowUniforms}
            transparent
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 6. Interactive Ring Selector */}
      <mesh ref={selectionRingRef}>
        <ringGeometry args={[data.size * 1.45, data.size * 1.58, 64]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
