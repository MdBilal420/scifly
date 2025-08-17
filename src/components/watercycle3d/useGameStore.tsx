import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react'
import * as THREE from 'three'

export type GameStatus = 'menu' | 'playing' | 'completed'

export type StageKey =
  | 'chapter1_evaporation'
  | 'chapter2_ascent'
  | 'chapter3_cloud'
  | 'chapter4_fall'
  | 'chapter5_forest'
  | 'chapter5_mountain'
  | 'chapter5_underground'
  | 'chapter6_home'

export interface CollectibleData {
  id: string
  position: [number, number, number]
  stage: StageKey
  falling?: boolean
  kind?: 'orb' | 'term'
  term?: string
}

interface GameState {
  status: GameStatus
  stageIndex: number
  stages: StageKey[]
  score: number
  collected: Set<string>
  collectibles: CollectibleData[]
  vocabulary: string[]
}

type Action =
  | { type: 'START' }
  | { type: 'RESTART' }
  | { type: 'NEXT_STAGE' }
  | { type: 'COLLECT'; id: string }
  | { type: 'SET_COLLECTIBLES'; items: CollectibleData[] }
  | { type: 'ADD_VOCAB'; term: string }
  | { type: 'CHOOSE_PATH'; path: 'forest' | 'mountain' | 'underground' | 'ocean' }

const INITIAL_SEQUENCE: StageKey[] = ['chapter1_evaporation', 'chapter2_ascent', 'chapter3_cloud', 'chapter4_fall']

function generateCollectibles(stage: StageKey): CollectibleData[] {
  const items: CollectibleData[] = []
  const count = 10
  const rand = (min: number, max: number) => Math.random() * (max - min) + min
  if (stage === 'chapter1_evaporation') {
    for (let i = 0; i < count; i++) {
      items.push({
        id: `${stage}-${i}`,
        position: [rand(-3, 3), rand(0.8, 1.2), rand(-3, 3)],
        stage,
        kind: 'orb'
      })
    }
    // vocabulary term collectible
    items.push({ id: `${stage}-term-evaporation`, position: [1.2, 1.0, -1.2], stage, kind: 'term', term: 'Evaporation' })
  } else if (stage === 'chapter2_ascent') {
    for (let i = 0; i < count; i++) {
      items.push({ id: `${stage}-${i}`, position: [rand(-8, 8), rand(0.8, 1.8), rand(-8, 8)], stage, kind: 'orb' })
    }
    items.push({ id: `${stage}-term-condensation`, position: [-1.5, 1.5, 0.8], stage, kind: 'term', term: 'Condensation' })
  } else if (stage === 'chapter3_cloud') {
    for (let i = 0; i < count; i++) {
      items.push({ id: `${stage}-${i}`, position: [rand(-10, 10), rand(1.0, 2.0), rand(-10, 10)], stage, kind: 'orb' })
    }
    items.push({ id: `${stage}-term-precipitation`, position: [0.2, 1.8, -1.3], stage, kind: 'term', term: 'Precipitation' })
  } else if (stage === 'chapter4_fall') {
    for (let i = 0; i < count; i++) {
      items.push({ id: `${stage}-${i}`, position: [rand(-12, 12), rand(0.8, 1.8), rand(-12, 12)], stage, falling: true, kind: 'orb' })
    }
  } else if (stage === 'chapter5_forest' || stage === 'chapter5_mountain' || stage === 'chapter5_underground') {
    for (let i = 0; i < count; i++) {
      items.push({ id: `${stage}-${i}`, position: [rand(-12, 12), 0.8, rand(-12, 12)], stage, kind: 'orb' })
    }
  } else if (stage === 'chapter6_home') {
    // no collectibles, celebration
  }
  return items
}

