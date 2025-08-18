import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Text, Cylinder } from '@react-three/drei'
import { Target3D as Target3DType } from './useHeatRayStore'
import * as THREE from 'three'

interface Target3DProps {
  target: Target3DType
}

const Target3D: React.FC<Target3DProps> = ({ target }) => {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = React.useState(false)
  
  // Animate target movement and floating effect
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Update position based on target's movement
      meshRef.current.position.copy(target.position)
      
      // Add floating animation
      const floatOffset = Math.sin(Date.now() * 0.002 + target.phase * 10) * 0.1
      meshRef.current.position.y += floatOffset
      
      // Rotate targets slowly
      meshRef.current.rotation.y += delta * 0.5
      
      // Pulse effect for damaged targets
      if (target.health < target.maxHealth) {
        const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1
        meshRef.current.scale.setScalar(pulseScale)
      }
    }
  })
  
  // Get target appearance based on type
  const getTargetAppearance = () => {
    switch (target.type) {
      case 'puddle':
        return {
          color: '#2196f3',
          emissive: '#0d47a1',
          emoji: '💧',
          shape: 'flat'
        }
      case 'pool':
        return {
          color: '#1976d2',
          emissive: '#0d47a1',
          emoji: '🏊',
          shape: 'large'
        }
      case 'dewdrop':
        return {
          color: '#64b5f6',
          emissive: '#1565c0',
          emoji: '✨',
          shape: 'small'
        }
      default:
        return {
          color: '#2196f3',
          emissive: '#0d47a1',
          emoji: '💧',
          shape: 'default'
        }
    }
  }
  
  const appearance = getTargetAppearance()
  const healthPercentage = target.health / target.maxHealth
  
  return (
    <group
      ref={meshRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Target Body */}
      {appearance.shape === 'flat' ? (
        <Cylinder 
          args={[target.size, target.size, 0.2, 16]} 
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial 
            color={appearance.color}
            emissive={appearance.emissive}
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </Cylinder>
      ) : (
        <Sphere 
          args={[target.size, 16, 16]} 
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial 
            color={appearance.color}
            emissive={appearance.emissive}
            emissiveIntensity={0.2}
            transparent
            opacity={0.9}
          />
        </Sphere>
      )}
      
      {/* Target Emoji */}
      <Text
        position={[0, target.size + 0.3, 0]}
        fontSize={target.size * 0.8}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {appearance.emoji}
      </Text>
      
      {/* Health Bar (only show when damaged) */}
      {healthPercentage < 1 && (
        <group position={[0, target.size + 0.8, 0]}>
          {/* Background */}
          <mesh>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#666" transparent opacity={0.7} />
          </mesh>
          
          {/* Health Fill */}
          <mesh position={[(-1 + healthPercentage) / 2, 0, 0.01]}>
            <planeGeometry args={[healthPercentage, 0.08]} />
            <meshBasicMaterial 
              color={healthPercentage > 0.5 ? "#4caf50" : healthPercentage > 0.25 ? "#ff9800" : "#f44336"} 
            />
          </mesh>
        </group>
      )}
      
      {/* Points Display (when hovered) */}
      {hovered && (
        <Text
          position={[0, target.size + 1.2, 0]}
          fontSize={0.3}
          color="#ffeb3b"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#333"
        >
          +{target.points} points
        </Text>
      )}
      
      {/* Ripple Effect (for water targets) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[target.size * 1.2, target.size * 1.5, 16]} />
        <meshBasicMaterial 
          color={appearance.color}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

export default Target3D
