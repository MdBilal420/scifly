import React from 'react'
import GameScene from './GameScene'
import { GameProvider } from './useGameStore'
import UIOverlay from './UIOverlay'

const WaterCycleQuest3D: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-0px)] bg-gradient-to-b from-sky-200 to-green-200">
      <GameProvider>
        <GameScene />
        <UIOverlay />
      </GameProvider>
    </div>
  )
}

export default WaterCycleQuest3D


