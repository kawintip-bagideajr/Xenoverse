import { useState, useRef, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Universe from './components/Universe'
import PlanetPanel from './components/PlanetPanel'
import HUD from './components/HUD'
import WarpTransition from './components/WarpTransition'
import CustomCursor from './components/CustomCursor'
import { PLANETS } from './data/planets'
import { soundEngine } from './audio/soundEngine'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    soundEngine.init()
    const unlock = () => soundEngine.startAmbient()
    document.addEventListener('pointerdown', unlock, { once: true })
    return () => document.removeEventListener('pointerdown', unlock)
  }, [])
  const [activePlanet, setActivePlanet] = useState(null)
  const [warping, setWarping] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [pendingPlanet, setPendingPlanet] = useState(null)
  const warpTimerRef = useRef(null)

  const handlePlanetClick = (planet) => {
    // Cancel any in-flight warp timer so rapid clicks always work
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current)

    // Close panel immediately if open
    if (panelOpen) setPanelOpen(false)

    // Set pending right away → camera starts animating immediately
    setPendingPlanet(planet)
    setActivePlanet(null)
    setWarping(true)

    warpTimerRef.current = setTimeout(() => {
      setActivePlanet(planet)
      setPanelOpen(true)
      setWarping(false)
      warpTimerRef.current = null
    }, 1400)
  }

  const handleClose = () => {
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current)
    setPanelOpen(false)
    setPendingPlanet(null)
    setTimeout(() => {
      setActivePlanet(null)
      setWarping(false)
    }, 500)
  }

  const handleNextPlanet = () => {
    const idx = PLANETS.findIndex(p => p.id === activePlanet?.id)
    const next = PLANETS[(idx + 1) % PLANETS.length]
    handlePlanetClick(next)
  }

  // Camera always follows pendingPlanet (set immediately on click)
  const cameraTarget = pendingPlanet

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <CustomCursor />
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Universe
            onPlanetClick={handlePlanetClick}
            activePlanet={activePlanet}
            cameraTarget={cameraTarget}
          />
          <HUD activePlanet={activePlanet} onNavClick={handlePlanetClick} />
          {warping && <WarpTransition target={pendingPlanet} />}
          {panelOpen && activePlanet && (
            <PlanetPanel planet={activePlanet} onClose={handleClose} onNext={handleNextPlanet} />
          )}
        </>
      )}
    </div>
  )
}
