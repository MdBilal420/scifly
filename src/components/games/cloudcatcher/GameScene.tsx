import React, { Suspense, useEffect, useMemo, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { useCloudCatcherStore, generateVapors, VaporParticle } from './useCloudCatcherStore'

const Environment: React.FC = () => (
  <>
    <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
    {/* Ground water body - wider to match vapor spawn area */}
    <mesh position={[0, -3, 0]} receiveShadow>
      <boxGeometry args={[25, 0.5, 10]} />
      <meshStandardMaterial color="#86efac" />
    </mesh>
    {/* Visual indicator for vapor source area */}
    <mesh position={[0, -2.5, 0]} receiveShadow>
      <boxGeometry args={[22, 0.1, 8]} />
      <meshStandardMaterial color="#7dd3fc" transparent opacity={0.3} />
    </mesh>
  </>
)

const Cloud: React.FC = () => {
  const { state } = useCloudCatcherStore()
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((_, dt) => {
    if (!groupRef.current) return
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, state.cloudX, dt * 10)
    // scale from capacity
    const s = 0.8 + state.cloudCapacity * 1.2
    groupRef.current.scale.set(s, s, s)
  })
  
  const cloudColor = state.status === 'rain' ? '#64748b' : '#e5f2ff'
  const emissiveColor = state.status === 'rain' ? '#334155' : '#93c5fd'
  const emissiveIntensity = state.status === 'rain' ? 0.4 : 0.2
  
  return (
    <group ref={groupRef} position={[0, 6, 0]} castShadow>
      {/* Main cloud body - multiple overlapping spheres for fluffy effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[0.8, 0.3, 0.2]}>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[-0.6, 0.4, -0.1]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[0.3, 0.7, -0.3]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[-0.4, 0.6, 0.4]}>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      {/* Top fluffy parts */}
      <mesh position={[0.1, 1.1, 0.1]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[-0.2, 1.2, -0.2]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      {/* Bottom wispy parts */}
      <mesh position={[0.5, -0.8, 0.3]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[-0.7, -0.6, -0.2]}>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      {/* Side extensions for more natural shape */}
      <mesh position={[1.1, 0.1, 0.1]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      
      <mesh position={[-1.0, 0.2, -0.1]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={cloudColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
    </group>
  )
}

const Vapor: React.FC<{ data: VaporParticle }> = ({ data }) => {
  const { state, dispatch } = useCloudCatcherStore()
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (!ref.current || state.status === 'menu') return
    // freeze slows movement
    const speedScale = state.powerFreeze ? 0.4 : 1
    let [vx, vy, vz] = data.velocity
    // apply wind gust sideways push
    if (state.gustActive) {
      const push = state.gustStrength === 'strong' ? 2.2 : 0.9
      vx += state.gustDirection * push
    }
    ref.current.position.x += vx * dt * speedScale
    ref.current.position.y += vy * dt * speedScale
    ref.current.position.z += vz * dt * speedScale
    // wind gust pulls to cloud
    if (state.powerWindGust) {
      const dx = state.cloudX - ref.current.position.x
      ref.current.position.x += dx * 0.6 * dt
    }
    // absorb by cloud
    const cloudY = 6
    if (Math.abs(ref.current.position.x - state.cloudX) < 1.2 && ref.current.position.y >= cloudY - 0.3) {
      dispatch({ type: 'ABSORB_VAPOR', id: data.id })
    }
    // out of bounds
    if (ref.current.position.y > 9) {
      // missed
      ref.current.visible = false
    }
  })
  return (
    <mesh ref={ref} position={data.position} castShadow>
      <sphereGeometry args={[0.15, 12, 12]} />
      <meshStandardMaterial color="#c7e9ff" emissive="#60a5fa" emissiveIntensity={0.3} />
    </mesh>
  )
}

const Rain: React.FC = () => {
  const { state, dispatch } = useCloudCatcherStore()
  const groupRef = useRef<THREE.Group>(null)
  const drops = useMemo(() => new Array(80).fill(0).map(() => ({ x: THREE.MathUtils.randFloatSpread(8), y: 6 + Math.random() * 2, speed: 5 + Math.random() * 3 })), [])
  useFrame((_, dt) => {
    if (!groupRef.current) return
    if (state.status !== 'rain') return
    let allGone = true
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      mesh.position.y -= drops[i].speed * dt
      if (mesh.position.y > -2.5) allGone = false
    })
    if (allGone) {
      dispatch({ type: 'END_RAIN' })
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {drops.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      ))}
    </group>
  )
}

