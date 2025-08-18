import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Game State Types
type GameStatus = 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver'
type TargetType = 'puddle' | 'raindrop' | 'pool' | 'balloon' | 'ice' | 'dewdrop'
type RayType = 'quick' | 'focused' | 'blast' | 'scatter'

interface Target {
  id: string
  type: TargetType
  x: number
  y: number
  vx: number
  vy: number
  size: number
  health: number
  maxHealth: number
  points: number
  pattern: 'linear' | 'bounce' | 'circle' | 'figure8' | 'erratic'
  patternPhase: number
}

interface HeatRay {
  id: string
  x: number
  y: number
  targetX: number
  targetY: number
  power: number
  type: RayType
  active: boolean
  progress: number
}

interface HitTarget {
  id: string
  type: TargetType
  points: number
  timestamp: number
  rayType: RayType
}

interface GameState {
  status: GameStatus
  level: number
  score: number
  energy: number
  maxEnergy: number
  targets: Target[]
  heatRays: HeatRay[]
  sunX: number
  charging: boolean
  chargeTime: number
  streak: number
  chainMultiplier: number
  timeRemaining: number
  achievements: string[]
  hitTargets: HitTarget[]
}

interface Level {
  id: number
  name: string
  environment: string
  background: string
  timeLimit: number
  targetCount: number
  targetTypes: TargetType[]
  obstacles: boolean
}

const LEVELS: Level[] = [
  {
    id: 1,
    name: "Ocean Evaporation",
    environment: "ocean",
    background: "from-blue-200 to-cyan-300",
    timeLimit: 90,
    targetCount: 12,
    targetTypes: ['puddle', 'dewdrop', 'pool'],
    obstacles: false
  }
]

const TARGET_CONFIGS = {
  puddle: { 
    baseHealth: 2, 
    points: 10, 
    size: 30, 
    speed: 0.3,
    name: "Small Puddle",
    description: "Shallow water that evaporates quickly when heated",
    evaporationFact: "Puddles evaporate faster because they have more surface area exposed to air!"
  },
  raindrop: { 
    baseHealth: 1, 
    points: 15, 
    size: 15, 
    speed: 0.8,
    name: "Raindrop",
    description: "Individual water droplets from clouds",
    evaporationFact: "Raindrops can evaporate before hitting the ground in hot, dry air!"
  },
  pool: { 
    baseHealth: 5, 
    points: 25, 
    size: 60, 
    speed: 0.2,
    name: "Water Pool",
    description: "Larger body of water requiring more heat to evaporate",
    evaporationFact: "Pools take longer to evaporate because they're deeper and have less surface area per volume!"
  },
  balloon: { 
    baseHealth: 3, 
    points: 20, 
    size: 25, 
    speed: 0.8,
    name: "Water Balloon",
    description: "Water contained in a thin barrier",
    evaporationFact: "Water balloons demonstrate how heat can break molecular bonds!"
  },
  ice: { 
    baseHealth: 4, 
    points: 30, 
    size: 35, 
    speed: 0.6,
    name: "Ice Cube",
    description: "Frozen water that must melt before evaporating",
    evaporationFact: "Ice first melts into water, then evaporates - that's called sublimation when it goes directly to vapor!"
  },
  dewdrop: { 
    baseHealth: 1, 
    points: 5, 
    size: 10, 
    speed: 0,
    name: "Dewdrop",
    description: "Tiny water droplet formed by condensation",
    evaporationFact: "Dewdrops form when water vapor condenses on cool surfaces, and they easily evaporate as the sun warms them!"
  }
}

