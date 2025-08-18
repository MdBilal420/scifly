import React from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CrosshairControllerProps {
  aimPosition?: THREE.Vector3
  onScreenPositionChange: (position: { x: number, y: number }) => void
}

const CrosshairController: React.FC<CrosshairControllerProps> = ({ aimPosition, onScreenPositionChange }) => {
  const { camera, gl } = useThree()

  React.useEffect(() => {
    if (!aimPosition) return

    // Convert 3D world position to screen coordinates
    const vector = aimPosition.clone()
    vector.project(camera)
    
    // Get canvas rect to match mouse targeting coordinate system
    const rect = gl.domElement.getBoundingClientRect()
    
    // Convert normalized coordinates to screen coordinates
    const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left
    const y = (vector.y * -0.5 + 0.5) * rect.height + rect.top
    
    // Fine-tune alignment if needed (adjust these values if crosshair is still off)
    const adjustedX = x + 0 // Add offset here if needed
    const adjustedY = y + 0 // Add offset here if needed
    
    onScreenPositionChange({ x: adjustedX, y: adjustedY })
  }, [aimPosition, camera, gl, onScreenPositionChange])

  return null // This component doesn't render anything
}

export default CrosshairController
