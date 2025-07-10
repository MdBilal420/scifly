import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ForcesMotionSimulationProps {
  userSpeed: number
  onStepComplete?: (step: number) => void
  onComplete?: () => void
}

interface Object {
  id: number
  x: number
  y: number
  velocityX: number
  velocityY: number
  mass: number
  type: 'ball' | 'block' | 'car'
  friction: number
  isMoving: boolean
}

const ForcesMotionSimulation: React.FC<ForcesMotionSimulationProps> = ({
  //userSpeed,
  onStepComplete,
  onComplete
}) => {
  const [objects, setObjects] = useState<Object[]>([])
  const [activeExperiment, setActiveExperiment] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [gravity, setGravity] = useState(9.8)
  const [friction, setFriction] = useState(0.1)
  const [inclinedAngle, setInclinedAngle] = useState(15)
  const objectIdRef = useRef(0)

  // const createObject = (type: Object['type'], x: number, y: number, mass: number = 1) => {
  //   const newObject: Object = {
  //     id: objectIdRef.current++,
  //     x,
  //     y,
  //     velocityX: 0,
  //     velocityY: 0,
  //     mass,
  //     type,
  //     friction: friction,
  //     isMoving: false
  //   }
    
  //   setObjects(prev => [...prev, newObject])
  //   return newObject.id
  // }

  const startGravityExperiment = () => {
    setActiveExperiment('gravity')
    setIsAnimating(true)
    setObjects([])

    // Start falling animation
    setTimeout(() => {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        isMoving: true,
        velocityY: gravity * 0.1
      })))
    }, 1000)

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(0)
    }, 4000)
  }

  const startFrictionExperiment = () => {
    setActiveExperiment('friction')
    setIsAnimating(true)
    setObjects([])

    // Apply different friction coefficients
    setTimeout(() => {
      setObjects(prev => prev.map((obj, index) => ({
        ...obj,
        friction: [0.05, 0.2, 0.4][index],
        isMoving: true,
        velocityX: 5
      })))
    }, 1000)

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(1)
    }, 4000)
  }

  const startInclinedPlaneExperiment = () => {
    setActiveExperiment('inclined')
    setIsAnimating(true)
    setObjects([])

    // Create object on inclined plane
    //const block = createObject('block', 100, 200, 2)

    setTimeout(() => {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        isMoving: true,
        velocityX: Math.sin(inclinedAngle * Math.PI / 180) * gravity * 0.1,
        velocityY: Math.cos(inclinedAngle * Math.PI / 180) * gravity * 0.1
      })))
    }, 1000)

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(2)
    }, 4000)
  }

  const startPendulumExperiment = () => {
    setActiveExperiment('pendulum')
    setIsAnimating(true)
    setObjects([])

    // Create pendulum
    //const ball = createObject('ball', 300, 100, 1)

    setTimeout(() => {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        isMoving: true,
        velocityX: 3
      })))
    }, 1000)

    setTimeout(() => {
      setIsAnimating(false)
      if (onStepComplete) onStepComplete(3)
      if (onComplete) onComplete()
    }, 4000)
  }

  const startFullExperiment = () => {
    if (isAnimating) return
    
    setActiveExperiment('gravity')
    setIsAnimating(true)

    // Step 1: Gravity
    setTimeout(() => startGravityExperiment(), 500)
    
    // Step 2: Friction
    setTimeout(() => {
      setActiveExperiment('friction')
      startFrictionExperiment()
    }, 4500)
    
    // Step 3: Inclined Plane
    setTimeout(() => {
      setActiveExperiment('inclined')
      startInclinedPlaneExperiment()
    }, 8500)
    
    // Step 4: Pendulum
    setTimeout(() => {
      setActiveExperiment('pendulum')
      startPendulumExperiment()
    }, 12500)
  }

  const resetSimulation = () => {
    setObjects([])
    setActiveExperiment('')
    setIsAnimating(false)
    objectIdRef.current = 0
  }

  const getObjectStyle = (obj: Object) => {
    const baseStyle = {
      width: obj.type === 'ball' ? 20 : 30,
      height: obj.type === 'ball' ? 20 : 20,
      borderRadius: obj.type === 'ball' ? '50%' : '4px',
      backgroundColor: obj.type === 'ball' ? '#3B82F6' : '#10B981',
      position: 'absolute' as const,
      left: obj.x,
      top: obj.y,
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }

    if (obj.isMoving) {
      return {
        ...baseStyle,
        transition: 'all 0.1s ease-out'
      }
    }

    return baseStyle
  }

  return (
    <div className="w-full h-full relative">
      {/* Simulation Area */}
      <div className="relative h-[600px] bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 rounded-2xl border-4 border-blue-600 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute border-l border-gray-400" style={{ left: `${i * 5}%` }}></div>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute border-t border-gray-400" style={{ top: `${i * 8.33}%` }}></div>
          ))}
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-600 to-green-500"></div>

        {/* Inclined plane */}
        {activeExperiment === 'inclined' && (
          <motion.div
            className="absolute bottom-20 left-0 w-80 h-2 bg-gradient-to-r from-gray-600 to-gray-400"
            style={{
              transform: `rotate(-${inclinedAngle}deg)`,
              transformOrigin: 'left bottom'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Friction surfaces */}
        {activeExperiment === 'friction' && (
          <div className="absolute bottom-20 left-0 right-0">
            <div className="h-8 bg-gradient-to-r from-green-400 to-green-500 opacity-60"></div>
            <div className="h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-60"></div>
            <div className="h-8 bg-gradient-to-r from-red-400 to-red-500 opacity-60"></div>
          </div>
        )}

        {/* Pendulum support */}
        {activeExperiment === 'pendulum' && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Objects */}
        <AnimatePresence>
          {objects.map((obj) => (
            <motion.div
              key={obj.id}
              style={getObjectStyle(obj)}
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                x: obj.isMoving ? obj.x + obj.velocityX * 50 : obj.x,
                y: obj.isMoving ? obj.y + obj.velocityY * 50 : obj.y
              }}
              transition={{ duration: 0.5 }}
            >
              {obj.type === 'ball' && <div className="text-xs text-white text-center">●</div>}
              {obj.type === 'block' && <div className="text-xs text-white text-center">■</div>}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Force vectors */}
        {activeExperiment === 'gravity' && objects.some(obj => obj.isMoving) && (
          <div className="absolute inset-0">
            {objects.map((obj) => (
              <motion.div
                key={`force-${obj.id}`}
                className="absolute w-1 h-8 bg-red-500"
                style={{
                  left: obj.x,
                  top: obj.y + 15,
                  transform: 'translateX(-50%)'
                }}
                animate={{ height: [32, 40, 32] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        )}

        {/* Controls panel */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur rounded-lg p-3 space-y-2">
          <div>
            <div className="text-sm font-bold text-gray-800">Gravity</div>
            <input
              type="range"
              min="1"
              max="20"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-600">{gravity} m/s²</div>
          </div>
          
          <div>
            <div className="text-sm font-bold text-gray-800">Friction</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={friction}
              onChange={(e) => setFriction(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-600">{friction}</div>
          </div>

          {activeExperiment === 'inclined' && (
            <div>
              <div className="text-sm font-bold text-gray-800">Angle</div>
              <input
                type="range"
                min="0"
                max="45"
                value={inclinedAngle}
                onChange={(e) => setInclinedAngle(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-600">{inclinedAngle}°</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFullExperiment}
          disabled={isAnimating}
        >
          ▶️ Start Experiments
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGravityExperiment}
          disabled={isAnimating}
        >
          ⬇️ Gravity
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFrictionExperiment}
          disabled={isAnimating}
        >
          🛑 Friction
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startInclinedPlaneExperiment}
          disabled={isAnimating}
        >
          📐 Inclined Plane
        </motion.button>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startPendulumExperiment}
          disabled={isAnimating}
        >
          🕰️ Pendulum
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

export default ForcesMotionSimulation 