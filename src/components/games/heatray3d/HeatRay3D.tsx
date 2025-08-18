import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Sphere } from '@react-three/drei'
import { HeatRay3D as HeatRay3DType } from './useHeatRayStore'
import * as THREE from 'three'

interface HeatRay3DProps {
  ray: HeatRay3DType
}

const HeatRay3DComponent: React.FC<HeatRay3DProps> = ({ ray }) => {
  const rayRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  
  // Calculate ray properties
  const direction = ray.endPosition.clone().sub(ray.startPosition).normalize()
  const distance = ray.startPosition.distanceTo(ray.endPosition)
  const currentDistance = distance * ray.progress
  
  // Get ray appearance based on type
  const getRayAppearance = () => {
    switch (ray.type) {
      case 'quick':
        return {
          color: '#ffeb3b',
          intensity: 0.5,
          width: 0.05,
          particles: 20
        }
      case 'focused':
        return {
          color: '#ff9800',
          intensity: 0.8,
          width: 0.08,
          particles: 40
        }
      case 'blast':
        return {
          color: '#f44336',
          intensity: 1.2,
          width: 0.12,
          particles: 60
        }
      default:
        return {
          color: '#ffeb3b',
          intensity: 0.5,
          width: 0.05,
          particles: 20
        }
    }
  }
  
  const appearance = getRayAppearance()
  
  // Animate ray progress and effects
  useFrame((_, delta) => {
    if (rayRef.current) {
      // Position ray at midpoint of current progress
      const currentPosition = ray.startPosition.clone().add(
        direction.clone().multiplyScalar(currentDistance / 2)
      )
      rayRef.current.position.copy(currentPosition)
      
      // Orient ray toward target
      rayRef.current.lookAt(ray.endPosition)
      rayRef.current.rotateX(Math.PI / 2)
    }
    
    if (beamRef.current) {
      // Scale beam based on progress
      beamRef.current.scale.y = ray.progress
      
      // Pulse effect
      const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.2
      beamRef.current.scale.x = pulse
      beamRef.current.scale.z = pulse
    }
    
    if (particlesRef.current) {
      // Rotate particles
      particlesRef.current.rotation.z += delta * 2
    }
  })
  
  // Create particle geometry for sparkle effects
  const particleCount = appearance.particles
  const positions = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * appearance.width * 4
    positions[i * 3 + 1] = Math.random() * currentDistance - currentDistance / 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * appearance.width * 4
  }
  
  return (
    <group ref={rayRef}>
      {/* Main Heat Ray Beam */}
      <Cylinder
        ref={beamRef}
        args={[appearance.width, appearance.width, currentDistance, 8]}
        castShadow
      >
        <meshStandardMaterial
          color={appearance.color}
          transparent
          opacity={0.8}
          emissive={appearance.color}
          emissiveIntensity={appearance.intensity}
        />
      </Cylinder>
      
      {/* Ray Core (brighter center) */}
      <Cylinder
        args={[appearance.width * 0.5, appearance.width * 0.5, currentDistance, 8]}
      >
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          emissive="#ffffff"
          emissiveIntensity={appearance.intensity * 0.8}
        />
      </Cylinder>
      
      {/* Heat Ray Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={particleCount}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={appearance.color}
          size={0.02}
          transparent
          opacity={0.8}
        />
      </points>
      
      {/* Impact Effect at target end */}
      {ray.progress > 0.8 && (
        <group position={[0, currentDistance / 2, 0]}>
          <Sphere args={[appearance.width * 2, 8, 8]}>
            <meshStandardMaterial
              color={appearance.color}
              transparent
              opacity={0.6}
              emissive={appearance.color}
              emissiveIntensity={appearance.intensity}
            />
          </Sphere>
          
          {/* Steam/Evaporation Effect */}
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([
                  0, 0.2, 0,
                  0.1, 0.4, 0,
                  -0.1, 0.3, 0,
                  0, 0.5, 0.1,
                  0, 0.6, -0.1
                ])}
                count={5}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#e3f2fd"
              size={0.05}
              transparent
              opacity={0.7}
            />
          </points>
        </group>
      )}
      
      {/* Heat Ray Glow */}
      <Cylinder
        args={[appearance.width * 2, appearance.width * 2, currentDistance, 8]}
      >
        <meshBasicMaterial
          color={appearance.color}
          transparent
          opacity={0.2}
        />
      </Cylinder>
    </group>
  )
}

export default HeatRay3DComponent
