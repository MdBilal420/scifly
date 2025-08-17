import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, type RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from './useGameStore'

type InputState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
}

const keys: Record<string, keyof InputState> = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'jump'
}

const GRAVITY = 24
const MOVE_ACCEL = 40
const MAX_SPEED = 8
const FRICTION = 8
const JUMP_VELOCITY = 9
const BOUNDS = 14.5

export const Player: React.FC = () => {
  const { playerRef, getCurrentStage } = useGameStore()
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const onGround = useRef(true)
  const input = useRef<InputState>({ forward: false, backward: false, left: false, right: false, jump: false })

  useEffect(() => {
    function down(e: KeyboardEvent) {
      const k = keys[e.code as keyof typeof keys]
      if (k) { input.current[k] = true }
    }
    function up(e: KeyboardEvent) {
      const k = keys[e.code as keyof typeof keys]
      if (k) { input.current[k] = false }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((state: RootState, dt: number) => {
    if (!playerRef.current) return
    const obj = playerRef.current
    const accel = new THREE.Vector3(0, 0, 0)

    // Stage-specific physics modifiers for distinct gameplay per stage
    const stage = getCurrentStage()
    const t = state.clock.getElapsedTime()

    let gravity = GRAVITY
    let moveAccel = MOVE_ACCEL
    let maxSpeed = MAX_SPEED
    let frictionCoeff = FRICTION
    let jumpVelocity = JUMP_VELOCITY
    let jumpAllowed = true
    const wind = new THREE.Vector3(0, 0, 0)

    if (stage === 'chapter2_ascent') {
      // Gentle buoyancy and slightly lighter gravity while rising
      gravity = 16
      wind.y = 2.5
      moveAccel = 36
    } else if (stage === 'chapter3_cloud') {
      // Steady lateral wind and a bit more slide (lower friction)
      wind.x = Math.sin(t * 0.6) * 5
      wind.z = Math.cos(t * 0.4) * 2
      frictionCoeff = 6
    } else if (stage === 'chapter4_fall') {
      // Heavier gravity, no jumping, gusty crosswinds, slower strafe
      gravity = 32
      jumpAllowed = false
      maxSpeed = 6
      wind.x = Math.sin(t * 0.8) * 6
      wind.z = Math.cos(t * 0.5) * 3
    }

    if (input.current.forward) accel.z -= moveAccel
    if (input.current.backward) accel.z += moveAccel
    if (input.current.left) accel.x -= moveAccel
    if (input.current.right) accel.x += moveAccel

    // Horizontal friction
    const horizontalVel = new THREE.Vector3(velocity.current.x, 0, velocity.current.z)
    const friction = horizontalVel.multiplyScalar(-frictionCoeff)
    accel.add(friction)

    // Add wind/buoyancy
    accel.add(wind)

    // Integrate velocity
    velocity.current.x = THREE.MathUtils.clamp(velocity.current.x + accel.x * dt, -maxSpeed, maxSpeed)
    velocity.current.z = THREE.MathUtils.clamp(velocity.current.z + accel.z * dt, -maxSpeed, maxSpeed)

    // Gravity and jumping
    velocity.current.y -= gravity * dt
    if (onGround.current && input.current.jump && jumpAllowed) {
      velocity.current.y = jumpVelocity
      onGround.current = false
    }

    // Integrate position
    obj.position.addScaledVector(velocity.current, dt)

    // Ground collision (y=0.6 is feet)
    if (obj.position.y <= 0.6) {
      obj.position.y = 0.6
      if (velocity.current.y < 0) velocity.current.y = 0
      onGround.current = true
    }

    // Bounds
    obj.position.x = THREE.MathUtils.clamp(obj.position.x, -BOUNDS, BOUNDS)
    obj.position.z = THREE.MathUtils.clamp(obj.position.z, -BOUNDS, BOUNDS)
  })

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#60a5fa', roughness: 0.6, metalness: 0.2 }), [])
  const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#93c5fd' }), [])
  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111827', emissive: '#000000' }), [])

  return (
    <group ref={playerRef as any} position={[0, 0.6, 0]}>
      <mesh material={bodyMaterial} castShadow>
        <boxGeometry args={[0.8, 1, 0.5]} />
      </mesh>
      <mesh position={[0, 0.9, 0]} material={headMaterial} castShadow>
        <sphereGeometry args={[0.35, 24, 24]} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.12, 0.95, 0.28]} material={eyeMaterial}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>
      <mesh position={[0.12, 0.95, 0.28]} material={eyeMaterial}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>
      {/* subtle bobbing to feel alive */}
    </group>
  )
}

export default Player


