import React, { useMemo } from 'react'
import { Sky } from '@react-three/drei'
import { useFrame, type RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from './useGameStore'

const Tree: React.FC<{ position: [number, number, number] }> = React.memo(({ position }) => {
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#92400e' }), [])
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10b981' }), [])
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} material={trunkMat} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
      </mesh>
      <mesh position={[0, 1.6, 0]} material={leafMat} castShadow>
        <coneGeometry args={[0.6, 1.2, 12]} />
      </mesh>
    </group>
  )
})

const Trees: React.FC = React.memo(() => {
  const positions = useMemo(() => {
    const list: [number, number, number][] = []
    const rand = (min: number, max: number) => Math.random() * (max - min) + min
    for (let i = 0; i < 14; i++) {
      list.push([rand(-13, 13), 0, rand(-13, 13)])
    }
    return list
  }, [])
  return <group>{positions.map((p, i) => <Tree key={i} position={p} />)}</group>
})

const Ground: React.FC = () => {
  const groundMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#86efac' }), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 1, 1]} />
      <meshStandardMaterial attach="material" color={groundMat.color} />
    </mesh>
  )
}

const GradientBackground: React.FC = () => {
  // subtle color shift over time
  useFrame((state: RootState, dt: number) => {
    const t = performance.now() * 0.00005
    const c = new THREE.Color().setHSL(0.55 + Math.sin(t) * 0.02, 0.7, 0.6)
    state.scene.background = c
  })
  return null
}

const OceanWaves: React.FC = () => {
  const waterMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1e40af', 
    transparent: true, 
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0.1
  }), [])
  
  return (
    <group>
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[(-3 + i) * 2, 0.1, -8]} material={waterMat}>
          <cylinderGeometry args={[0.8, 1.2, 0.2, 12]} />
        </mesh>
      ))}
    </group>
  )
}

const SteamParticles: React.FC = () => {
  return (
    <group>
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[(-2 + Math.random() * 4), 0.3 + Math.random() * 0.5, (-2 + Math.random() * 4)]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#e5e7eb" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

const CloudFormations: React.FC = () => {
  const cloudMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#f3f4f6', 
    transparent: true, 
    opacity: 0.7 
  }), [])
  
  return (
    <group>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[(-8 + i * 3), 4 + Math.random() * 2, (-8 + i * 2)]} material={cloudMat}>
          <sphereGeometry args={[1 + Math.random() * 0.5, 16, 16]} />
        </mesh>
      ))}
    </group>
  )
}

const RainDrops: React.FC = () => {
  return (
    <group>
      {[...Array(30)].map((_, i) => (
        <mesh key={i} position={[(-6 + Math.random() * 12), 6 + Math.random() * 2, (-6 + Math.random() * 12)]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

const Rivers: React.FC = () => {
  const riverMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#2563eb', 
    transparent: true, 
    opacity: 0.8 
  }), [])
  
  return (
    <group>
      <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI / 4, 0]} material={riverMat}>
        <boxGeometry args={[20, 0.1, 2]} />
      </mesh>
      <mesh position={[4, 0.05, -4]} rotation={[0, -Math.PI / 6, 0]} material={riverMat}>
        <boxGeometry args={[12, 0.1, 1.5]} />
      </mesh>
    </group>
  )
}

const Rocks: React.FC = () => {
  const rockMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b7280' }), [])
  
  return (
    <group>
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[(-8 + Math.random() * 16), 0.2, (-8 + Math.random() * 16)]} material={rockMat}>
          <dodecahedronGeometry args={[0.3 + Math.random() * 0.4]} />
        </mesh>
      ))}
    </group>
  )
}

const Environment: React.FC = () => {
  const { getCurrentStage } = useGameStore()
  const stage = getCurrentStage()
  
  // Stage-specific lighting and atmosphere
  const getLighting = () => {
    switch (stage) {
      case 'chapter1_evaporation':
        return {
          ambientIntensity: 0.8,
          sunIntensity: 1.2,
          sunPosition: [3, 8, 3] as [number, number, number],
          pointLightColor: '#fbbf24'
        }
      case 'chapter2_ascent':
        return {
          ambientIntensity: 0.7,
          sunIntensity: 0.9,
          sunPosition: [2, 10, 2] as [number, number, number],
          pointLightColor: '#60a5fa'
        }
      case 'chapter3_cloud':
        return {
          ambientIntensity: 0.5,
          sunIntensity: 0.6,
          sunPosition: [1, 8, 1] as [number, number, number],
          pointLightColor: '#9ca3af'
        }
      case 'chapter4_fall':
        return {
          ambientIntensity: 0.4,
          sunIntensity: 0.5,
          sunPosition: [0, 6, 0] as [number, number, number],
          pointLightColor: '#4b5563'
        }
      default:
        return {
          ambientIntensity: 0.6,
          sunIntensity: 1,
          sunPosition: [5, 10, 5] as [number, number, number],
          pointLightColor: '#10b981'
        }
    }
  }
  
  const lighting = getLighting()
  
  return (
    <group>
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight position={lighting.sunPosition} intensity={lighting.sunIntensity} castShadow />
      <pointLight position={[-5, 6, -3]} intensity={0.3} color={lighting.pointLightColor} />
      
      <Ground />
      <Trees />
      
      {/* Stage-specific environmental storytelling */}
      {stage === 'chapter1_evaporation' && (
        <>
          <OceanWaves />
          <SteamParticles />
          <Rocks />
        </>
      )}
      
      {stage === 'chapter2_ascent' && (
        <>
          <CloudFormations />
          <SteamParticles />
        </>
      )}
      
      {stage === 'chapter3_cloud' && (
        <>
          <CloudFormations />
        </>
      )}
      
      {stage === 'chapter4_fall' && (
        <>
          <RainDrops />
          <CloudFormations />
        </>
      )}
      
      {(stage === 'chapter5_forest' || stage === 'chapter5_mountain' || stage === 'chapter5_underground') && (
        <>
          <Rivers />
          <Rocks />
        </>
      )}
      
      <Sky 
        distance={450000} 
        sunPosition={lighting.sunPosition} 
        turbidity={stage === 'chapter4_fall' ? 12 : 8} 
        rayleigh={stage === 'chapter3_cloud' ? 2 : 1.2} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      <GradientBackground />
    </group>
  )
}

export default Environment


