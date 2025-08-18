import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import * as THREE from 'three'

// Types
export type GameStatus = 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver'
export type TargetType = 'puddle' | 'dewdrop' | 'pool'
export type RayType = 'quick' | 'focused' | 'blast'

export interface Target3D {
  id: string
  type: TargetType
  position: THREE.Vector3
  velocity: THREE.Vector3
  size: number
  health: number
  maxHealth: number
  points: number
  pattern: 'linear' | 'bounce' | 'orbit'
  phase: number
  active: boolean
}

export interface HeatRay3D {
  id: string
  startPosition: THREE.Vector3
  endPosition: THREE.Vector3
  type: RayType
  power: number
  progress: number
  active: boolean
}

export interface HitTarget {
  id: string
  type: TargetType
  points: number
  timestamp: number
  rayType: RayType
}

export interface GameState {
  status: GameStatus
  score: number
  energy: number
  maxEnergy: number
  targets: Target3D[]
  heatRays: HeatRay3D[]
  sunPosition: THREE.Vector3
  streak: number
  chainMultiplier: number
  timeRemaining: number
  hitTargets: HitTarget[]
  cameraTarget: THREE.Vector3
}

const TARGET_CONFIGS = {
  puddle: { 
    baseHealth: 2, 
    points: 10, 
    size: 0.8, 
    speed: 0.3,
    name: "Small Puddle",
    description: "Shallow water puddle in the field that evaporates quickly when heated",
    evaporationFact: "Puddles in fields evaporate faster because they have more surface area exposed to air and sunlight!"
  },
  pool: { 
    baseHealth: 5, 
    points: 25, 
    size: 1.5, 
    speed: 0.2,
    name: "Water Pool",
    description: "Larger body of water in the field requiring more heat to evaporate",
    evaporationFact: "Pools in fields take longer to evaporate because they're deeper and have less surface area per volume!"
  },
  dewdrop: { 
    baseHealth: 1, 
    points: 5, 
    size: 0.4, 
    speed: 0,
    name: "Dewdrop",
    description: "Tiny water droplet on grass blades formed by condensation",
    evaporationFact: "Dewdrops form when water vapor condenses on cool grass overnight, and they easily evaporate as the sun warms the grass!"
  }
}

// Actions
type GameAction =
  | { type: 'START_GAME' }
  | { type: 'UPDATE_TARGETS'; deltaTime: number }
  | { type: 'UPDATE_HEAT_RAYS'; deltaTime: number }

  | { type: 'FIRE_RAY'; targetPosition: THREE.Vector3; power: number; rayType: RayType }
  | { type: 'MOVE_SUN'; direction: THREE.Vector3 }
  | { type: 'UPDATE_TIMER'; deltaTime: number }
  | { type: 'REGENERATE_ENERGY'; deltaTime: number }
  | { type: 'RESTART_GAME' }

const initialState: GameState = {
  status: 'menu',
  score: 0,
  energy: 100,
  maxEnergy: 100,
  targets: [],
  heatRays: [],
  sunPosition: new THREE.Vector3(0, 7.5, 0),
  streak: 0,
  chainMultiplier: 1,
  timeRemaining: 90,
  hitTargets: [],
  cameraTarget: new THREE.Vector3(0, 0, 0)
}

// Helper functions
const generateTargets = (): Target3D[] => {
  const targets: Target3D[] = []
  
  // Random positioning in front half of field
  const targetTypes: TargetType[] = ['puddle', 'dewdrop', 'pool']
  const totalTargets = 12
  
  // Position all targets randomly in the front half of the field (positive Z)
  for (let i = 0; i < totalTargets; i++) {
    const type = targetTypes[Math.floor(Math.random() * targetTypes.length)] as TargetType
    const config = TARGET_CONFIGS[type]
    
    // Random position closer to center: X: -10 to 10, Z: 3 to 12
    const x = (Math.random() - 0.5) * 20 // -10 to 10
    const z = 3 + Math.random() * 9 // 3 to 12 (closer to center)
    const y = type === 'dewdrop' ? 0.2 : 0.1
    
    // Vary difficulty based on distance from center
    const distanceFromCenter = Math.sqrt(x * x + z * z)
    let health = config.baseHealth
    let points = config.points
    
    if (distanceFromCenter > 12) {
      health = Math.ceil(health * 1.3)
      points = Math.ceil(points * 1.2)
    } else if (distanceFromCenter > 8) {
      health = Math.ceil(health * 1.1)
      points = Math.ceil(points * 1.05)
    }
    
    const target: Target3D = {
      id: `target-${Date.now()}-${i}`,
      type,
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(0, 0, 0),
      size: config.size,
      health: health,
      maxHealth: health,
      points: points,
      pattern: 'linear',
      phase: 0,
      active: true
    }
    
    targets.push(target)
  }
  
  return targets
  

}

const updateTargets = (targets: Target3D[], _deltaTime: number): Target3D[] => {
  // Steady targets: no movement
  return targets.filter(target => target.active)
}

