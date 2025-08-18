import { motion } from 'framer-motion'
import React, { Suspense, lazy, useState } from 'react'
import UserMenu from '../components/UserMenu'
// Lazy-load the heavy 3D scenes to keep initial bundle lean
const WaterCycleQuest3D = lazy(() => import('../components/watercycle3d/WaterCycleQuest3D'))
const HeatRayGame3D = lazy(() => import('../components/games/heatray3d/HeatRayGame3D'))
const CloudCatcher3D = lazy(() => import('../components/games/cloudcatcher/CloudCatcher3D'))

interface PlayGameScreenProps {
  onNavigate: (screen: string) => void
}

type GameType = 'menu' | '3d-quest' | 'heat-ray' | 'cloud-catcher'

const PlayGameScreen: React.FC<PlayGameScreenProps> = ({ onNavigate }) => {
  const [gameType, setGameType] = useState<GameType>('menu')

  if (gameType === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 flex flex-col">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="bg-white/80 backdrop-blur rounded-full p-3 text-gray-800 hover:bg-white/90 transition-all duration-300 shadow-lg"
            onClick={() => onNavigate('activity')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-xl">←</span>
          </motion.button>
          <div>
            <h1 className="font-comic text-2xl font-bold text-gray-800 drop-shadow-lg">Choose Your Water Cycle Game</h1>
            <p className="text-gray-700 text-sm drop-shadow">Pick a game to learn about the water cycle</p>
          </div>
          <UserMenu />
        </motion.header>

        {/* Game Selection */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            
            {/* Heat Ray Game */}
            <motion.div
              className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameType('heat-ray')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-6xl mb-4">☀️🎯</div>
              <h2 className="font-comic text-2xl font-bold text-yellow-600 mb-3">
                3D Heat Ray Target Practice
              </h2>
              <p className="text-gray-700 mb-4">
                Control the sun in immersive 3D to evaporate water targets! Experience evaporation with realistic physics and stunning visuals.
              </p>
              <div className="flex justify-center gap-2 mb-4">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">🎮 3D Action</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">☀️ Evaporation</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">🥽 Immersive</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Focus:</strong> 3D Water Evaporation • <strong>Age:</strong> 6-12 years • <strong>Duration:</strong> 5-10 min
              </div>
            </motion.div>

            {/* Cloud Catcher Game */}
            <motion.div
              className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameType('cloud-catcher')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl mb-4">☁️🌧️</div>
              <h2 className="font-comic text-2xl font-bold text-cyan-600 mb-3">
                Cloud Catcher
              </h2>
              <p className="text-gray-700 mb-4">
                Move a cloud left and right to catch rising vapor! Grow the cloud until it bursts into rainfall to water the world below.
              </p>
              <div className="flex justify-center gap-2 mb-4">
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">☁️ Condensation</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">🌧️ Precipitation</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">⌨️ Keyboard</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Focus:</strong> Condensation + Precipitation • <strong>Age:</strong> 7-12 years • <strong>Duration:</strong> 5-15 min
              </div>
            </motion.div>

            {/* 3D Water Cycle Quest */}
            <motion.div
              className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameType('3d-quest')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-6xl mb-4">🌊🎮</div>
              <h2 className="font-comic text-2xl font-bold text-blue-600 mb-3">
                3D Water Cycle Quest
              </h2>
              <p className="text-gray-700 mb-4">
                Become Drippy the water droplet and experience the complete water cycle journey in immersive 3D!
              </p>
              <div className="flex justify-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">🎮 Adventure</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">🌍 Full Cycle</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">🥽 3D</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong>All Stages:</strong> Complete Water Cycle • <strong>Age:</strong> 8-14 years
              </div>
            </motion.div>

          </div>
        </div>

        {/* Educational Info */}
        <motion.div 
          className="bg-white/80 backdrop-blur border-t border-white/30 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="font-comic text-lg font-bold text-gray-800 mb-2">🎓 Learning Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700">
              <div>
                <strong className="text-yellow-700">Evaporation:</strong> How heat energy transforms water from liquid to gas
              </div>
              <div>
                <strong className="text-cyan-700">Condensation:</strong> How cooling vapor forms droplets and creates clouds
              </div>
              <div>
                <strong className="text-blue-700">Water Cycle:</strong> The continuous movement of water through Earth's systems
              </div>
              <div>
                <strong className="text-purple-700">Science Skills:</strong> Observation, prediction, and cause-and-effect relationships
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl">
            <div className="text-6xl mb-4">🌊</div>
            <div className="text-gray-800 text-xl font-comic">Loading Game...</div>
          </div>
        </div>
      }>
        {gameType === '3d-quest' && <WaterCycleQuest3D />}
        {gameType === 'heat-ray' && <HeatRayGame3D onBackToMenu={() => setGameType('menu')} />}
        {gameType === 'cloud-catcher' && <CloudCatcher3D />}
      </Suspense>
      
      {/* Back button overlay for games */}
      <motion.button
        className="fixed top-6 left-6 bg-white/80 backdrop-blur rounded-full p-3 text-gray-800 hover:bg-white/90 transition-all duration-300 z-50 shadow-lg"
        onClick={() => setGameType('menu')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-xl">←</span>
      </motion.button>
    </div>
  )
}

export default PlayGameScreen