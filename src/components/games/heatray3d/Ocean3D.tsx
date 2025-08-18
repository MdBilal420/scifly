import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'

const Ocean3D: React.FC = () => {
  const oceanRef = useRef<THREE.Mesh>(null)
  const waveRef = useRef<THREE.Mesh>(null)
  
  // Animate ocean waves
  useFrame((_, delta) => {
    if (oceanRef.current) {
      // Create subtle wave motion
      const time = Date.now() * 0.001
      oceanRef.current.rotation.z = Math.sin(time * 0.5) * 0.02
    }
    
    if (waveRef.current) {
      // Animate wave texture offset
      const material = waveRef.current.material as THREE.MeshStandardMaterial
      if (material.map) {
        material.map.offset.x += delta * 0.01
        material.map.offset.y += delta * 0.005
      }
    }
  })
  
  return (
    <group>
      {/* Main Ocean Surface */}
      <Plane 
        ref={oceanRef}
        args={[30, 30]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#0077be"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={1}
        />
      </Plane>
      
      {/* Wave Layer */}
      <Plane 
        ref={waveRef}
        args={[25, 25]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.4, 0]}
      >
        <meshStandardMaterial 
          color="#4fc3f7"
          transparent
          opacity={0.4}
          roughness={0.3}
          metalness={0.2}
        />
      </Plane>
      
      {/* Ocean Foam/Bubbles */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            -0.3,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.05 + Math.random() * 0.1, 8, 8]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Ocean Bed */}
      <Plane 
        args={[35, 35]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#8d6e63"
          roughness={0.9}
        />
      </Plane>
      
      {/* Underwater Light Rays */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={`light-${i}`}
          position={[
            (Math.random() - 0.5) * 15,
            2,
            (Math.random() - 0.5) * 15
          ]}
          rotation={[Math.PI, 0, Math.random() * Math.PI]}
        >
          <coneGeometry args={[0.5, 4, 8]} />
          <meshBasicMaterial 
            color="#81d4fa"
            transparent
            opacity={0.2}
          />
        </mesh>
      ))}
      
      {/* Seaweed/Kelp */}
      {Array.from({ length: 8 }, (_, i) => (
        <group
          key={`seaweed-${i}`}
          position={[
            (Math.random() - 0.5) * 25,
            -1,
            (Math.random() - 0.5) * 25
          ]}
        >
          <mesh>
            <cylinderGeometry args={[0.02, 0.05, 2, 8]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#4caf50" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default Ocean3D
