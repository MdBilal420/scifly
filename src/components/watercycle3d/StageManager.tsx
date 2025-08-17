import React, { useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'

const platformMat = new THREE.MeshStandardMaterial({ color: '#bfdbfe' })
const cloudMat = new THREE.MeshStandardMaterial({ color: '#e5e7eb' })

const StageManager: React.FC = () => {
  const { getCurrentStage, collectibles, nextStage, status, score } = useGameStore()
  const stage = getCurrentStage()
  const playerRefExternal = useGameStore().playerRef

  // When all collectibles are collected, move to the next stage after a short delay
  useEffect(() => {
    // Only auto-progress if game is playing and all collectibles collected (but not on initial load)
    if (status === 'playing' && collectibles.length === 0 && score > 0) {
      const id = setTimeout(() => nextStage(), 800)
      return () => clearTimeout(id)
    }
  }, [collectibles.length, nextStage, status, score])

  // Stage-specific environment adjustments (e.g., moving cloud platform up for condensation)
  useFrame((_, dt: number) => {
    // Evaporation: updraft at center ring to simulate heating and rising
    if (stage === 'chapter1_evaporation') {
      const p = playerRefExternal.current
      if (p) {
        const r = Math.hypot(p.position.x, p.position.z)
        if (r < 1.1) {
          p.position.y = Math.min(6.5, p.position.y + 2.8 * dt)
        }
      }
    }
    // Ascent: gentle lift everywhere
    if (stage === 'chapter2_ascent') {
      const p = playerRefExternal.current
      if (p) {
        p.position.y = Math.min(7.5, p.position.y + 0.6 * dt)
      }
    }
    // Fall: constrain minimal altitude and add slight downward pull
    if (stage === 'chapter4_fall') {
      const p = playerRefExternal.current
      if (p) {
        p.position.y = Math.max(0.6, p.position.y - 0.2 * dt)
      }
    }
  })

  // Build simple 3D stage markers
  return (
    <group>
      {stage === 'chapter1_evaporation' && (
        <group>
          {/* Ocean platform with thermal vents */}
          <mesh position={[0, 3.2, 0]} material={platformMat} castShadow>
            <boxGeometry args={[4, 0.2, 4]} />
          </mesh>
          {/* Heated surface ring with bubbling effect */}
          <mesh position={[0, 0.1, 0]}>
            <ringGeometry args={[0.5, 1.1, 24]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
          </mesh>
          {/* Sun reflection on water */}
          <mesh position={[2, 0.12, 2]}>
            <circleGeometry args={[0.8, 16]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.3} />
          </mesh>
          {/* Thermal vents */}
          {[...Array(4)].map((_, i) => (
            <mesh key={i} position={[(-1 + (i % 2) * 2), 0.15, (-1 + Math.floor(i / 2) * 2)]}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {stage === 'chapter2_ascent' && (
        <group position={[0, 7.5, 0]}>
          {/* Main cloud formation with story */}
          <mesh position={[0, 0, 0]} material={cloudMat} castShadow>
            <sphereGeometry args={[1.2, 20, 20]} />
          </mesh>
          <mesh position={[1, 0.3, 0]} material={cloudMat} castShadow>
            <sphereGeometry args={[0.9, 20, 20]} />
          </mesh>
          <mesh position={[-1, 0.2, 0.2]} material={cloudMat} castShadow>
            <sphereGeometry args={[1, 20, 20]} />
          </mesh>
          {/* Updraft columns showing air currents */}
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[(-2 + i * 0.8), -2, (-2 + (i % 3) * 2)]}>
              <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
              <meshStandardMaterial color="#60a5fa" transparent opacity={0.4} />
            </mesh>
          ))}
          {/* Temperature gradient indicators */}
          <mesh position={[2, -1, 0]}>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[2, 1, 0]}>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </group>
      )}

      {stage === 'chapter3_cloud' && (
        <group>
          {/* Dense cloud layer with precipitation forming */}
          <mesh position={[0, 1.6, 0]} material={cloudMat} castShadow>
            <torusGeometry args={[6, 0.15, 16, 80]} />
          </mesh>
          {/* Dark storm clouds gathering */}
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[(-4 + i * 2), 2.5, (-2 + (i % 2) * 4)]} material={new THREE.MeshStandardMaterial({ color: '#4b5563', transparent: true, opacity: 0.8 })}>
              <sphereGeometry args={[0.8, 16, 16]} />
            </mesh>
          ))}
          {/* Lightning rods showing electrical activity */}
          <mesh position={[3, 3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-3, 3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {stage === 'chapter4_fall' && (
        <group>
          {/* Wind direction indicators */}
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[-6 + i * 2.4, 2 + (i % 2) * 0.6, -4]}>
              <coneGeometry args={[0.15, 0.6, 8]} />
              <meshStandardMaterial color="#60a5fa" />
            </mesh>
          ))}
          {/* Storm clouds overhead */}
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[3, 16, 16]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.6} />
          </mesh>
          {/* Ground puddles forming */}
          {[...Array(8)].map((_, i) => (
            <mesh key={i} position={[(-6 + Math.random() * 12), 0.02, (-6 + Math.random() * 12)]}>
              <cylinderGeometry args={[0.5 + Math.random() * 0.3, 0.5 + Math.random() * 0.3, 0.05, 16]} />
              <meshStandardMaterial color="#1e40af" transparent opacity={0.7} />
            </mesh>
          ))}
          {/* Rain gauge */}
          <mesh position={[5, 0.5, 5]}>
            <cylinderGeometry args={[0.15, 0.15, 1, 12]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        </group>
      )}

      {(stage === 'chapter5_forest' || stage === 'chapter5_mountain' || stage === 'chapter5_underground') && (
        <group>
          {/* Main collection stream */}
          <mesh position={[0, 0.55, -4]}>
            <boxGeometry args={[6, 1, 0.5]} />
            <meshStandardMaterial color="#60a5fa" />
          </mesh>
          
          {stage === 'chapter5_forest' && (
            <>
              {/* Forest floor with leaf litter */}
              <mesh position={[0, 0.05, 0]}>
                <circleGeometry args={[8, 32]} />
                <meshStandardMaterial color="#92400e" />
              </mesh>
              {/* Tree roots showing water absorption */}
              {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[(-3 + i), 0.1, (-3 + (i % 2) * 6)]}>
                  <cylinderGeometry args={[0.1, 0.2, 0.3, 8]} />
                  <meshStandardMaterial color="#7c2d12" />
                </mesh>
              ))}
            </>
          )}
          
          {stage === 'chapter5_mountain' && (
            <>
              {/* Rocky mountain terrain */}
              {[...Array(10)].map((_, i) => (
                <mesh key={i} position={[(-4 + Math.random() * 8), 0.3, (-4 + Math.random() * 8)]}>
                  <dodecahedronGeometry args={[0.4 + Math.random() * 0.6]} />
                  <meshStandardMaterial color="#6b7280" />
                </mesh>
              ))}
              {/* Waterfall effect */}
              <mesh position={[-6, 1.5, 0]}>
                <boxGeometry args={[0.3, 3, 0.2]} />
                <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
              </mesh>
            </>
          )}
          
          {stage === 'chapter5_underground' && (
            <>
              {/* Underground aquifer visualization */}
              <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[12, 0.8, 12]} />
                <meshStandardMaterial color="#1e40af" transparent opacity={0.4} />
              </mesh>
              {/* Underground rock layers */}
              {[...Array(3)].map((_, i) => (
                <mesh key={i} position={[0, -1 - i * 0.5, 0]}>
                  <boxGeometry args={[14, 0.3, 14]} />
                  <meshStandardMaterial color={['#78716c', '#57534e', '#44403c'][i]} />
                </mesh>
              ))}
            </>
          )}
        </group>
      )}

      {stage === 'chapter6_home' && (
        <group>
          {/* Celebration fountain showing completed cycle */}
          <mesh position={[0, 0.6, 0]}>
            <torusKnotGeometry args={[0.6, 0.18, 60, 8]} />
            <meshStandardMaterial color="#34d399" />
          </mesh>
          {/* Water cycle diagram in the ground */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2, 4, 32]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
          </mesh>
          {/* Four elements of the cycle */}
          <mesh position={[3, 0.2, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 0.2, 3]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          <mesh position={[-3, 0.2, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
          <mesh position={[0, 0.2, -3]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#1e40af" />
          </mesh>
        </group>
      )}
    </group>
  )
}

export default StageManager


