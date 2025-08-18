import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import Sun3D from './Sun3D'
import Target3D from './Target3D'
import HeatRay3DComponent from './HeatRay3D'
import Field3D from './Field3D'
import MouseTargeting from './MouseTargeting'
import AimingReticle from './AimingReticle'
import CrosshairController from './CrosshairController'
import { useHeatRayStore } from './useHeatRayStore'
import * as THREE from 'three'

interface SceneContentProps {
  onAimChange: (position: THREE.Vector3) => void
  onScreenPositionChange: (position: { x: number, y: number }) => void
}

const SceneContent: React.FC<SceneContentProps> = ({ onAimChange, onScreenPositionChange }) => {
  const { state } = useHeatRayStore()
  const [aimTarget, setAimTarget] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={state.sunPosition} intensity={0.8} color="#ffeb3b" />
      
      {/* Sky */}
      <Sky 
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
        turbidity={8}
        rayleigh={6}
      />
      
      {/* Field Environment */}
      <Field3D />
      
      {/* Sun */}
      <Sun3D />
      
      {/* Targets */}
      {state.targets.map(target => (
        <Target3D key={target.id} target={target} />
      ))}
      
      {/* Heat Rays */}
      {state.heatRays.map(ray => (
        <HeatRay3DComponent key={ray.id} ray={ray} />
      ))}
      
      {/* HUD moved to HTML overlay; removed 3D texts to prevent clipping */}
      
      {/* Mouse Targeting */}
      <MouseTargeting onTargetChange={(position) => {
        setAimTarget(position)
        onAimChange(position)
      }} />
      
      {/* Aiming Reticle */}
      <AimingReticle targetPosition={aimTarget} />
      
      {/* Crosshair Controller */}
      <CrosshairController 
        aimPosition={aimTarget} 
        onScreenPositionChange={onScreenPositionChange} 
      />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={8}
        maxDistance={28}
        target={state.cameraTarget}
        mouseButtons={{ LEFT: undefined, MIDDLE: 1, RIGHT: 2 }}
      />
    </>
  )
}

interface HeatRaySceneProps {
  onAimChange: (position: THREE.Vector3) => void
  onScreenPositionChange: (position: { x: number, y: number }) => void
}

const HeatRayScene: React.FC<HeatRaySceneProps> = ({ onAimChange, onScreenPositionChange }) => {
  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 9, 14], fov: 55 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <SceneContent onAimChange={onAimChange} onScreenPositionChange={onScreenPositionChange} />
      </Suspense>
    </Canvas>
  )
}

export default HeatRayScene
