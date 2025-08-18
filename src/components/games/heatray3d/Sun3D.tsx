import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import { useHeatRayStore } from './useHeatRayStore'
import * as THREE from 'three'

const Sun3D: React.FC = () => {
  const { state, dispatch } = useHeatRayStore()
  const sunRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  // Animate sun glow and rotation
  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.5
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.3
    }
  })
  
  // Handle keyboard input for sun movement
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (state.status !== 'playing') return
      
      const moveDistance = 0.5
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          dispatch({ type: 'MOVE_SUN', direction: new THREE.Vector3(0, 0, -moveDistance) })
          break
        case 's':
        case 'arrowdown':
          dispatch({ type: 'MOVE_SUN', direction: new THREE.Vector3(0, 0, moveDistance) })
          break
        case 'a':
        case 'arrowleft':
          dispatch({ type: 'MOVE_SUN', direction: new THREE.Vector3(-moveDistance, 0, 0) })
          break
        case 'd':
        case 'arrowright':
          dispatch({ type: 'MOVE_SUN', direction: new THREE.Vector3(moveDistance, 0, 0) })
          break
        // Space key removed - now using mouse click
      }
    }
    
    // No need for key up handler anymore
    
    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [state.status, dispatch])
  
  return (
    <group position={state.sunPosition}>
      {/* Sun Body */}
      <Sphere ref={sunRef} args={[0.8, 32, 32]} castShadow>
        <meshStandardMaterial 
          color="#ffeb3b"
          emissive="#ff9800"
          emissiveIntensity={0.3}
        />
      </Sphere>
      
      {/* Sun Glow */}
      <Sphere ref={glowRef} args={[1.2, 16, 16]}>
        <meshBasicMaterial 
          color="#fff59d"
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Sun Face */}
      <Text
        position={[0, 0, 0.85]}
        fontSize={0.6}
        color="#ff5722"
        anchorX="center"
        anchorY="middle"
      >
        😊
      </Text>
      
      {/* In-3D labels removed; info shown in UI overlay */}
    </group>
  )
}

export default Sun3D