const HeatRayGame: React.FC = () => {
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    level: 1,
    score: 0,
    energy: 100,
    maxEnergy: 100,
    targets: [],
    heatRays: [],
    sunX: 400,
    charging: false,
    chargeTime: 0,
    streak: 0,
    chainMultiplier: 1,
    timeRemaining: 60,
    achievements: [],
    hitTargets: []
  })

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [gameSize] = useState({ width: 800, height: 600 })

  // Generate a random target based on level configuration
  const generateTarget = useCallback((type: TargetType, index: number): Target => {
    const config = TARGET_CONFIGS[type]
    const patterns = ['linear', 'bounce'] as const // Removed circle for simpler, more predictable movement
    
    let startX = Math.random() * (gameSize.width - config.size)
    let startY = Math.random() * (gameSize.height - 200) + 100 // Keep away from sun area
    
    if (type === 'raindrop') {
      startX = Math.random() * gameSize.width
      startY = -config.size
    }
    
    // Use fixed velocities for steadier movement
    const fixedVx = config.speed * 0.5 // Half speed for X direction
    const fixedVy = type === 'raindrop' ? config.speed : config.speed * 0.3 // Half speed for Y direction
    
    return {
      id: `target-${Date.now()}-${index}`,
      type,
      x: startX,
      y: startY,
      vx: fixedVx,
      vy: fixedVy,
      size: config.size,
      health: config.baseHealth,
      maxHealth: config.baseHealth,
      points: config.points,
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      patternPhase: 0
    }
  }, [gameSize])

  // Initialize level
  const initializeLevel = useCallback(() => {
    const level = LEVELS[gameState.level - 1]
    if (!level) return

    const targets: Target[] = []
    for (let i = 0; i < level.targetCount; i++) {
      const targetType = level.targetTypes[Math.floor(Math.random() * level.targetTypes.length)]
      targets.push(generateTarget(targetType, i))
    }

    setGameState(prev => ({
      ...prev,
      targets,
      heatRays: [],
      timeRemaining: level.timeLimit,
      energy: prev.maxEnergy,
      charging: false,
      chargeTime: 0,
      chainMultiplier: 1
    }))
  }, [gameState.level, generateTarget])

  // Start game
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      level: 1,
      streak: 0,
      achievements: [],
      hitTargets: []
    }))
    initializeLevel()
  }

  // Handle mouse movement for aiming
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameAreaRef.current) return
    const rect = gameAreaRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Handle charging heat ray
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (gameState.status !== 'playing' || gameState.energy < 10) return
    setGameState(prev => ({ ...prev, charging: true, chargeTime: 0 }))
  }

  // Fire heat ray
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (gameState.status !== 'playing' || !gameState.charging) return
    
    const power = Math.min(gameState.chargeTime / 100, 3) // Max 3 seconds charge
    const energyCost = Math.ceil(power * 10) + 5
    
    if (gameState.energy < energyCost) return
    
    const rayType: RayType = power < 0.5 ? 'quick' : power < 1.5 ? 'focused' : 'blast'
    
    const newRay: HeatRay = {
      id: `ray-${Date.now()}`,
      x: gameState.sunX,
      y: 80,
      targetX: mousePos.x,
      targetY: mousePos.y,
      power,
      type: rayType,
      active: true,
      progress: 0
    }

    setGameState(prev => ({
      ...prev,
      charging: false,
      chargeTime: 0,
      energy: prev.energy - energyCost,
      heatRays: [...prev.heatRays, newRay]
    }))
  }

  // Move sun left and right
  const moveSun = useCallback((direction: 'left' | 'right') => {
    setGameState(prev => ({
      ...prev,
      sunX: Math.max(50, Math.min(gameSize.width - 50, 
        prev.sunX + (direction === 'left' ? -20 : 20)))
    }))
  }, [gameSize.width])

  // Update target positions
  const updateTargets = useCallback((deltaTime: number) => {
    setGameState(prev => ({
      ...prev,
      targets: prev.targets.map(target => {
        let newX = target.x
        let newY = target.y
        let newVx = target.vx
        let newVy = target.vy
        let newPhase = target.patternPhase + deltaTime * 0.005 // Slower phase change for circular movement

        // Apply movement patterns
        switch (target.pattern) {
          case 'bounce':
            newX += newVx * deltaTime * 0.06
            newY += newVy * deltaTime * 0.06
            if (newX <= 0 || newX >= gameSize.width - target.size) newVx *= -1
            if (newY <= 80 || newY >= gameSize.height - target.size) newVy *= -1
            break
          default: // linear
            newX += newVx * deltaTime * 0.06
            newY += newVy * deltaTime * 0.06
        }

        // Keep raindrops falling (slower)
        if (target.type === 'raindrop') {
          newY += 1 * deltaTime * 0.05
        }

        // Remove targets that go off screen
        if (newY > gameSize.height + 50 || newX < -50 || newX > gameSize.width + 50) {
          return null
        }

        return {
          ...target,
          x: Math.max(0, Math.min(gameSize.width - target.size, newX)),
          y: Math.max(80, Math.min(gameSize.height - target.size, newY)),
          vx: newVx,
          vy: newVy,
          patternPhase: newPhase
        }
      }).filter(Boolean) as Target[]
    }))
  }, [gameSize])

  // Update heat rays and check collisions
  const updateHeatRays = useCallback((deltaTime: number) => {
    setGameState(prev => {
      let newTargets = [...prev.targets]
      let newScore = prev.score
      let newStreak = prev.streak
      let newChainMultiplier = prev.chainMultiplier
      let hitTargets: string[] = []

      const updatedRays = prev.heatRays.map(ray => {
        if (!ray.active) return ray

        const newProgress = ray.progress + deltaTime * 0.008 // Ray travel speed
        
        if (newProgress >= 1) {
          // Ray has reached target, check for hits
          const rayRadius = ray.type === 'scatter' ? 40 : ray.type === 'blast' ? 30 : 20
          
          newTargets = newTargets.map(target => {
            const distance = Math.sqrt(
              Math.pow(target.x + target.size/2 - ray.targetX, 2) + 
              Math.pow(target.y + target.size/2 - ray.targetY, 2)
            )
            
            if (distance <= rayRadius + target.size/2 && !hitTargets.includes(target.id)) {
              hitTargets.push(target.id)
              const damage = Math.ceil(ray.power)
              const newHealth = target.health - damage
              
              if (newHealth <= 0) {
                // Target evaporated!
                const points = target.points * newChainMultiplier
                newScore += points
                newStreak += 1
                newChainMultiplier = Math.min(5, newChainMultiplier + 0.5)
                
                // Add to hit targets for educational sidebar
                const hitTarget: HitTarget = {
                  id: target.id,
                  type: target.type,
                  points: points,
                  timestamp: Date.now(),
                  rayType: ray.type
                }
                
                setGameState(prev => ({
                  ...prev,
                  hitTargets: [...prev.hitTargets.slice(-4), hitTarget] // Keep only last 5 hits
                }))
                
                return null // Remove target
              } else {
                return { ...target, health: newHealth }
              }
            }
            return target
          }).filter(Boolean) as Target[]
          
          return { ...ray, active: false, progress: 1 }
        }
        
        return { ...ray, progress: newProgress }
      })

      return {
        ...prev,
        heatRays: updatedRays.filter(ray => ray.active || ray.progress < 1.2),
        targets: newTargets,
        score: newScore,
        streak: newStreak,
        chainMultiplier: hitTargets.length > 1 ? newChainMultiplier * 2 : newChainMultiplier
      }
    })
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') return

    let lastTime = Date.now()
    
    const gameLoop = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Update charge time
      if (gameState.charging) {
        setGameState(prev => ({
          ...prev,
          chargeTime: Math.min(prev.chargeTime + deltaTime, 3000)
        }))
      }

      // Update targets and rays
      updateTargets(deltaTime)
      updateHeatRays(deltaTime)

      // Update timer
      setGameState(prev => {
        const newTimeRemaining = prev.timeRemaining - deltaTime / 1000
        
        if (newTimeRemaining <= 0) {
          return { ...prev, status: 'gameOver', timeRemaining: 0 }
        }
        
        if (prev.targets.length === 0) {
          return { ...prev, status: 'levelComplete' }
        }
        
        return { ...prev, timeRemaining: newTimeRemaining }
      })

      // Regenerate energy
      setGameState(prev => ({
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + deltaTime * 0.05)
      }))

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState.status, gameState.charging, updateTargets, updateHeatRays])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveSun('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveSun('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.status, moveSun])

  const nextLevel = () => {
    // Only one level - restart the same level
    setGameState(prev => ({ ...prev, status: 'playing' }))
    initializeLevel()
  }

  const currentLevel = LEVELS[gameState.level - 1]

  return (
    <div className="w-full h-screen bg-gradient-to-b from-yellow-200 to-blue-300 flex flex-col items-center justify-center">
      {/* Game Menu */}
      <AnimatePresence>
        {gameState.status === 'menu' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
          >
            <div className="text-6xl mb-4">☀️</div>
            <h1 className="font-comic text-3xl font-bold text-yellow-600 mb-2">
              Heat Ray Target Practice
            </h1>
            <p className="text-gray-600 mb-6">
              Help Sunny the Sun evaporate water targets with precise heat rays!
            </p>
            <div className="space-y-3 text-sm text-left mb-6">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
                <span>Move sun with Arrow Keys or A/D</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-orange-400 rounded-full"></span>
                <span>Click and hold to charge heat ray</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-400 rounded-full"></span>
                <span>Release to fire at water targets</span>
              </div>
            </div>
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Start Evaporating! 🔥
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      {gameState.status === 'playing' && (
        <div className="w-full max-w-7xl mx-auto">
          {/* HUD */}
          <div className="flex justify-between items-center mb-4 bg-white/80 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold">{currentLevel?.name}</div>
              <div className="text-sm">Score: {gameState.score.toLocaleString()}</div>
              <div className="text-sm">Streak: {gameState.streak}</div>
              {gameState.chainMultiplier > 1 && (
                <div className="text-sm text-orange-600 font-bold">
                  Chain: {gameState.chainMultiplier.toFixed(1)}x
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">Time: {Math.ceil(gameState.timeRemaining)}s</div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Energy:</span>
                <div className="w-20 h-3 bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                    style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Game Layout with Sidebar */}
          <div className="flex gap-4">
            {/* Game Canvas */}
            <div className="flex-1">
          <div 
            ref={gameAreaRef}
            className={`relative w-full bg-gradient-to-b ${currentLevel?.background} rounded-lg overflow-hidden border-4 border-white shadow-lg cursor-crosshair select-none`}
            style={{ height: `${gameSize.height}px` }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (gameState.charging) {
                setGameState(prev => ({ ...prev, charging: false, chargeTime: 0 }))
              }
            }}
          >
            {/* Sun Character */}
            <motion.div
              className="absolute top-4 w-16 h-16 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-lg flex items-center justify-center text-2xl cursor-pointer"
              style={{ left: gameState.sunX - 32 }}
              animate={{ 
                scale: gameState.charging ? 1 + gameState.chargeTime / 3000 : 1,
                boxShadow: gameState.charging 
                  ? `0 0 ${20 + gameState.chargeTime / 100}px rgba(255, 255, 0, 0.8)`
                  : '0 4px 8px rgba(0,0,0,0.2)'
              }}
              transition={{ duration: 0.1 }}
            >
              😊
            </motion.div>

            {/* Charging indicator */}
            {gameState.charging && (
              <motion.div
                className="absolute top-20 w-32 h-2 bg-white/50 rounded-full overflow-hidden"
                style={{ left: gameState.sunX - 64 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all"
                  style={{ width: `${(gameState.chargeTime / 3000) * 100}%` }}
                />
              </motion.div>
            )}

            {/* Heat Rays */}
            {gameState.heatRays.map(ray => (
              <motion.div
                key={ray.id}
                className="absolute pointer-events-none"
                style={{
                  left: ray.x + (ray.targetX - ray.x) * ray.progress - 10,
                  top: ray.y + (ray.targetY - ray.y) * ray.progress - 10,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: ray.active ? 1 : 0,
                  opacity: ray.active ? 1 : 0
                }}
              >
                <div 
                  className={`w-5 h-5 rounded-full ${
                    ray.type === 'quick' ? 'bg-yellow-400' :
                    ray.type === 'focused' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{
                    boxShadow: `0 0 ${ray.power * 10}px ${
                      ray.type === 'quick' ? 'rgba(255, 255, 0, 0.8)' :
                      ray.type === 'focused' ? 'rgba(255, 165, 0, 0.8)' :
                      'rgba(255, 0, 0, 0.8)'
                    }`
                  }}
                />
              </motion.div>
            ))}

            {/* Water Targets */}
            {gameState.targets.map(target => (
              <motion.div
                key={target.id}
                className="absolute"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size
                }}
                animate={{
                  x: target.pattern === 'bounce' ? [0, 5, 0, -5, 0] : 0,
                  rotate: target.type === 'ice' ? [0, 5, 0, -5, 0] : 0
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div 
                  className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    target.type === 'puddle' ? 'bg-blue-400' :
                    target.type === 'raindrop' ? 'bg-blue-500' :
                    target.type === 'pool' ? 'bg-blue-300' :
                    target.type === 'balloon' ? 'bg-purple-400' :
                    target.type === 'ice' ? 'bg-cyan-200' :
                    'bg-blue-600'
                  }`}
                >
                  {target.type === 'puddle' && '💧'}
                  {target.type === 'raindrop' && '🌧️'}
                  {target.type === 'pool' && '🏊'}
                  {target.type === 'balloon' && '🎈'}
                  {target.type === 'ice' && '🧊'}
                  {target.type === 'dewdrop' && '✨'}
                </div>
                
                {/* Health bar */}
                {target.health < target.maxHealth && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(target.health / target.maxHealth) * 100}%` }}
                    />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Aiming line */}
            {gameState.charging && (
              <svg 
                className="absolute inset-0 pointer-events-none"
                width="100%" 
                height="100%"
              >
                <line
                  x1={gameState.sunX}
                  y1={80}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="rgba(255, 255, 0, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>
            </div>

            {/* Educational Sidebar */}
            <div className="w-80 bg-white/90 rounded-lg p-4 shadow-lg">
              <h3 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
                🧪 Evaporation Log
              </h3>
              
              {gameState.hitTargets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">Hit water targets to learn about evaporation!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gameState.hitTargets.slice().reverse().map((hit, index) => {
                    const config = TARGET_CONFIGS[hit.type]
                    return (
                      <motion.div
                        key={hit.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-400"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {hit.type === 'puddle' && '💧'}
                            {hit.type === 'dewdrop' && '✨'}
                            {hit.type === 'pool' && '🏊'}
                            {hit.type === 'raindrop' && '🌧️'}
                            {hit.type === 'ice' && '🧊'}
                            {hit.type === 'balloon' && '🎈'}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-blue-800 text-sm">
                              {config.name}
                            </div>
                            <div className="text-xs text-green-600 font-bold">
                              +{Math.round(hit.points)} points
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {hit.rayType === 'quick' && '⚡ Quick'}
                            {hit.rayType === 'focused' && '🔥 Focused'}
                            {hit.rayType === 'blast' && '💥 Blast'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 mb-2">
                          {config.description}
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-100 rounded p-2">
                          💡 {config.evaporationFact}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Target Guide */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">🎯 Target Guide</h4>
                <div className="space-y-2">
                  {currentLevel?.targetTypes.map(targetType => {
                    const config = TARGET_CONFIGS[targetType]
                    return (
                      <div key={targetType} className="flex items-center gap-2 text-xs">
                        <span className="text-lg">
                          {targetType === 'puddle' && '💧'}
                          {targetType === 'dewdrop' && '✨'}
                          {targetType === 'pool' && '🏊'}
                        </span>
                        <span className="flex-1 text-gray-600">{config.name}</span>
                        <span className="text-green-600 font-bold">{config.points}pts</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Complete */}
      <AnimatePresence>
        {gameState.status === 'levelComplete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-comic text-2xl font-bold text-green-600 mb-2">
              Level Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              You successfully evaporated all the water targets!
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Final Score: {gameState.score.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mb-2">Best Streak: {gameState.streak}</div>
              <div className="text-sm text-gray-600 mb-2">Energy Efficiency: {Math.round(gameState.energy)}%</div>
              <div className="text-xs text-gray-500 mt-2">🌟 You've mastered ocean evaporation!</div>
            </div>
            <div className="space-y-3">
              <button
                onClick={nextLevel}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Play Again 🔥
              </button>
              <button
                onClick={() => setGameState(prev => ({ ...prev, status: 'menu' }))}
                className="w-full bg-gray-400 text-white font-bold py-2 px-6 rounded-xl hover:bg-gray-500 transition-all"
              >
                Main Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameState.status === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
          >
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="font-comic text-2xl font-bold text-red-600 mb-2">
              Time's Up!
            </h2>
            <p className="text-gray-600 mb-4">
              The water targets got away, but you learned about evaporation!
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Final Score: {gameState.score.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Targets Evaporated: {gameState.streak}</div>
            </div>
            <div className="space-y-3">
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Try Again 🔥
              </button>
              <button
                onClick={() => setGameState(prev => ({ ...prev, status: 'menu' }))}
                className="w-full bg-gray-400 text-white font-bold py-2 px-6 rounded-xl hover:bg-gray-500 transition-all"
              >
                Main Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HeatRayGame