function initialState(): GameState {
  return {
    status: 'menu',
    stageIndex: 0,
    stages: INITIAL_SEQUENCE,
    score: 0,
    collected: new Set<string>(),
    collectibles: [],
    vocabulary: []
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START': {
      const stage = state.stages[state.stageIndex]
      return {
        ...state,
        status: 'playing',
        score: 0,
        collected: new Set<string>(),
        collectibles: generateCollectibles(stage)
      }
    }
    case 'RESTART': {
      return initialState()
    }
    case 'NEXT_STAGE': {
      const nextIndex = state.stageIndex + 1
      if (nextIndex >= state.stages.length) {
        return { ...state, status: 'completed', collectibles: [] }
      }
      const stage = state.stages[nextIndex]
      return { ...state, stageIndex: nextIndex, collectibles: generateCollectibles(stage) }
    }
    case 'COLLECT': {
      if (state.collected.has(action.id)) return state
      const collected = new Set(state.collected)
      collected.add(action.id)
      const collectibles = state.collectibles.filter(c => c.id !== action.id)
      return { ...state, collected, collectibles, score: state.score + 1 }
    }
    case 'SET_COLLECTIBLES': {
      return { ...state, collectibles: action.items }
    }
    case 'ADD_VOCAB': {
      if (state.vocabulary.includes(action.term)) return state
      return { ...state, vocabulary: [...state.vocabulary, action.term] }
    }
    case 'CHOOSE_PATH': {
      // Insert chapter 5 based on choice, then ensure chapter 6 is last
      const current = state.stages.slice(0, state.stageIndex + 1)
      let nextStage: StageKey | null = null
      if (action.path === 'forest') nextStage = 'chapter5_forest'
      if (action.path === 'mountain') nextStage = 'chapter5_mountain'
      if (action.path === 'underground') nextStage = 'chapter5_underground'
      if (action.path === 'ocean') nextStage = 'chapter6_home'
      const tail: StageKey[] = nextStage && nextStage !== 'chapter6_home' ? [nextStage, 'chapter6_home'] : ['chapter6_home']
      const stages = [...current, ...tail]
      return { ...state, stages }
    }
    default:
      return state
  }
}

interface GameStoreContextValue extends GameState {
  start: () => void
  restart: () => void
  nextStage: () => void
  collect: (id: string) => void
  setCollectibles: (items: CollectibleData[]) => void
  getCurrentStage: () => StageKey
  playerRef: React.MutableRefObject<THREE.Object3D | null>
  addVocab: (term: string) => void
  choosePath: (path: 'forest' | 'mountain' | 'underground' | 'ocean') => void
}

const GameStoreContext = createContext<GameStoreContextValue | null>(null)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const playerRef = useRef<THREE.Object3D | null>(null)

  const start = useCallback(() => dispatch({ type: 'START' }), [])
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), [])
  const nextStage = useCallback(() => dispatch({ type: 'NEXT_STAGE' }), [])
  const collect = useCallback((id: string) => dispatch({ type: 'COLLECT', id }), [])
  const setCollectibles = useCallback((items: CollectibleData[]) => dispatch({ type: 'SET_COLLECTIBLES', items }), [])
  const getCurrentStage = useCallback(() => state.stages[state.stageIndex], [state.stageIndex, state.stages])
  const addVocab = useCallback((term: string) => dispatch({ type: 'ADD_VOCAB', term }), [])
  const choosePath = useCallback((path: 'forest' | 'mountain' | 'underground' | 'ocean') => dispatch({ type: 'CHOOSE_PATH', path }), [])

  const value = useMemo(() => ({
    ...state,
    start,
    restart,
    nextStage,
    collect,
    setCollectibles,
    getCurrentStage,
    playerRef,
    addVocab,
    choosePath
  }), [state, start, restart, nextStage, collect, setCollectibles, getCurrentStage, addVocab, choosePath])

  return (
    <GameStoreContext.Provider value={value}>
      {children}
    </GameStoreContext.Provider>
  )
}

export function useGameStore(): GameStoreContextValue {
  const ctx = useContext(GameStoreContext)
  if (!ctx) throw new Error('useGameStore must be used within GameProvider')
  return ctx
}

export function useIsStage(target: StageKey): boolean {
  const { getCurrentStage } = useGameStore()
  return getCurrentStage() === target
}


