import React from 'react'
import { GameProvider } from './useCloudCatcherStore'
import GameScene from './GameScene'
import UIOverlay from './UIOverlay'

const CloudCatcher3D: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-0px)] bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
      <GameProvider>
        <GameScene />
        <UIOverlay />
      </GameProvider>
    </div>
  )
}

export default CloudCatcher3D


