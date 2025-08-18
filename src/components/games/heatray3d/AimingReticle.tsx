import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Ring } from '@react-three/drei'
import { useHeatRayStore } from './useHeatRayStore'
import * as THREE from 'three'

interface AimingReticleProps {
  targetPosition: THREE.Vector3
}

const AimingReticle: React.FC<AimingReticleProps> = ({ targetPosition }) => {
  const { state } = useHeatRayStore()
  const reticleRef = useRef<THREE.Group>(null)
  
  // Animate reticle
  useFrame((_, delta) => {
    if (reticleRef.current) {
      // Position reticle at target position (slightly above ground)
      reticleRef.current.position.copy(targetPosition)
      reticleRef.current.position.y = 0.1
      
      // Gentle rotation
      reticleRef.current.rotation.y += delta * 1
    }
  })
  
  if (state.status !== 'playing') return null
  
  return (
    <group ref={reticleRef}>
      {/* Simple crosshair */}
      <Ring 
        args={[0.4, 0.5, 16]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial 
          color="#ffeb3b"
          transparent 
          opacity={0.8}
        />
      </Ring>
      
      {/* Center dot */}
      <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial 
          color="#f44336"
        />
      </mesh>
      
      {/* Crosshair lines */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 0.7,
            0.02,
            Math.sin((i / 4) * Math.PI * 2) * 0.7
          ]}
          rotation={[Math.PI / 2, 0, (i / 4) * Math.PI * 2]}
        >
          <planeGeometry args={[0.3, 0.03]} />
          <meshBasicMaterial 
            color="#ffeb3b"
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

export default AimingReticle
