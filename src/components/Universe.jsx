import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import SolarSystem from './SolarSystem'
import NebulaEffect from './NebulaEffect'
import Spaceship from './Spaceship'
import { isLowEnd, maxDPR } from '../utils/perf'

const ORIGIN   = new THREE.Vector3(0, 0, 0)
const CAM_ELEV = 3.5   // camera height — low & cinematic
const CAM_PAD  = 8.5    // closer zoom to showcase details

function CameraRig({ cameraTarget, planetPositionsRef }) {
  const { camera } = useThree()
  const controlsRef  = useRef()
  const trackedIdRef = useRef(null)
  const isAnimRef    = useRef(false)
  const frameRef     = useRef(0)
  const planetPosRef = useRef(new THREE.Vector3())
  const targetCamRef = useRef(new THREE.Vector3(0, 11, 28))

  useFrame(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return

    /* ── Active target ── */
    if (cameraTarget) {
      const raw = planetPositionsRef.current[cameraTarget.id]
      if (raw) {
        planetPosRef.current.set(raw.x, 0, raw.z)

        // Camera sits BEYOND the planet (outside orbit), looking back toward star.
        // This puts the planet in the foreground with the star as background
        // — exactly the character-select showcase angle.
        const pLen = Math.sqrt(raw.x * raw.x + raw.z * raw.z) || 1
        targetCamRef.current.set(
          raw.x + (raw.x / pLen) * CAM_PAD,
          CAM_ELEV,
          raw.z + (raw.z / pLen) * CAM_PAD
        )
      }

      // New planet selected → restart animation
      if (trackedIdRef.current !== cameraTarget.id) {
        trackedIdRef.current = cameraTarget.id
        isAnimRef.current    = true
        frameRef.current     = 0
        ctrl.enabled         = false
        ctrl.autoRotate      = false
      }

      if (isAnimRef.current) {
        // Fly the camera to the showcase position.
        // lerp works from ANY starting position — smooth even when clicking rapidly.
        camera.position.lerp(targetCamRef.current, 0.07)
        camera.lookAt(planetPosRef.current)
        // (don't call ctrl.update while disabled — drei skips it, preserving our position)

        frameRef.current++
        const dist = camera.position.distanceTo(targetCamRef.current)
        if (dist < 1.2 || frameRef.current >= 72) {
          // Hand back to OrbitControls, now orbiting around the planet
          isAnimRef.current = false
          ctrl.target.copy(planetPosRef.current)
          ctrl.enabled = true
          // drei syncs on next frame — no manual ctrl.update() needed
        }
      } else {
        // Phase 2: controls are live — gently keep target on the moving planet
        ctrl.target.lerp(planetPosRef.current, 0.035)
      }

    /* ── No target → free orbit ── */
    } else {
      if (trackedIdRef.current !== null) {
        trackedIdRef.current = null
        isAnimRef.current    = false
        ctrl.enabled         = true
        ctrl.autoRotate      = true
      }
      ctrl.target.lerp(ORIGIN, 0.025)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={6}
      maxDistance={55}
      maxPolarAngle={Math.PI * 0.85}
      minPolarAngle={0.05}
      autoRotate
      autoRotateSpeed={0.15}
      enableDamping
      dampingFactor={0.08}
    />
  )
}

export default function Universe({ onPlanetClick, activePlanet, cameraTarget }) {
  const planetPositionsRef = useRef({})

  return (
    <div className="absolute inset-0" style={{ pointerEvents: activePlanet ? 'none' : 'auto' }}>
      <Canvas
        camera={{ position: [0, 12, 28], fov: 52 }}
        gl={{ antialias: !isLowEnd, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, maxDPR]}
        performance={{ min: 0.5 }}
        style={{ background: '#000005' }}
      >
        <ambientLight intensity={0.15} color="#8888bb" />
        <pointLight position={[0, 5, 0]} intensity={2.0} color="#60a5fa" distance={50} decay={1.8} />
        {/* Very faint grid */}
        <gridHelper args={[140, 48, '#0a1628', '#0a1628']} position={[0, -4.5, 0]}>
          <lineBasicMaterial transparent opacity={0.06} color="#1e3a5f" depthWrite={false} />
        </gridHelper>

        <Suspense fallback={null}>
          <Stars radius={250} depth={80} count={4000} factor={5} saturation={0.8} fade speed={0.15} />
          <NebulaEffect />
          <SolarSystem
            onPlanetClick={onPlanetClick}
            activePlanet={activePlanet}
            planetPositionsRef={planetPositionsRef}
          />
          <Spaceship />
        </Suspense>

        <CameraRig cameraTarget={cameraTarget} planetPositionsRef={planetPositionsRef} />
      </Canvas>
    </div>
  )
}
