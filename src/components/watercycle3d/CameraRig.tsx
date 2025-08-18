import React, { useRef } from 'react'
import { useFrame, useThree, type RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from './useGameStore'

const CAMERA_OFFSET = new THREE.Vector3(0, 4, 8)

const CameraRig: React.FC = () => {
  const { camera } = useThree()
  const { playerRef } = useGameStore()
  const target = useRef(new THREE.Vector3())

  useFrame((state: RootState, dt: number) => {
    if (!playerRef.current) return
    const playerPos = playerRef.current.position
    target.current.lerp(playerPos, 1 - Math.pow(0.001, dt))
    const desired = new THREE.Vector3().copy(target.current).add(CAMERA_OFFSET)
    camera.position.lerp(desired, 1 - Math.pow(0.0008, dt))
    camera.lookAt(target.current)
  })

  return null
}

export default CameraRig


