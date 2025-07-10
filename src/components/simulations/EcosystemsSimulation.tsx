import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EcosystemsSimulationProps {
  userSpeed: number
  onStepComplete?: (step: number) => void
  onComplete?: () => void
}

interface Organism {
  id: number
  type: 'plant' | 'herbivore' | 'carnivore' | 'decomposer'
  name: string
  x: number
  y: number
  size: number
  color: string
  icon: string
  energy: number
  isAlive: boolean
  isMoving: boolean
}

const EcosystemsSimulation: React.FC<EcosystemsSimulationProps> = ({
  userSpeed,
  onStepComplete,
  onComplete
}) => {
  const [organisms, setOrganisms] = useState<Organism[]>([])
  const [activeStep, setActiveStep] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [environment, setEnvironment] = useState<'forest' | 'ocean' | 'desert'>('forest')
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'cloudy'>('sunny')
  const organismIdRef = useRef(0)

  const createOrganism = (type: Organism['type'], x: number, y: number, name: string) => {
    const organism: Organism = {
      id: organismIdRef.current++,
      type,
      name,
      x,
      y,
      size: type === 'plant' ? 20 : type === 'herbivore' ? 25 : type === 'carnivore' ? 30 : 15,
      color: type === 'plant' ? 'bg-green-500' : 
             type === 'herbivore' ? 'bg-yellow-500' : 
             type === 'carnivore' ? 'bg-red-500' : 'bg-brown-500',
      icon: type === 'plant' ? '🌱' : 
            type === 'herbivore' ? '🦌' : 
            type === 'carnivore' ? '🐺' : '🦠',
      energy: 100,
      isAlive: true,
      isMoving: false
    }
    
    setOrganisms(prev => [...prev, organism])
    return organism.id
  }

  const startFoodChain = () => {
    setActiveStep('foodchain')
    setIsAnimating(true)
    setOrganisms([])

    // Create plants
    for (let i = 0; i < 5; i++) {
      createOrganism('plant', 100 + i * 80, 400, 'Grass')
    }

    // Create herbivores
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        createOrganism('herbivore', 150 + i * 100, 350, 'Deer')
      }
    }, 1000)

    // Create carnivores
    setTimeout(() => {
      for (let i = 0; i < 2; i++) {
        createOrganism('carnivore', 200 + i * 120, 300, 'Wolf')
      }
    }, 2000)

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(0)
    }, 4000)
  }

  const showPredatorPrey = () => {
    setActiveStep('predatorprey')
    setIsAnimating(true)

    // Animate hunting behavior
    setOrganisms(prev => prev.map(org => ({
      ...org,
      isMoving: org.type === 'carnivore' || org.type === 'herbivore'
    })))

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(1)
    }, 3000)
  }

  const showEnergyFlow = () => {
    setActiveStep('energyflow')
    setIsAnimating(true)

    // Show energy transfer
    setOrganisms(prev => prev.map(org => ({
      ...org,
      energy: org.type === 'plant' ? 100 : 
              org.type === 'herbivore' ? 80 : 
              org.type === 'carnivore' ? 60 : 40
    })))

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(2)
    }, 3000)
  }

  const showDecomposition = () => {
    setActiveStep('decomposition')
    setIsAnimating(true)

    // Add decomposers
    for (let i = 0; i < 4; i++) {
      createOrganism('decomposer', 120 + i * 60, 450, 'Bacteria')
    }

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(3)
      if (onComplete) onComplete()
    }, 3000)
  }

  const startFullEcosystem = () => {
    if (isAnimating) return
    
    setActiveStep('foodchain')
    setIsAnimating(true)

    // Step 1: Food Chain
    setTimeout(() => startFoodChain(), 500)
    
    // Step 2: Predator-Prey
    setTimeout(() => {
      setActiveStep('predatorprey')
      showPredatorPrey()
    }, 4500)
    
    // Step 3: Energy Flow
    setTimeout(() => {
      setActiveStep('energyflow')
      showEnergyFlow()
    }, 7500)
    
    // Step 4: Decomposition
    setTimeout(() => {
      setActiveStep('decomposition')
      showDecomposition()
    }, 10500)
  }

  const resetSimulation = () => {
    setOrganisms([])
    setActiveStep('')
    setIsAnimating(false)
    organismIdRef.current = 0
  }

  const changeEnvironment = (newEnv: 'forest' | 'ocean' | 'desert') => {
    setEnvironment(newEnv)
    resetSimulation()
  }

  const changeWeather = (newWeather: 'sunny' | 'rainy' | 'cloudy') => {
    setWeather(newWeather)
  }

  const getEnvironmentBackground = () => {
    switch (environment) {
      case 'forest': return 'bg-gradient-to-b from-green-300 via-green-400 to-green-500'
      case 'ocean': return 'bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500'
      case 'desert': return 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500'
      default: return 'bg-gradient-to-b from-green-300 via-green-400 to-green-500'
    }
  }

  const getWeatherEffect = () => {
    switch (weather) {
      case 'rainy': return '🌧️'
      case 'cloudy': return '☁️'
      case 'sunny': return '☀️'
      default: return '☀️'
    }
  }

  return (
    <div className="w-full h-full relative">
      {/* Simulation Area */}
      <div className={`relative h-[600px] ${getEnvironmentBackground()} rounded-2xl border-4 border-green-600 overflow-hidden`}>
        {/* Weather effect */}
        <div className="absolute top-4 right-4 text-4xl">
          {getWeatherEffect()}
        </div>

        {/* Environment-specific elements */}
        {environment === 'forest' && (
          <div className="absolute inset-0">
            {/* Trees */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-16 bg-gradient-to-t from-brown-600 to-green-600 rounded-full"
                style={{
                  left: 50 + i * 80,
                  bottom: 20,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        )}

        {environment === 'ocean' && (
          <div className="absolute inset-0">
            {/* Ocean waves */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 bg-blue-400/50 rounded-full"
                style={{
                  left: i * 60,
                  bottom: 20 + i * 10,
                  width: 40 + i * 10
                }}
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}

        {environment === 'desert' && (
          <div className="absolute inset-0">
            {/* Sand dunes */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-32 h-8 bg-yellow-400 rounded-full"
                style={{
                  left: i * 100,
                  bottom: 20 + i * 5,
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </div>
        )}

        {/* Organisms */}
        <AnimatePresence>
          {organisms.map((organism) => (
            <motion.div
              key={organism.id}
              className={`absolute ${organism.color} rounded-full cursor-pointer border-2 border-white shadow-lg`}
              style={{
                left: organism.x,
                top: organism.y,
                width: organism.size,
                height: organism.size,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={organism.isMoving ? {
                x: [0, 20, -20, 0],
                y: [0, -10, 10, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-lg">
                {organism.icon}
              </div>
              
              {/* Energy bar */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-300 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${organism.energy}%` }}
                />
              </div>
              
              {/* Organism label */}
              <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeStep === 'foodchain' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {organism.name}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Food chain arrows */}
        {activeStep === 'foodchain' && organisms.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none">
            {organisms.filter(org => org.type === 'herbivore').map((herbivore, index) => {
              const plant = organisms.find(org => org.type === 'plant' && org.x < herbivore.x)
              if (plant) {
                return (
                  <motion.line
                    key={`arrow-${index}`}
                    x1={plant.x + 10}
                    y1={plant.y}
                    x2={herbivore.x - 10}
                    y2={herbivore.y}
                    stroke="green"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                )
              }
              return null
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="green" />
              </marker>
            </defs>
          </svg>
        )}

        {/* Environment controls */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur rounded-lg p-3 space-y-2">
          <div>
            <div className="text-sm font-bold text-gray-800">Environment</div>
            <select
              value={environment}
              onChange={(e) => changeEnvironment(e.target.value as any)}
              className="w-full text-xs p-1 rounded border"
            >
              <option value="forest">🌲 Forest</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="desert">🏜️ Desert</option>
            </select>
          </div>
          
          <div>
            <div className="text-sm font-bold text-gray-800">Weather</div>
            <select
              value={weather}
              onChange={(e) => changeWeather(e.target.value as any)}
              className="w-full text-xs p-1 rounded border"
            >
              <option value="sunny">☀️ Sunny</option>
              <option value="cloudy">☁️ Cloudy</option>
              <option value="rainy">🌧️ Rainy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFullEcosystem}
          disabled={isAnimating}
        >
          ▶️ Start Ecosystem
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFoodChain}
          disabled={isAnimating}
        >
          🌱 Food Chain
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={showPredatorPrey}
          disabled={isAnimating}
        >
          🐺 Predator-Prey
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={showEnergyFlow}
          disabled={isAnimating}
        >
          ⚡ Energy Flow
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-brown-500 to-brown-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={showDecomposition}
          disabled={isAnimating}
        >
          🦠 Decomposition
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetSimulation}
          disabled={isAnimating}
        >
          🔄 Reset
        </motion.button>
      </div>
    </div>
  )
}

export default EcosystemsSimulation 