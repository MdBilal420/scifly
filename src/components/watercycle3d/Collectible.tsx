import React, { useMemo, useRef } from 'react'
import { useFrame, type RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { CollectibleData, useGameStore } from './useGameStore'

const tmpVec = new THREE.Vector3()

const Collectible: React.FC<{ data: CollectibleData }> = ({ data }) => {
  const { collect, playerRef } = useGameStore()
  const ref = useRef<THREE.Mesh>(null)
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 0.5 }), [])

  useFrame((state: RootState, dt: number) => {
    if (!ref.current) return
    const t = performance.now() * 0.001
    ref.current.rotation.y += dt
    ref.current.position.y = data.position[1] + Math.sin(t + ref.current.id) * 0.2
    if (data.falling) {
      ref.current.position.y -= 1.5 * dt
      if (ref.current.position.y < 0.6) ref.current.position.y = 0.6
    }
    // collision
    if (playerRef.current) {
      tmpVec.copy(playerRef.current.position)
      const dist = tmpVec.distanceTo(ref.current.position)
      if (dist < 0.6) {
        collect(data.id)
      }
    }
  })

  return (
    <mesh ref={ref} position={data.position} material={material} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
    </mesh>
  )
}

export default React.memo(Collectible)


