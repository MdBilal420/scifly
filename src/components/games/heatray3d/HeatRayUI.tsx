import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeatRayStore } from './useHeatRayStore'

interface HeatRayUIProps {
  onBackToMenu?: () => void
}

const HeatRayUI: React.FC<HeatRayUIProps> = ({ onBackToMenu }) => {
  const { state, dispatch, config } = useHeatRayStore()
  
  // Game loop
  useEffect(() => {
    if (state.status !== 'playing') return
    
    let lastTime = Date.now()
    
    const gameLoop = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      // Update game systems
      dispatch({ type: 'UPDATE_TARGETS', deltaTime })
      dispatch({ type: 'UPDATE_HEAT_RAYS', deltaTime })
      dispatch({ type: 'UPDATE_TIMER', deltaTime })
      dispatch({ type: 'REGENERATE_ENERGY', deltaTime })
      
      requestAnimationFrame(gameLoop)
    }
    
    const animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [state.status, dispatch])
  
  const startGame = () => {
    dispatch({ type: 'START_GAME' })
  }
  
  const restartGame = () => {
    dispatch({ type: 'RESTART_GAME' })
  }
  
  return (
    <>
      {/* Game Menu */}
      <AnimatePresence>
        {state.status === 'menu' && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-6xl mb-4">☀️🎯</div>
              <h1 className="font-comic text-3xl font-bold text-yellow-600 mb-2">
                3D Heat Ray Target Practice
              </h1>
              <p className="text-gray-600 mb-6">
                Use the sun's power to evaporate water targets in the center of a beautiful field!
              </p>
              
              <div className="space-y-3 text-sm text-left mb-6 bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-400 rounded-full"></span>
                  <span><strong>WASD:</strong> Move the sun around</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-orange-400 rounded-full"></span>
                  <span><strong>Mouse Move:</strong> Aim with crosshair</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-400 rounded-full"></span>
                  <span><strong>Click:</strong> Fire heat ray at target</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-400 rounded-full"></span>
                  <span><strong>Right Drag:</strong> Rotate camera view</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-purple-400 rounded-full"></span>
                  <span><strong>Targets:</strong> All in center area of field</span>
                </div>
              </div>
              
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Start 3D Adventure! 🔥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game HUD */}
      {state.status === 'playing' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex justify-between items-start">
            {/* Left Panel - Game Stats */}
            <motion.div
              className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">Score:</span>
                  <span className="font-mono">{state.score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">Streak:</span>
                  <span className="font-mono">{state.streak}</span>
                </div>
                {state.chainMultiplier > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">Multiplier:</span>
                    <span className="font-mono">{state.chainMultiplier.toFixed(1)}x</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">Time:</span>
                  <span className="font-mono">{Math.ceil(state.timeRemaining)}s</span>
                </div>
              </div>
              
              {/* Energy Bar */}
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600 font-bold text-xs">Energy:</span>
                  <span className="text-xs font-mono">{Math.round(state.energy)}%</span>
                </div>
                <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                    style={{ width: `${(state.energy / state.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Right Panel - Educational Info */}
            <motion.div
              className="w-80 bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg max-h-96 overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
                🧪 Evaporation Log
              </h3>
              
              {state.hitTargets.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">Evaporate water targets to learn about the science!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.hitTargets.slice().reverse().slice(0, 5).map((hit, index) => {
                    const targetConfig = config[hit.type]
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
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-blue-800 text-sm">
                              {targetConfig.name}
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
                          {targetConfig.description}
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-100 rounded p-2">
                          💡 {targetConfig.evaporationFact}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
              
              {/* Target Guide */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">🎯 Target Guide</h4>
                <div className="space-y-2">
                  {Object.entries(config).filter(([type]) => ['puddle', 'dewdrop', 'pool'].includes(type)).map(([type, targetConfig]) => (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <span className="text-lg">
                        {type === 'puddle' && '💧'}
                        {type === 'dewdrop' && '✨'}
                        {type === 'pool' && '🏊'}
                      </span>
                      <span className="flex-1 text-gray-600">{targetConfig.name}</span>
                      <span className="text-green-600 font-bold">{targetConfig.points}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Level Complete */}
      <AnimatePresence>
        {state.status === 'levelComplete' && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-comic text-2xl font-bold text-green-600 mb-2">
                Water Evaporated!
              </h2>
              <p className="text-gray-600 mb-4">
                You successfully evaporated all water targets in 3D!
              </p>
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Final Score: {state.score.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mb-2">Best Streak: {state.streak}</div>
                <div className="text-sm text-gray-600">Energy Efficiency: {Math.round(state.energy)}%</div>
                <div className="text-xs text-gray-500 mt-2">🌟 You've mastered 3D water evaporation!</div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Play Again 🔥
                </button>
                <button
                  onClick={onBackToMenu || restartGame}
                  className="w-full bg-gray-400 text-white font-bold py-2 px-6 rounded-xl hover:bg-gray-500 transition-all"
                >
                  Main Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game Over */}
      <AnimatePresence>
        {state.status === 'gameOver' && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="font-comic text-2xl font-bold text-red-600 mb-2">
                Time's Up!
              </h2>
              <p className="text-gray-600 mb-4">
                The water targets got away, but you learned about 3D evaporation!
              </p>
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Final Score: {state.score.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Targets Evaporated: {state.streak}</div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Try Again 🔥
                </button>
                <button
                  onClick={onBackToMenu || restartGame}
                  className="w-full bg-gray-400 text-white font-bold py-2 px-6 rounded-xl hover:bg-gray-500 transition-all"
                >
                  Main Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default HeatRayUI