const updateHeatRays = (state: GameState, deltaTime: number): { rays: HeatRay3D[], targets: Target3D[], hitTargets: HitTarget[], score: number, streak: number, chainMultiplier: number } => {
  let newTargets = [...state.targets]
  let newHitTargets = [...state.hitTargets]
  let newScore = state.score
  let newStreak = state.streak
  let newChainMultiplier = state.chainMultiplier
  
  const newRays = state.heatRays.map(ray => {
    if (!ray.active) return ray
    
    const newProgress = ray.progress + deltaTime * 0.008 // Much faster rays
    
    if (newProgress >= 1) {
      // Check for hits with improved collision detection
      const rayRadius = ray.type === 'blast' ? 2 : ray.type === 'focused' ? 1.5 : 1
      let hitCount = 0
      
      newTargets = newTargets.map(target => {
        // Improved collision detection: check if ray passes near target
        const rayDirection = ray.endPosition.clone().sub(ray.startPosition).normalize()
        const rayToTarget = target.position.clone().sub(ray.startPosition)
        const rayLength = ray.startPosition.distanceTo(ray.endPosition)
        const projectedLength = rayToTarget.dot(rayDirection)
        
        // Find closest point on ray to target
        const closestPoint = ray.startPosition.clone().add(
          rayDirection.clone().multiplyScalar(Math.max(0, Math.min(projectedLength, rayLength)))
        )
        const distance = closestPoint.distanceTo(target.position)
        
        // More generous collision detection
        if (distance <= rayRadius + target.size * 1.2 && target.active) {
          const damage = Math.ceil(ray.power)
          const newHealth = target.health - damage
          
          if (newHealth <= 0) {
            // Target evaporated!
            hitCount++
            const points = target.points * newChainMultiplier
            newScore += points
            newStreak += 1
            newChainMultiplier = Math.min(5, newChainMultiplier + 0.5)
            
            const hitTarget: HitTarget = {
              id: target.id,
              type: target.type,
              points: points,
              timestamp: Date.now(),
              rayType: ray.type
            }
            
            newHitTargets = [...newHitTargets.slice(-4), hitTarget] // Keep only last 5
            
            return { ...target, active: false }
          } else {
            return { ...target, health: newHealth }
          }
        }
        return target
      })
      
      // Chain multiplier bonus for multiple hits
      if (hitCount > 1) {
        newChainMultiplier *= 2
      }
      
      return { ...ray, active: false, progress: 1.5 } // Faster cleanup
    }
    
    return { ...ray, progress: newProgress }
  })
  
  return { 
    rays: newRays.filter(ray => ray.active), // Remove inactive rays immediately
    targets: newTargets.filter(t => t.active),
    hitTargets: newHitTargets,
    score: newScore,
    streak: newStreak,
    chainMultiplier: newChainMultiplier
  }
}

// Reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        status: 'playing',
        score: 0,
        targets: generateTargets(),
        heatRays: [],
        streak: 0,
        chainMultiplier: 1,
        timeRemaining: 90,
        hitTargets: [],
        energy: state.maxEnergy
      }
      
    case 'UPDATE_TARGETS':
      return {
        ...state,
        targets: updateTargets(state.targets, action.deltaTime)
      }
      
    case 'UPDATE_HEAT_RAYS':
      const { rays, targets, hitTargets, score, streak, chainMultiplier } = updateHeatRays(state, action.deltaTime)
      return {
        ...state,
        heatRays: rays,
        targets,
        hitTargets,
        score,
        streak,
        chainMultiplier
      }
      
    case 'FIRE_RAY':
      if (state.status !== 'playing') return state
      
      const energyCost = 15 // Fixed lower cost for instant firing
      if (state.energy < energyCost) return state
      
      const newRay: HeatRay3D = {
        id: `ray-${Date.now()}`,
        startPosition: state.sunPosition.clone(),
        endPosition: action.targetPosition,
        type: action.rayType,
        power: action.power,
        progress: 0,
        active: true
      }
      
      return {
        ...state,
        energy: state.energy - energyCost,
        heatRays: [...state.heatRays, newRay]
      }
      
    case 'MOVE_SUN':
      const newSunPos = state.sunPosition.clone().add(action.direction)
      newSunPos.x = Math.max(-12, Math.min(12, newSunPos.x))
      newSunPos.z = Math.max(-12, Math.min(12, newSunPos.z))
      
      return {
        ...state,
        sunPosition: newSunPos
      }
      
    case 'UPDATE_TIMER':
      const newTimeRemaining = state.timeRemaining - action.deltaTime / 1000
      
      if (newTimeRemaining <= 0) {
        return { ...state, status: 'gameOver', timeRemaining: 0 }
      }
      
      if (state.targets.length === 0) {
        return { ...state, status: 'levelComplete' }
      }
      
      return { ...state, timeRemaining: newTimeRemaining }
      
    case 'REGENERATE_ENERGY':
      return {
        ...state,
        energy: Math.min(state.maxEnergy, state.energy + action.deltaTime * 0.05)
      }
      
    case 'RESTART_GAME':
      return {
        ...initialState,
        status: 'menu'
      }
      
    default:
      return state
  }
}

// Context
const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
  config: typeof TARGET_CONFIGS
} | null>(null)

export const HeatRayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  
  return (
    <GameContext.Provider value={{ state, dispatch, config: TARGET_CONFIGS }}>
      {children}
    </GameContext.Provider>
  )
}

export const useHeatRayStore = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useHeatRayStore must be used within a HeatRayProvider')
  }
  return context
}
