import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import Player from './Player'
import CameraRig from './CameraRig'
import Environment from './Environment'
import Collectible from './Collectible'
import StageManager from './StageManager'
import { useGameStore } from './useGameStore'

const SceneContent: React.FC = () => {
  const { collectibles, score } = useGameStore()
  return (
    <>
      <Environment />
      <Player />
      <StageManager />
      {collectibles.map(c => (
        <Collectible key={c.id} data={c} />
      ))}
      <CameraRig />
      {/* floating 3D score */}
      <Text position={[0, 9.5, 0]} fontSize={0.8} color="#0ea5e9" anchorX="center" anchorY="middle">
        Score: {score}
      </Text>
    </>
  )
}

const GameScene: React.FC = () => {
  return (
    <Canvas shadows camera={{ position: [0, 6, 10], fov: 55 }}>
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  )
}

export default GameScene


