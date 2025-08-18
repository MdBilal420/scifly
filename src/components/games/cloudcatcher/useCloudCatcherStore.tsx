import React, { createContext, useContext, useReducer } from 'react'
import * as THREE from 'three'

export type GameStatus = 'menu' | 'playing' | 'paused' | 'rain'

export interface VaporParticle {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  isActive: boolean
}

export interface GameState {
  status: GameStatus
  score: number
  level: number
  cloudCapacity: number // 0..1
  cyclesCompleted: number
  vaporParticles: VaporParticle[]
  cloudX: number
  powerWindGust: boolean
  powerFreeze: boolean
  gustActive: boolean
  gustDirection: -1 | 1
  gustStrength: 'light' | 'strong'
}

type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK'; dt: number }
  | { type: 'MOVE_CLOUD'; dx: number }
  | { type: 'SPAWN_VAPOR'; particles: VaporParticle[] }
  | { type: 'ABSORB_VAPOR'; id: string }
  | { type: 'TRIGGER_RAIN' }
  | { type: 'END_RAIN' }
  | { type: 'ACTIVATE_WIND' }
  | { type: 'DEACTIVATE_WIND' }
  | { type: 'ACTIVATE_FREEZE' }
  | { type: 'DEACTIVATE_FREEZE' }
  | { type: 'START_GUST'; direction: -1 | 1; strength: 'light' | 'strong' }
  | { type: 'END_GUST' }
  | { type: 'NUDGE_CLOUD'; dx: number }

const initialState: GameState = {
  status: 'menu',
  score: 0,
  level: 1,
  cloudCapacity: 0,
  cyclesCompleted: 0,
  vaporParticles: [],
  cloudX: 0,
  powerWindGust: false,
  powerFreeze: false,
  gustActive: false,
  gustDirection: 1,
  gustStrength: 'light',
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'playing', cloudCapacity: 0, vaporParticles: [] }
    case 'PAUSE':
      return { ...state, status: 'paused' }
    case 'RESET':
      return initialState
    case 'MOVE_CLOUD': {
      const nextX = THREE.MathUtils.clamp(state.cloudX + action.dx, -10, 10)
      return { ...state, cloudX: nextX }
    }
    case 'SPAWN_VAPOR':
      return { ...state, vaporParticles: [...state.vaporParticles, ...action.particles] }
    case 'ABSORB_VAPOR': {
      const remaining = state.vaporParticles.filter(p => p.id !== action.id)
      const nextCapacity = Math.min(1, state.cloudCapacity + 0.05)
      const nextScore = state.score + 10
      // auto trigger rain when full
      if (nextCapacity >= 1) {
        return { ...state, vaporParticles: remaining, cloudCapacity: 1, score: nextScore, status: 'rain' }
      }
      return { ...state, vaporParticles: remaining, cloudCapacity: nextCapacity, score: nextScore }
    }
    case 'TRIGGER_RAIN':
      return { ...state, status: 'rain' }
    case 'END_RAIN':
      return { ...state, status: 'playing', cloudCapacity: 0, cyclesCompleted: state.cyclesCompleted + 1 }
    case 'ACTIVATE_WIND':
      return { ...state, powerWindGust: true }
    case 'DEACTIVATE_WIND':
      return { ...state, powerWindGust: false }
    case 'ACTIVATE_FREEZE':
      return { ...state, powerFreeze: true }
    case 'DEACTIVATE_FREEZE':
      return { ...state, powerFreeze: false }
    case 'START_GUST':
      return { ...state, gustActive: true, gustDirection: action.direction, gustStrength: action.strength }
    case 'END_GUST':
      return { ...state, gustActive: false }
    case 'NUDGE_CLOUD': {
      const nextX = THREE.MathUtils.clamp(state.cloudX + action.dx, -10, 10)
      return { ...state, cloudX: nextX }
    }
    default:
      return state
  }
}

function createVapor(idSeed: number): VaporParticle {
  // Spawn across the entire field width (-10 to 10)
  const x = THREE.MathUtils.randFloat(-10, 10)
  return {
    id: `v_${idSeed}_${Math.random().toString(36).slice(2, 7)}`,
    position: [x, -2, 0],
    velocity: [THREE.MathUtils.randFloatSpread(0.3), 1.5 + Math.random() * 0.6, THREE.MathUtils.randFloatSpread(0.1)],
    isActive: true,
  }
}

export const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<Action>
}>({ state: initialState, dispatch: () => {} })

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useCloudCatcherStore() {
  return useContext(GameContext)
}

export function generateVapors(n: number, level: number): VaporParticle[] {
  return Array.from({ length: n }, (_, i) => createVapor(i))
}


