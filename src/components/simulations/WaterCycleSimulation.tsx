import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WaterCycleSimulationProps {
  userSpeed: number
  onStepComplete?: (step: number) => void
  onComplete?: () => void
}

interface WaterDrop {
  id: number
  x: number
  y: number
  endX: number
  endY: number
  type: 'evaporation' | 'condensation' | 'precipitation' | 'collection'
  opacity: number
}

interface EducationalStep {
  id: number
  name: string
  description: string
  explanation: string
  completed: boolean
}

const WaterCycleSimulation: React.FC<WaterCycleSimulationProps> = ({
  userSpeed,
  onStepComplete,
  onComplete
}) => {
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([])
  const [activeStep, setActiveStep] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [temperature, setTemperature] = useState(25)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [educationalSteps, setEducationalSteps] = useState<EducationalStep[]>([
    {
      id: 0,
      name: "Evaporation",
      description: "Water turns into vapor and rises",
      explanation: "When the sun heats water, it turns into invisible water vapor and rises into the air, just like steam from a hot bath!",
      completed: false
    },
    {
      id: 1,
      name: "Condensation",
      description: "Vapor forms clouds",
      explanation: "As water vapor rises higher, it cools down and turns back into tiny water droplets, forming clouds in the sky!",
      completed: false
    },
    {
      id: 2,
      name: "Precipitation",
      description: "Water falls as rain or snow",
      explanation: "When clouds get too heavy with water droplets, they fall back to Earth as rain, snow, or hail!",
      completed: false
    },
    {
      id: 3,
      name: "Collection",
      description: "Water returns to lakes and oceans",
      explanation: "Rainwater flows into rivers, lakes, and oceans, where it can start the water cycle all over again!",
      completed: false
    }
  ])
  const dropIdRef = useRef(0)

  const createWaterDrop = (type: WaterDrop['type'], startX: number, startY: number, endX: number, endY: number) => {
    const newDrop: WaterDrop = {
      id: dropIdRef.current++,
      x: startX,
      y: startY,
      endX,
      endY,
      type,
      opacity: 1
    }
    
    setWaterDrops(prev => [...prev, newDrop])

    // Remove drop after animation
    setTimeout(() => {
      setWaterDrops(prev => prev.filter(d => d.id !== newDrop.id))
    }, 3000)
  }

  const startEvaporation = () => {
    setActiveStep('evaporation')
    setIsAnimating(true)
    setCurrentStep(0)

    // Create steam-like water drops rising from ocean
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createWaterDrop(
          'evaporation',
          200 + Math.random() * 200,
          500,
          150 + Math.random() * 100,
          200 + Math.random() * 100
        )
      }, i * 300)
    }

    // Mark step as completed
    setTimeout(() => {
      setEducationalSteps(prev => prev.map(step => 
        step.id === 0 ? { ...step, completed: true } : step
      ))
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(0)
    }, 3000)
  }

  const showCondensation = () => {
    setActiveStep('condensation')
    setIsAnimating(true)
    setCurrentStep(1)

    // Create water drops forming clouds
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        createWaterDrop(
          'condensation',
          100 + Math.random() * 300,
          150 + Math.random() * 50,
          120 + Math.random() * 260,
          180 + Math.random() * 30
        )
      }, i * 200)
    }

    setTimeout(() => {
      setEducationalSteps(prev => prev.map(step => 
        step.id === 1 ? { ...step, completed: true } : step
      ))
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(1)
    }, 3000)
  }

  const showPrecipitation = () => {
    setActiveStep('precipitation')
    setIsAnimating(true)
    setCurrentStep(2)

    // Create rain drops falling
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        createWaterDrop(
          'precipitation',
          150 + Math.random() * 200,
          200,
          150 + Math.random() * 200,
          450 + Math.random() * 50
        )
      }, i * 150)
    }

    setTimeout(() => {
      setEducationalSteps(prev => prev.map(step => 
        step.id === 2 ? { ...step, completed: true } : step
      ))
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(2)
    }, 3000)
  }

  const showCollection = () => {
    setActiveStep('collection')
    setIsAnimating(true)
    setCurrentStep(3)

    // Create water drops flowing to ocean
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createWaterDrop(
          'collection',
          100 + Math.random() * 300,
          450,
          200 + Math.random() * 200,
          500
        )
      }, i * 400)
    }

    setTimeout(() => {
      setEducationalSteps(prev => prev.map(step => 
        step.id === 3 ? { ...step, completed: true } : step
      ))
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(3)
      if (onComplete) onComplete()
    }, 3000)
  }

  const startFullCycle = () => {
    if (isAnimating) return
    
    setCurrentStep(0)
    setActiveStep('evaporation')
    setIsAnimating(true)

    // Step 1: Evaporation
    setTimeout(() => startEvaporation(), 500)
    
    // Step 2: Condensation
    setTimeout(() => {
      setCurrentStep(1)
      showCondensation()
    }, 3500)
    
    // Step 3: Precipitation
    setTimeout(() => {
      setCurrentStep(2)
      showPrecipitation()
    }, 6500)
    
    // Step 4: Collection
    setTimeout(() => {
      setCurrentStep(3)
      showCollection()
    }, 9500)
  }

  const resetSimulation = () => {
    setWaterDrops([])
    setCurrentStep(0)
    setActiveStep('')
    setIsAnimating(false)
    setEducationalSteps(prev => prev.map(step => ({ ...step, completed: false })))
    dropIdRef.current = 0
  }

  const getDropColor = (type: WaterDrop['type']) => {
    switch (type) {
      case 'evaporation': return 'bg-gradient-to-r from-blue-300 to-blue-400'
      case 'condensation': return 'bg-gradient-to-r from-gray-300 to-gray-400'
      case 'precipitation': return 'bg-gradient-to-r from-blue-400 to-blue-500'
      case 'collection': return 'bg-gradient-to-r from-blue-500 to-blue-600'
      default: return 'bg-blue-400'
    }
  }

  const currentEducationalStep = educationalSteps[currentStep]

  return (
    <div className="w-full h-full relative">
      {/* Educational Header */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">🌊 The Water Cycle</h2>
        <p className="text-blue-700 text-sm">
          Learn how water moves around our planet! Click on each part to see what happens.
        </p>
      </div>

      {/* Current Step Display */}
      {currentEducationalStep && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-300 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              currentEducationalStep.completed 
                ? 'bg-green-500' 
                : activeStep === currentEducationalStep.name.toLowerCase()
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-400'
            }`}>
              {currentEducationalStep.completed ? '✓' : currentEducationalStep.id + 1}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{currentEducationalStep.name}</h3>
              <p className="text-gray-600">{currentEducationalStep.description}</p>
              {currentEducationalStep.completed && (
                <p className="text-sm text-green-600 mt-1">✓ Completed!</p>
              )}
            </div>
          </div>
          {activeStep === currentEducationalStep.name.toLowerCase() && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-blue-800 text-sm">{currentEducationalStep.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Simulation Area */}
      <div className="relative h-[500px] bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 rounded-2xl border-4 border-blue-600 overflow-hidden">
        {/* Sky gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400"></div>

        {/* Sun - Causes Evaporation */}
        <motion.div
          className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full cursor-pointer z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startEvaporation}
          onMouseEnter={() => setShowTooltip('sun')}
          onMouseLeave={() => setShowTooltip(null)}
          animate={activeStep === 'evaporation' ? { 
            scale: [1, 1.2, 1],
            boxShadow: ['0 0 0 rgba(255, 255, 0, 0)', '0 0 20px rgba(255, 255, 0, 0.8)', '0 0 0 rgba(255, 255, 0, 0)']
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            ☀️
          </div>
          {/* Sun Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-100 px-2 py-1 rounded text-xs font-bold text-yellow-800 border border-yellow-300">
            SUN
          </div>
        </motion.div>

        {/* Tooltip for Sun */}
        {showTooltip === 'sun' && (
          <div className="absolute top-24 right-8 bg-white p-3 rounded-lg shadow-lg border-2 border-yellow-300 z-20 max-w-48">
            <h4 className="font-bold text-yellow-800 mb-1">☀️ The Sun</h4>
            <p className="text-sm text-gray-700">
              The sun provides heat energy that makes water evaporate from lakes, rivers, and oceans!
            </p>
          </div>
        )}

        {/* Clouds - Show Condensation */}
        <motion.div
          className="absolute top-16 left-8 w-24 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={showCondensation}
          onMouseEnter={() => setShowTooltip('cloud1')}
          onMouseLeave={() => setShowTooltip(null)}
          animate={activeStep === 'condensation' ? { 
            scale: [1, 1.1, 1],
            boxShadow: ['0 0 0 rgba(128, 128, 128, 0)', '0 0 15px rgba(128, 128, 128, 0.6)', '0 0 0 rgba(128, 128, 128, 0)']
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            ☁️
          </div>
          {/* Cloud Label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-800 border border-gray-300">
            CLOUD
          </div>
        </motion.div>

        <motion.div
          className="absolute top-20 left-32 w-20 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={showCondensation}
          onMouseEnter={() => setShowTooltip('cloud2')}
          onMouseLeave={() => setShowTooltip(null)}
          animate={activeStep === 'condensation' ? { 
            scale: [1, 1.1, 1],
            boxShadow: ['0 0 0 rgba(128, 128, 128, 0)', '0 0 15px rgba(128, 128, 128, 0.6)', '0 0 0 rgba(128, 128, 128, 0)']
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            ☁️
          </div>
        </motion.div>

        {/* Rain Cloud - Shows Precipitation */}
        <motion.div
          className="absolute top-12 left-20 w-28 h-14 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={showPrecipitation}
          onMouseEnter={() => setShowTooltip('raincloud')}
          onMouseLeave={() => setShowTooltip(null)}
          animate={activeStep === 'precipitation' ? { 
            scale: [1, 1.1, 1],
            boxShadow: ['0 0 0 rgba(128, 128, 128, 0)', '0 0 15px rgba(128, 128, 128, 0.6)', '0 0 0 rgba(128, 128, 128, 0)']
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            🌧️
          </div>
          {/* Rain Cloud Label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-800 border border-gray-300">
            RAIN CLOUD
          </div>
        </motion.div>

        {/* Tooltip for Clouds */}
        {showTooltip === 'cloud1' || showTooltip === 'cloud2' && (
          <div className="absolute top-32 left-8 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-300 z-20 max-w-48">
            <h4 className="font-bold text-gray-800 mb-1">☁️ Clouds</h4>
            <p className="text-sm text-gray-700">
              Water vapor cools down and forms tiny water droplets that create clouds in the sky!
            </p>
          </div>
        )}

        {/* Tooltip for Rain Cloud */}
        {showTooltip === 'raincloud' && (
          <div className="absolute top-28 left-20 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-300 z-20 max-w-48">
            <h4 className="font-bold text-gray-800 mb-1">🌧️ Rain Cloud</h4>
            <p className="text-sm text-gray-700">
              When clouds get too heavy with water, they release it as rain, snow, or hail!
            </p>
          </div>
        )}

        {/* Ocean - Water Collection */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={showCollection}
          onMouseEnter={() => setShowTooltip('ocean')}
          onMouseLeave={() => setShowTooltip(null)}
          animate={activeStep === 'collection' ? { 
            scale: [1, 1.02, 1],
            boxShadow: ['0 0 0 rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.6)', '0 0 0 rgba(59, 130, 246, 0)']
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🌊
          </div>
          {/* Ocean Label */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-100 px-2 py-1 rounded text-xs font-bold text-blue-800 border border-blue-300">
            OCEAN
          </div>
        </motion.div>

        {/* Tooltip for Ocean */}
        {showTooltip === 'ocean' && (
          <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg border-2 border-blue-300 z-20 max-w-48">
            <h4 className="font-bold text-blue-800 mb-1">🌊 Ocean</h4>
            <p className="text-sm text-gray-700">
              Rainwater flows back into oceans, lakes, and rivers, ready to start the cycle again!
            </p>
          </div>
        )}

        {/* Mountains - Land features */}
        <div className="absolute bottom-32 left-0 right-0">
          <div className="w-32 h-20 bg-gradient-to-t from-gray-600 to-gray-400 transform rotate-12 ml-8"></div>
          <div className="w-24 h-16 bg-gradient-to-t from-gray-600 to-gray-400 transform -rotate-6 ml-32"></div>
          <div className="w-28 h-18 bg-gradient-to-t from-gray-600 to-gray-400 transform rotate-8 ml-48"></div>
        </div>

        {/* River - Water flow */}
        <motion.div
          className="absolute bottom-32 left-16 w-2 h-20 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full"
          animate={activeStep === 'collection' ? { 
            scaleY: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        ></motion.div>

        {/* Animated Water Drops */}
        <AnimatePresence>
          {waterDrops.map((drop) => (
            <motion.div
              key={drop.id}
              className={`absolute w-2 h-2 rounded-full ${getDropColor(drop.type)} shadow-lg`}
              style={{
                left: drop.x,
                top: drop.y,
              }}
              animate={{
                x: drop.endX - drop.x,
                y: drop.endY - drop.y,
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration: 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </AnimatePresence>

        {/* Temperature Control */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 border-2 border-orange-200">
          <div className="text-sm font-bold text-gray-800">🌡️ Temperature</div>
          <div className="text-lg font-bold text-red-600">{temperature}°C</div>
          <input
            type="range"
            min="0"
            max="40"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full mt-2"
          />
          <div className="text-xs text-gray-600 mt-1">
            Higher temperature = faster evaporation!
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mt-6 space-y-4">
        {/* Step-by-step Controls */}
        <div className="flex justify-center gap-2 flex-wrap">
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-bold shadow-lg text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={startEvaporation}
            disabled={isAnimating}
          >
            ☀️ Step 1: Evaporation
          </motion.button>
          
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-bold shadow-lg text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={showCondensation}
            disabled={isAnimating}
          >
            ☁️ Step 2: Condensation
          </motion.button>
          
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-bold shadow-lg text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPrecipitation}
            disabled={isAnimating}
          >
            🌧️ Step 3: Precipitation
          </motion.button>
          
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={showCollection}
            disabled={isAnimating}
          >
            🌊 Step 4: Collection
          </motion.button>
        </div>

        {/* Main Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={startFullCycle}
            disabled={isAnimating}
          >
            ▶️ Start Full Water Cycle
          </motion.button>
          
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-bold shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSimulation}
            disabled={isAnimating}
          >
            🔄 Reset & Start Over
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default WaterCycleSimulation 