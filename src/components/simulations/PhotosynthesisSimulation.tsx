import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotosynthesisSimulationProps {
  userSpeed: number
  onStepComplete?: (step: number) => void
  onComplete?: () => void
}

interface Particle {
  id: number
  type: 'sunlight' | 'co2' | 'water' | 'oxygen' | 'glucose'
  x: number
  y: number
  endX: number
  endY: number
  opacity: number
  scale: number
}

const PhotosynthesisSimulation: React.FC<PhotosynthesisSimulationProps> = ({
  userSpeed,
  onStepComplete,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [activeInfo, setActiveInfo] = useState<string>('')
  const simulationRef = useRef<HTMLDivElement>(null)
  const particleIdRef = useRef(0)

  const steps = [
    { name: 'Sunlight', description: 'Energy from the sun' },
    { name: 'CO₂ Absorption', description: 'Carbon dioxide from air' },
    { name: 'Water Uptake', description: 'Water from soil' },
    { name: 'Photosynthesis', description: 'Making food in leaves' },
    { name: 'Outputs', description: 'Glucose and oxygen' }
  ]

  const createParticle = (type: Particle['type'], startX: number, startY: number, endX: number, endY: number) => {
    const newParticle: Particle = {
      id: particleIdRef.current++,
      type,
      x: startX,
      y: startY,
      endX,
      endY,
      opacity: 1,
      scale: 1
    }
    
    setParticles(prev => [...prev, newParticle])

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id))
    }, 2000)
  }

  const startSunlight = () => {
    setActiveInfo('sunlight')
    setIsAnimating(true)

    // Create sunlight particles moving to leaves
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createParticle('sunlight', 450, 60, 300 + Math.random() * 100, 250 + Math.random() * 100)
      }, i * 200)
    }

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(0)
    }, 3000)
  }

  const showCO2Absorption = () => {
    setActiveInfo('co2')
    setIsAnimating(true)

    // Create CO2 particles moving to leaves
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createParticle('co2', 90, 130, 250 + Math.random() * 100, 200 + Math.random() * 100)
      }, i * 300)
    }

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(1)
    }, 2500)
  }

  const showWaterUptake = () => {
    setActiveInfo('water')
    setIsAnimating(true)

    // Create water particles moving to roots then up to leaves
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createParticle('water', 550, 480, 350, 450) // to roots
        setTimeout(() => {
          createParticle('water', 350, 450, 320, 250) // up to leaves
        }, 500)
      }, i * 400)
    }

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(2)
    }, 3000)
  }

  const showPhotosynthesis = () => {
    setActiveInfo('photosynthesis')
    setIsAnimating(true)

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(3)
    }, 2000)
  }

  const showOutputs = () => {
    setActiveInfo('outputs')
    setIsAnimating(true)

    // Create oxygen particles from leaves
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        createParticle('oxygen', 300 + Math.random() * 100, 200 + Math.random() * 100, 100 + Math.random() * 200, 50 + Math.random() * 100)
      }, i * 200)
    }

    // Create glucose particles moving to stem/roots
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createParticle('glucose', 300 + Math.random() * 100, 200 + Math.random() * 100, 350, 350 + Math.random() * 50)
      }, i * 250)
    }

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(4)
      if (onComplete) onComplete()
    }, 3000)
  }

  const startFullProcess = () => {
    if (isAnimating) return
    
    setCurrentStep(0)
    setActiveInfo('sunlight')
    setIsAnimating(true)

    // Step 1: Sunlight
    setTimeout(() => startSunlight(), 500)
    
    // Step 2: CO2 absorption
    setTimeout(() => {
      setCurrentStep(1)
      showCO2Absorption()
    }, 3500)
    
    // Step 3: Water uptake
    setTimeout(() => {
      setCurrentStep(2)
      showWaterUptake()
    }, 6000)
    
    // Step 4: Photosynthesis
    setTimeout(() => {
      setCurrentStep(3)
      showPhotosynthesis()
    }, 9000)
    
    // Step 5: Outputs
    setTimeout(() => {
      setCurrentStep(4)
      showOutputs()
    }, 11000)
  }

  const resetSimulation = () => {
    setParticles([])
    setCurrentStep(0)
    setActiveInfo('')
    setIsAnimating(false)
    particleIdRef.current = 0
  }

  const getParticleColor = (type: Particle['type']) => {
    switch (type) {
      case 'sunlight': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'co2': return 'bg-gradient-to-r from-gray-500 to-gray-600'
      case 'water': return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'oxygen': return 'bg-gradient-to-r from-green-400 to-green-500'
      case 'glucose': return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="w-full h-full relative">
      {/* Simulation Area */}
      <div 
        ref={simulationRef}
        className="relative h-[600px] bg-gradient-to-b from-blue-300 via-blue-300 to-green-300 rounded-2xl border-4 border-green-600 overflow-hidden"
      >
        {/* Sun */}
        <motion.div
          className="absolute top-5 right-8 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full cursor-pointer z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSunlight}
          animate={activeInfo === 'sunlight' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            ☀️
          </div>
        </motion.div>

        {/* CO2 Source */}
        <motion.div
          className="absolute top-24 left-12 w-20 h-16 bg-gradient-to-br from-purple-200 to-gray-300 rounded-lg cursor-pointer flex items-center justify-center text-sm font-bold text-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={showCO2Absorption}
          animate={activeInfo === 'co2' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          CO₂
        </motion.div>

        {/* Water Source */}
        <motion.div
          className="absolute bottom-5 right-12 w-24 h-16 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg cursor-pointer flex items-center justify-center text-white font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={showWaterUptake}
          animate={activeInfo === 'water' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          💧
        </motion.div>

        {/* Plant */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          {/* Main Stem */}
          <motion.div
            className="w-6 h-40 bg-gradient-to-b from-green-700 via-green-600 to-green-800 rounded-full mx-auto relative"
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.05, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Stem texture lines */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-32 bg-green-800 rounded-full opacity-30"></div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 h-24 bg-green-800 rounded-full opacity-20"></div>
          </motion.div>

          {/* Branch 1 - Left */}
          <motion.div
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-4 h-16 bg-gradient-to-b from-green-600 to-green-700 rounded-full"
            style={{ transform: 'rotate(-25deg) translateX(-8px)' }}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 15px rgba(34, 197, 94, 0.6)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          ></motion.div>

          {/* Branch 2 - Right */}
          <motion.div
            className="absolute top-24 left-1/2 transform -translate-x-1/2 w-4 h-14 bg-gradient-to-b from-green-600 to-green-700 rounded-full"
            style={{ transform: 'rotate(30deg) translateX(8px)' }}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 15px rgba(34, 197, 94, 0.6)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          ></motion.div>

          {/* Branch 3 - Upper Left */}
          <motion.div
            className="absolute top-8 left-1/2 transform -translate-x-1/2 w-3 h-12 bg-gradient-to-b from-green-600 to-green-700 rounded-full"
            style={{ transform: 'rotate(-35deg) translateX(-12px)' }}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 12px rgba(34, 197, 94, 0.5)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          ></motion.div>

          {/* Branch 4 - Upper Right */}
          <motion.div
            className="absolute top-12 left-1/2 transform -translate-x-1/2 w-3 h-10 bg-gradient-to-b from-green-600 to-green-700 rounded-full"
            style={{ transform: 'rotate(40deg) translateX(12px)' }}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 12px rgba(34, 197, 94, 0.5)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          ></motion.div>

          {/* Leaves - Main Stem */}
          <motion.div
            className="absolute top-16 left-1/2 transform -translate-x-1/2 w-20 h-14 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full cursor-pointer"
            style={{ transform: 'rotate(-20deg) translateX(-25px)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPhotosynthesis}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.15, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Leaf vein */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-green-700 rounded-full opacity-40"></div>
          </motion.div>

          <motion.div
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-18 h-12 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full cursor-pointer"
            style={{ transform: 'rotate(25deg) translateX(25px)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPhotosynthesis}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.15, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Leaf vein */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-green-700 rounded-full opacity-40"></div>
          </motion.div>

          {/* Leaves - Upper Branches */}
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-10 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full cursor-pointer"
            style={{ transform: 'rotate(-30deg) translateX(-35px)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPhotosynthesis}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.15, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 18px rgba(34, 197, 94, 0.7)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Leaf vein */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-green-700 rounded-full opacity-40"></div>
          </motion.div>

          <motion.div
            className="absolute top-8 left-1/2 transform -translate-x-1/2 w-14 h-8 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full cursor-pointer"
            style={{ transform: 'rotate(35deg) translateX(35px)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPhotosynthesis}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.15, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 18px rgba(34, 197, 94, 0.7)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Leaf vein */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-5 bg-green-700 rounded-full opacity-40"></div>
          </motion.div>

          {/* Additional smaller leaves */}
          <motion.div
            className="absolute top-28 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full cursor-pointer"
            style={{ transform: 'rotate(-15deg) translateX(-20px)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPhotosynthesis}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 15px rgba(34, 197, 94, 0.6)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-green-700 rounded-full opacity-40"></div>
          </motion.div>

          <motion.div
            className="absolute top-32 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full cursor-pointer"
            style={{ transform: 'rotate(20deg) translateX(20px)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={showPhotosynthesis}
            animate={activeInfo === 'photosynthesis' ? { 
              scale: [1, 1.1, 1],
              boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 15px rgba(34, 197, 94, 0.6)', '0 0 0 rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-green-700 rounded-full opacity-40"></div>
          </motion.div>

          {/* Flower */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full cursor-pointer"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={showOutputs}
            animate={activeInfo === 'outputs' ? { 
              scale: [1, 1.3, 1],
              boxShadow: ['0 0 0 rgba(236, 72, 153, 0)', '0 0 20px rgba(236, 72, 153, 0.8)', '0 0 0 rgba(236, 72, 153, 0)']
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Flower center */}
            <div className="absolute inset-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
            {/* Petals */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-yellow-300 rounded-full"></div>
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-6 h-3 bg-yellow-300 rounded-full"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-yellow-300 rounded-full"></div>
            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-6 h-3 bg-yellow-300 rounded-full"></div>
          </motion.div>

          {/* Roots System */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            {/* Main root */}
            <motion.div
              className="w-4 h-12 bg-gradient-to-t from-brown-700 to-brown-800 rounded-full mx-auto cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={showWaterUptake}
              animate={activeInfo === 'water' ? { 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 rgba(160, 82, 45, 0)', '0 0 15px rgba(160, 82, 45, 0.6)', '0 0 0 rgba(160, 82, 45, 0)']
              } : {}}
              transition={{ duration: 0.3 }}
            ></motion.div>

            {/* Side roots */}
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3 h-8 bg-gradient-to-t from-brown-700 to-brown-800 rounded-full"
              style={{ transform: 'rotate(-25deg) translateX(-8px)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={showWaterUptake}
              animate={activeInfo === 'water' ? { 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 rgba(160, 82, 45, 0)', '0 0 12px rgba(160, 82, 45, 0.5)', '0 0 0 rgba(160, 82, 45, 0)']
              } : {}}
              transition={{ duration: 0.3 }}
            ></motion.div>

            <motion.div
              className="absolute top-6 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-brown-700 to-brown-800 rounded-full"
              style={{ transform: 'rotate(30deg) translateX(8px)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={showWaterUptake}
              animate={activeInfo === 'water' ? { 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 rgba(160, 82, 45, 0)', '0 0 12px rgba(160, 82, 45, 0.5)', '0 0 0 rgba(160, 82, 45, 0)']
              } : {}}
              transition={{ duration: 0.3 }}
            ></motion.div>

            <motion.div
              className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-t from-brown-700 to-brown-800 rounded-full"
              style={{ transform: 'rotate(-40deg) translateX(-12px)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={showWaterUptake}
              animate={activeInfo === 'water' ? { 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 rgba(160, 82, 45, 0)', '0 0 10px rgba(160, 82, 45, 0.4)', '0 0 0 rgba(160, 82, 45, 0)']
              } : {}}
              transition={{ duration: 0.3 }}
            ></motion.div>

            <motion.div
              className="absolute top-10 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-t from-brown-700 to-brown-800 rounded-full"
              style={{ transform: 'rotate(45deg) translateX(12px)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={showWaterUptake}
              animate={activeInfo === 'water' ? { 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 rgba(160, 82, 45, 0)', '0 0 10px rgba(160, 82, 45, 0.4)', '0 0 0 rgba(160, 82, 45, 0)']
              } : {}}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        </div>

        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={`absolute w-2 h-2 rounded-full ${getParticleColor(particle.type)} shadow-lg`}
              style={{
                left: particle.x,
                top: particle.y,
              }}
              animate={{
                x: particle.endX - particle.x,
                y: particle.endY - particle.y,
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration: 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFullProcess}
          disabled={isAnimating}
        >
          ▶️ Start Photosynthesis
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={showCO2Absorption}
          disabled={isAnimating}
        >
          📥 Show Inputs
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={showOutputs}
          disabled={isAnimating}
        >
          📤 Show Outputs
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

export default PhotosynthesisSimulation 