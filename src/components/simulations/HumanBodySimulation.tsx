import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HumanBodySimulationProps {
  userSpeed: number
  onStepComplete?: (step: number) => void
  onComplete?: () => void
}

interface BodyPart {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  icon: string
  description: string
  system: 'circulatory' | 'respiratory' | 'digestive' | 'skeletal'
  isActive: boolean
}

const HumanBodySimulation: React.FC<HumanBodySimulationProps> = ({
  userSpeed,
  onStepComplete,
  onComplete
}) => {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([])
  const [selectedSystem, setSelectedSystem] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [heartRate, setHeartRate] = useState(72)
  const [breathingRate, setBreathingRate] = useState(16)

  const bodyPartsData: BodyPart[] = [
    // Circulatory System
    {
      id: 'heart',
      name: 'Heart',
      x: 250,
      y: 200,
      width: 40,
      height: 30,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      icon: '❤️',
      description: 'Pumps blood throughout the body',
      system: 'circulatory',
      isActive: false
    },
    {
      id: 'lungs',
      name: 'Lungs',
      x: 200,
      y: 180,
      width: 35,
      height: 25,
      color: 'bg-gradient-to-br from-pink-300 to-pink-400',
      icon: '🫁',
      description: 'Exchange oxygen and carbon dioxide',
      system: 'respiratory',
      isActive: false
    },
    {
      id: 'stomach',
      name: 'Stomach',
      x: 250,
      y: 280,
      width: 30,
      height: 20,
      color: 'bg-gradient-to-br from-orange-400 to-orange-500',
      icon: '🍽️',
      description: 'Digests food and absorbs nutrients',
      system: 'digestive',
      isActive: false
    },
    {
      id: 'brain',
      name: 'Brain',
      x: 250,
      y: 120,
      width: 35,
      height: 25,
      color: 'bg-gradient-to-br from-purple-400 to-purple-500',
      icon: '🧠',
      description: 'Controls all body functions',
      system: 'circulatory',
      isActive: false
    },
    {
      id: 'bones',
      name: 'Skeleton',
      x: 250,
      y: 250,
      width: 50,
      height: 80,
      color: 'bg-gradient-to-br from-gray-300 to-gray-400',
      icon: '🦴',
      description: 'Provides structure and protection',
      system: 'skeletal',
      isActive: false
    }
  ]

  React.useEffect(() => {
    setBodyParts(bodyPartsData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startCirculatorySystem = () => {
    setSelectedSystem('circulatory')
    setIsAnimating(true)

    // Animate heart and blood flow
    setBodyParts(prev => prev.map(part => ({
      ...part,
      isActive: part.system === 'circulatory'
    })))

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(0)
    }, 3000)
  }

  const startRespiratorySystem = () => {
    setSelectedSystem('respiratory')
    setIsAnimating(true)

    // Animate lungs and breathing
    setBodyParts(prev => prev.map(part => ({
      ...part,
      isActive: part.system === 'respiratory'
    })))

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(1)
    }, 3000)
  }

  const startDigestiveSystem = () => {
    setSelectedSystem('digestive')
    setIsAnimating(true)

    // Animate digestive process
    setBodyParts(prev => prev.map(part => ({
      ...part,
      isActive: part.system === 'digestive'
    })))

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(2)
    }, 3000)
  }

  const startSkeletalSystem = () => {
    setSelectedSystem('skeletal')
    setIsAnimating(true)

    // Animate skeletal system
    setBodyParts(prev => prev.map(part => ({
      ...part,
      isActive: part.system === 'skeletal'
    })))

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(3)
      if (onComplete) onComplete()
    }, 3000)
  }

  const startFullBodyTour = () => {
    if (isAnimating) return
    
    setSelectedSystem('circulatory')
    setIsAnimating(true)

    // Step 1: Circulatory
    setTimeout(() => startCirculatorySystem(), 500)
    
    // Step 2: Respiratory
    setTimeout(() => {
      setSelectedSystem('respiratory')
      startRespiratorySystem()
    }, 3500)
    
    // Step 3: Digestive
    setTimeout(() => {
      setSelectedSystem('digestive')
      startDigestiveSystem()
    }, 6500)
    
    // Step 4: Skeletal
    setTimeout(() => {
      setSelectedSystem('skeletal')
      startSkeletalSystem()
    }, 9500)
  }

  const resetSimulation = () => {
    setBodyParts(bodyPartsData.map(part => ({ ...part, isActive: false })))
    setSelectedSystem('')
    setIsAnimating(false)
  }

  const selectBodyPart = (partId: string) => {
    const part = bodyParts.find(p => p.id === partId)
    if (part) {
      setSelectedSystem(part.system)
      if (onStepComplete) onStepComplete(bodyPartsData.findIndex(p => p.id === partId))
    }
  }

  return (
    <div className="w-full h-full relative">
      {/* Simulation Area */}
      <div className="relative h-[600px] bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 rounded-2xl border-4 border-blue-600 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute border-l border-gray-400" style={{ left: `${i * 5}%` }}></div>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute border-t border-gray-400" style={{ top: `${i * 8.33}%` }}></div>
          ))}
        </div>

        {/* Human body outline */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Head */}
          <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full border-2 border-pink-400"></div>
          
          {/* Torso */}
          <div className="w-32 h-48 bg-gradient-to-br from-pink-200 to-pink-300 rounded-t-3xl border-2 border-pink-400 mt-2"></div>
          
          {/* Arms */}
          <div className="absolute top-8 -left-8 w-6 h-20 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full border border-pink-400"></div>
          <div className="absolute top-8 -right-8 w-6 h-20 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full border border-pink-400"></div>
          
          {/* Legs */}
          <div className="absolute bottom-0 left-4 w-8 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full border border-pink-400"></div>
          <div className="absolute bottom-0 right-4 w-8 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full border border-pink-400"></div>
        </div>

        {/* Body parts */}
        <AnimatePresence>
          {bodyParts.map((part) => (
            <motion.div
              key={part.id}
              className={`absolute ${part.color} rounded-lg cursor-pointer border-2 border-white shadow-lg`}
              style={{
                left: part.x,
                top: part.y,
                width: part.width,
                height: part.height,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectBodyPart(part.id)}
              animate={part.isActive ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 rgba(59, 130, 246, 0)',
                  '0 0 20px rgba(59, 130, 246, 0.8)',
                  '0 0 0 rgba(59, 130, 246, 0)'
                ]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-lg">
                {part.icon}
              </div>
              
              {/* Part label */}
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedSystem === part.system ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {part.name}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blood flow animation for circulatory system */}
        {selectedSystem === 'circulatory' && isAnimating && (
          <div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                style={{
                  left: 250 + Math.cos(i * 0.8) * 100,
                  top: 200 + Math.sin(i * 0.8) * 80
                }}
                animate={{
                  x: [0, 50, 0],
                  y: [0, -30, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* Breathing animation for respiratory system */}
        {selectedSystem === 'respiratory' && isAnimating && (
          <div className="absolute inset-0">
            <motion.div
              className="absolute w-35 h-25 bg-pink-300/50 rounded-full"
              style={{ left: 200, top: 180 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}

        {/* Selected part info */}
        <AnimatePresence>
          {selectedSystem && (
            <motion.div
              className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-4 max-w-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                {bodyParts.find(p => p.system === selectedSystem)?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {bodyParts.find(p => p.system === selectedSystem)?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vital signs */}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur rounded-lg p-3 space-y-2">
          <div>
            <div className="text-sm font-bold text-gray-800">Heart Rate</div>
            <div className="text-lg font-bold text-red-600">{heartRate} BPM</div>
            <input
              type="range"
              min="60"
              max="120"
              value={heartRate}
              onChange={(e) => setHeartRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="text-sm font-bold text-gray-800">Breathing Rate</div>
            <div className="text-lg font-bold text-blue-600">{breathingRate} breaths/min</div>
            <input
              type="range"
              min="12"
              max="20"
              value={breathingRate}
              onChange={(e) => setBreathingRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFullBodyTour}
          disabled={isAnimating}
        >
          ▶️ Body Tour
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startCirculatorySystem}
          disabled={isAnimating}
        >
          ❤️ Circulatory
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startRespiratorySystem}
          disabled={isAnimating}
        >
          🫁 Respiratory
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startDigestiveSystem}
          disabled={isAnimating}
        >
          🍽️ Digestive
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSkeletalSystem}
          disabled={isAnimating}
        >
          🦴 Skeletal
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

export default HumanBodySimulation 