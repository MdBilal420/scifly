import React, { useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useHeatRayStore } from './useHeatRayStore'
import * as THREE from 'three'

interface MouseTargetingProps {
  onTargetChange: (target: THREE.Vector3) => void
}

const MouseTargeting: React.FC<MouseTargetingProps> = ({ onTargetChange }) => {
  const { camera, gl } = useThree()
  const { state, dispatch } = useHeatRayStore()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  // Aim at ground level for better target visibility
  const targetPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectionPoint = useRef(new THREE.Vector3())
  
  // Handle mouse movement for aiming
  React.useEffect(() => {
    const updateIntersectionFromEvent = (event: MouseEvent) => {
      if (state.status !== 'playing') return
      
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      // Update raycaster
      raycaster.current.setFromCamera(mouse.current, camera)
      
      // Precise targeting: Ray-sphere intersection to pick exactly the target under cursor
      let closestHitPoint: THREE.Vector3 | null = null
      let closestHitDistance = Infinity
      let sphere = new THREE.Sphere()
      const tmp = new THREE.Vector3()
      const ray = raycaster.current.ray
      
      state.targets.forEach(t => {
        sphere.center.copy(t.position)
        sphere.radius = t.size + 2.0 // more generous tolerance to make selection easy
        const hit = ray.intersectSphere(sphere, tmp)
        if (hit) {
          const d = ray.origin.distanceTo(hit)
          if (d < closestHitDistance) {
            closestHitDistance = d
            closestHitPoint = hit.clone()
          }
        }
      })
      if (closestHitPoint) {
        intersectionPoint.current.copy(closestHitPoint)
        onTargetChange(intersectionPoint.current.clone())
        return
      }
      
      // Fallback: intersect with ground plane
      if (raycaster.current.ray.intersectPlane(targetPlane.current, intersectionPoint.current)) {
        onTargetChange(intersectionPoint.current.clone())
      }
    }
    const handleMouseMove = (event: MouseEvent) => updateIntersectionFromEvent(event)
    
    const handleClick = (event: MouseEvent) => {
      if (event.button === 0 && state.status === 'playing' && state.energy >= 15) { // Left click
        // Recompute ray and determine exact target under cursor
        const rect = gl.domElement.getBoundingClientRect()
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.current.setFromCamera(mouse.current, camera)
        const ray = raycaster.current.ray

        // Try sphere hits first
        let hitPoint: THREE.Vector3 | null = null
        let closest = Infinity
        const s = new THREE.Sphere()
        const tmp2 = new THREE.Vector3()
        state.targets.forEach(t => {
          s.center.copy(t.position)
          s.radius = t.size + 2.0 // Even more generous tolerance for easy clicking
          const p = ray.intersectSphere(s, tmp2)
          if (p) {
            const d = ray.origin.distanceTo(p)
            if (d < closest) { closest = d; hitPoint = p.clone() }
          }
        })

        // Always create a proper ray, even for close targets
        let targetPosition: THREE.Vector3
        if (hitPoint) {
          const hp = hitPoint as THREE.Vector3
          let dir = hp.clone().sub(state.sunPosition)
          const dist = dir.length()
          
          // Handle case where target is very close to sun (avoid zero-length direction)
          if (dist < 0.1) {
            // Use downward direction for very close targets
            dir.set(0, -1, 0)
          } else {
            dir.normalize()
          }
          
          // Ensure ray extends well beyond the target for visibility
          const minLen = 15 // minimum ray length
          const extendDist = Math.max(dist + 5, minLen)
          targetPosition = state.sunPosition.clone().add(dir.multiplyScalar(extendDist))
        } else {
          // fallback: intersection with ground plane
          const groundPoint = new THREE.Vector3()
          if (ray.intersectPlane(targetPlane.current, groundPoint)) {
            const dirFromSun = groundPoint.clone().sub(state.sunPosition).normalize()
            targetPosition = state.sunPosition.clone().add(dirFromSun.multiplyScalar(50))
          } else {
            // last resort: shoot straight forward from sun
            targetPosition = state.sunPosition.clone().add(new THREE.Vector3(0, 0, -50))
          }
        }
        const power = 2 // Fixed power level
        const rayType = 'focused' // Fixed ray type
        
        // Fire ray toward target
        dispatch({ 
          type: 'FIRE_RAY', 
          targetPosition: targetPosition, 
          power, 
          rayType 
        })
        
        // Prevent any other click handlers from interfering
        event.preventDefault()
        event.stopPropagation()
      }
    }
    
    gl.domElement.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('click', handleClick)
    
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [camera, gl, state.status, state.energy, state.targets, state.sunPosition, dispatch, onTargetChange])
  
  return null // This component doesn't render anything
}

export default MouseTargeting
