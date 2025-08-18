import React, { useMemo, useRef } from 'react'
import { Plane, Sphere, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

const Field3D: React.FC = () => {
  const flowersRef = useRef<THREE.Group>(null)

  // Memoized environment instances to prevent movement/jitter on re-render
  const flowers = useMemo(
    () => Array.from({ length: 50 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 20,
        0.1,
        (Math.random() - 0.5) * 20
      ] as [number, number, number],
      color: ['#ff69b4', '#ff1493', '#ffb6c1', '#ff69b4', '#ff1493'][Math.floor(Math.random() * 5)],
      scale: 0.3 + Math.random() * 0.4
    })),
    []
  )

  const grassPatches = useMemo(
    () => Array.from({ length: 200 }, (_, i) => {
      const height = 0.3 + Math.random() * 0.4
      return {
        id: i,
        height,
        position: [
          (Math.random() - 0.5) * 25,
          -0.35 + height / 2,
          (Math.random() - 0.5) * 25
        ] as [number, number, number],
        rotation: [
          Math.random() * 0.2 - 0.1,
          Math.random() * Math.PI * 2,
          Math.random() * 0.2 - 0.1
        ] as [number, number, number]
      }
    }),
    []
  )

  const hills = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({
      id: i,
      radius: 1.2 + Math.random() * 1.2,
      position: [
        (Math.random() - 0.5) * 20,
        -2 + Math.random() * 1,
        (Math.random() - 0.5) * 20
      ] as [number, number, number],
      yScale: 0.2 + Math.random() * 0.15
    })),
    []
  )

  const trees = useMemo(
    () => {
      const items = [] as { id: number, position: [number, number, number] }[]
      const count = 12
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = 28 + Math.random() * 12 // Place trees in a ring far from center (28..40)
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        items.push({ id: i, position: [x, 0, z] })
      }
      return items
    },
    []
  )

  return (
    <group>
      {/* Main grass field */}
      <Plane 
        args={[40, 40]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#4a7c59"
          roughness={0.8}
          metalness={0.1}
        />
      </Plane>

      {/* Grass patches */}
      {grassPatches.map(patch => (
        <Cylinder
          key={`grass-${patch.id}`}
          args={[0.02, 0.02, patch.height]}
          position={patch.position}
          rotation={patch.rotation}
        >
          <meshStandardMaterial 
            color="#2d5a3d"
            roughness={0.9}
            metalness={0}
          />
        </Cylinder>
      ))}

      {/* Flowers */}
      <group ref={flowersRef}>
        {flowers.map(flower => (
          <group key={flower.id} position={flower.position}>
            {/* Flower stem */}
            <Cylinder
              args={[0.02, 0.02, 0.4]}
              position={[0, 0.2, 0]}
            >
              <meshStandardMaterial 
                color="#228b22"
                roughness={0.8}
                metalness={0}
              />
            </Cylinder>
            
            {/* Flower petals */}
            {Array.from({ length: 5 }, (_, i) => (
              <Sphere
                key={i}
                args={[0.08, 8, 6]}
                position={[
                  Math.cos((i / 5) * Math.PI * 2) * 0.1,
                  0.4,
                  Math.sin((i / 5) * Math.PI * 2) * 0.1
                ]}
                scale={[flower.scale, flower.scale * 0.6, flower.scale]}
              >
                <meshStandardMaterial 
                  color={flower.color}
                  roughness={0.3}
                  metalness={0.1}
                />
              </Sphere>
            ))}
            
            {/* Flower center */}
            <Sphere
              args={[0.05, 8, 6]}
              position={[0, 0.4, 0]}
            >
              <meshStandardMaterial 
                color="#ffd700"
                roughness={0.2}
                metalness={0.3}
              />
            </Sphere>
          </group>
        ))}
      </group>

      {/* Small hills and terrain variations */}
      {hills.map(hill => (
        <Sphere
          key={`hill-${hill.id}`}
          args={[hill.radius, 8, 6]}
          position={hill.position}
          scale={[1, hill.yScale, 1]}
        >
          <meshStandardMaterial 
            color="#3a5f3a"
            roughness={0.9}
            metalness={0}
            transparent
            opacity={0.7}
          />
        </Sphere>
      ))}

      {/* Background trees */}
      {trees.map(tree => (
        <group
          key={`tree-${tree.id}`}
          position={tree.position}
        >
          {/* Tree trunk (smaller) */}
          <Cylinder
            args={[0.15, 0.2, 1.2]}
            position={[0, 0.6, 0]}
          >
            <meshStandardMaterial 
              color="#8b4513"
              roughness={0.9}
              metalness={0}
            />
          </Cylinder>
          
          {/* Tree leaves (smaller) */}
          <Sphere
            args={[0.9, 8, 6]}
            position={[0, 1.9, 0]}
          >
            <meshStandardMaterial 
              color="#228b22"
              roughness={0.8}
              metalness={0}
            />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

export default Field3D