const Controller: React.FC = () => {
  const { state, dispatch } = useCloudCatcherStore()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.status !== 'playing') return
      const step = 0.8
      if (e.code === 'ArrowLeft') dispatch({ type: 'MOVE_CLOUD', dx: -step })
      if (e.code === 'ArrowRight') dispatch({ type: 'MOVE_CLOUD', dx: step })
      if (e.code === 'KeyZ') dispatch({ type: 'ACTIVATE_WIND' })
      if (e.code === 'KeyX') dispatch({ type: 'ACTIVATE_FREEZE' })
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ') dispatch({ type: 'DEACTIVATE_WIND' })
      if (e.code === 'KeyX') dispatch({ type: 'DEACTIVATE_FREEZE' })
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [state.status, dispatch])
  return null
}

const Spawner: React.FC = () => {
  const { state, dispatch } = useCloudCatcherStore()
  const timer = useRef(0)
  const gustTimer = useRef(0)
  const gustInterval = useRef(2 + Math.random())
  // Wind gust sound effect - using Web Audio API for simple whoosh
  const playWhoosh = useCallback(() => {
    try {
      if (typeof AudioContext !== 'undefined') {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3)
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }
    } catch (error) {
      // Silently fail if audio is not supported
      console.log('Audio not supported')
    }
  }, [])
  useFrame((_, dt) => {
    if (state.status !== 'playing') return
    timer.current += dt
    // schedule wind gusts every 2-3 seconds
    gustTimer.current += dt
    if (gustTimer.current >= gustInterval.current) {
      gustTimer.current = 0
      gustInterval.current = 2 + Math.random() * 1
      const dir: -1 | 1 = Math.random() < 0.5 ? -1 : 1
      const strength = Math.random() < 0.35 ? 'strong' : 'light'
      dispatch({ type: 'START_GUST', direction: dir, strength })
      playWhoosh()
      // occasional cloud nudge on strong gusts
      if (strength === 'strong' && Math.random() < 0.6) {
        dispatch({ type: 'NUDGE_CLOUD', dx: dir * 0.6 })
      }
      // end gust after short duration
      setTimeout(() => dispatch({ type: 'END_GUST' }), strength === 'strong' ? 700 : 500)
    }
    // Improved vapor spawning with better pacing
    const baseInterval = Math.max(0.4, 1.2 - state.level * 0.08)
    if (timer.current >= baseInterval) {
      timer.current = 0
      // Spawn 2-4 vapors per interval for better coverage
      const count = 2 + Math.floor(state.level / 3)
      dispatch({ type: 'SPAWN_VAPOR', particles: generateVapors(count, state.level) })
    }
  })
  return null
}

const SceneContent: React.FC = () => {
  const { state } = useCloudCatcherStore()
  return (
    <>
      <Environment />
      <Controller />
      <Spawner />
      {/* Gust visual cue */}
      {state.gustActive && (
        <group position={[0, 5, -1]}>
          {new Array(8).fill(0).map((_, i) => (
            <mesh key={i} position={[state.gustDirection * (i - 4) * 0.8, Math.sin(i) * 0.4, 0]} rotation={[0, 0, state.gustDirection * -0.2]}>
              <planeGeometry args={[1.2, 0.12]} />
              <meshBasicMaterial color="#93c5fd" transparent opacity={state.gustStrength === 'strong' ? 0.6 : 0.35} />
            </mesh>
          ))}
        </group>
      )}
      <Cloud />
      {state.vaporParticles.map(v => (
        <Vapor key={v.id} data={v} />
      ))}
      {state.status === 'rain' && <Rain />}
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </>
  )
}

const GameScene: React.FC = () => (
  <Canvas shadows camera={{ position: [0, 6, 12], fov: 60 }}>
    <Suspense fallback={null}>
      <SceneContent />
    </Suspense>
  </Canvas>
)

export default GameScene


