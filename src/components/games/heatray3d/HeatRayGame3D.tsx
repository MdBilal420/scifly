import React, { useState } from 'react'
import HeatRayScene from './HeatRayScene'
import { HeatRayProvider } from './useHeatRayStore'
import HeatRayUI from './HeatRayUI'
import Crosshair from './Crosshair'
import * as THREE from 'three'

interface HeatRayGame3DProps {
  onBackToMenu?: () => void
}

const HeatRayGame3D: React.FC<HeatRayGame3DProps> = ({ onBackToMenu }) => {
  const [, setAimPosition] = useState<THREE.Vector3 | undefined>()
  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 })

  return (
    <div className="w-full h-screen bg-gradient-to-b from-yellow-200 to-blue-300">
      <HeatRayProvider>
        <HeatRayScene 
          onAimChange={setAimPosition} 
          onScreenPositionChange={setScreenPosition} 
        />
        <HeatRayUI onBackToMenu={onBackToMenu} />
        <Crosshair screenPosition={screenPosition} />
      </HeatRayProvider>
    </div>
  )
}

export default HeatRayGame3D
