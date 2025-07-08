import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SolarSystemSimulationProps {
  userSpeed: number
  onStepComplete?: (step: number) => void
  onComplete?: () => void
}

interface Planet {
  id: string
  name: string
  size: number
  distance: number
  speed: number
  color: string
  icon: string
  description: string
  x: number
  y: number
  angle: number
}

const SolarSystemSimulation: React.FC<SolarSystemSimulationProps> = ({
  userSpeed,
  onStepComplete,
  onComplete
}) => {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [selectedPlanet, setSelectedPlanet] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const animationRef = useRef<number>()

  const planetData: Omit<Planet, 'x' | 'y' | 'angle'>[] = [
    {
      id: 'mercury',
      name: 'Mercury',
      size: 12,
      distance: 60,
      speed: 0.02,
      color: 'bg-gradient-to-br from-gray-400 to-gray-600',
      icon: '☄️',
      description: 'The smallest and closest planet to the Sun'
    },
    {
      id: 'venus',
      name: 'Venus',
      size: 18,
      distance: 90,
      speed: 0.015,
      color: 'bg-gradient-to-br from-yellow-300 to-orange-400',
      icon: '♀️',
      description: 'The hottest planet with thick clouds'
    },
    {
      id: 'earth',
      name: 'Earth',
      size: 20,
      distance: 130,
      speed: 0.012,
      color: 'bg-gradient-to-br from-blue-400 to-green-500',
      icon: '🌍',
      description: 'Our home planet with liquid water'
    },
    {
      id: 'mars',
      name: 'Mars',
      size: 16,
      distance: 170,
      speed: 0.01,
      color: 'bg-gradient-to-br from-red-400 to-red-600',
      icon: '🔴',
      description: 'The red planet with the largest volcano'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      size: 35,
      distance: 220,
      speed: 0.008,
      color: 'bg-gradient-to-br from-orange-300 to-yellow-400',
      icon: '🪐',
      description: 'The largest planet with many moons'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      size: 30,
      distance: 270,
      speed: 0.006,
      color: 'bg-gradient-to-br from-yellow-200 to-orange-300',
      icon: '🪐',
      description: 'The ringed planet with beautiful rings'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      size: 25,
      distance: 320,
      speed: 0.004,
      color: 'bg-gradient-to-br from-cyan-300 to-blue-400',
      icon: '🔵',
      description: 'The ice giant that rotates on its side'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      size: 24,
      distance: 370,
      speed: 0.003,
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      icon: '🔵',
      description: 'The windiest planet with supersonic storms'
    }
  ]

  useEffect(() => {
    // Initialize planets with starting positions
    const initialPlanets = planetData.map((planet, index) => ({
      ...planet,
      angle: (index * 45) * (Math.PI / 180), // Spread planets around the sun
      x: 0,
      y: 0
    }))
    setPlanets(initialPlanets)
  }, [])

  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setPlanets(prevPlanets => 
          prevPlanets.map(planet => {
            const newAngle = planet.angle + planet.speed * userSpeed
            const x = Math.cos(newAngle) * planet.distance
            const y = Math.sin(newAngle) * planet.distance
            
            return {
              ...planet,
              angle: newAngle,
              x,
              y
            }
          })
        )
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, userSpeed])

  const startSimulation = () => {
    setIsAnimating(true)
    setCurrentStep(0)
    if (onStepComplete) onStepComplete(0)
  }

  const pauseSimulation = () => {
    setIsAnimating(false)
  }

  const resetSimulation = () => {
    setIsAnimating(false)
    setSelectedPlanet('')
    setCurrentStep(0)
    const resetPlanets = planetData.map((planet, index) => ({
      ...planet,
      angle: (index * 45) * (Math.PI / 180),
      x: 0,
      y: 0
    }))
    setPlanets(resetPlanets)
  }

  const selectPlanet = (planetId: string) => {
    setSelectedPlanet(planetId)
    const planetIndex = planetData.findIndex(p => p.id === planetId)
    if (planetIndex !== -1) {
      setCurrentStep(planetIndex + 1)
      if (onStepComplete) onStepComplete(planetIndex + 1)
    }
  }

  const showOrbits = () => {
    // This could show orbital paths
    if (onStepComplete) onStepComplete(0)
  }

  const showScale = () => {
    // This could show relative sizes
    if (onStepComplete) onStepComplete(0)
  }

  return (
    <div className="w-full h-full relative">
      {/* Simulation Area */}
      <div className="relative h-[600px] bg-gradient-to-b from-black via-purple-900 to-black rounded-2xl border-4 border-purple-600 overflow-hidden">
        {/* Stars background */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Sun */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full cursor-pointer z-20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedPlanet('sun')
            setCurrentStep(0)
            if (onStepComplete) onStepComplete(0)
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(255, 255, 0, 0.5)',
              '0 0 40px rgba(255, 255, 0, 0.8)',
              '0 0 20px rgba(255, 255, 0, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            ☀️
          </div>
        </motion.div>

        {/* Orbital paths */}
        {planets.map((planet) => (
          <div
            key={`orbit-${planet.id}`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-purple-300/20 rounded-full"
            style={{
              width: planet.distance * 2,
              height: planet.distance * 2
            }}
          />
        ))}

        {/* Planets */}
        <AnimatePresence>
          {planets.map((planet) => (
            <motion.div
              key={planet.id}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${planet.color} rounded-full cursor-pointer z-10 shadow-lg`}
              style={{
                width: planet.size,
                height: planet.size,
                x: planet.x,
                y: planet.y
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => selectPlanet(planet.id)}
              animate={selectedPlanet === planet.id ? {
                boxShadow: [
                  '0 0 10px rgba(255, 255, 255, 0.5)',
                  '0 0 20px rgba(255, 255, 255, 0.8)',
                  '0 0 10px rgba(255, 255, 255, 0.5)'
                ]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs">
                {planet.icon}
              </div>
              
              {/* Planet label */}
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedPlanet === planet.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {planet.name}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Selected planet info */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-bold text-lg mb-2">
                {planets.find(p => p.id === selectedPlanet)?.name}
              </h3>
              <p className="text-sm text-gray-300">
                {planets.find(p => p.id === selectedPlanet)?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSimulation}
          disabled={isAnimating}
        >
          ▶️ Start Orbit
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={pauseSimulation}
          disabled={!isAnimating}
        >
          ⏸️ Pause
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={showOrbits}
        >
          🌌 Show Orbits
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetSimulation}
        >
          🔄 Reset
        </motion.button>
      </div>
    </div>
  )
}

export default SolarSystemSimulation 