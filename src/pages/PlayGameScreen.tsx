import { motion } from 'framer-motion'
import React, { Suspense, lazy } from 'react'
import UserMenu from '../components/UserMenu'
// Lazy-load the heavy 3D scene to keep initial bundle lean
const WaterCycleQuest3D = lazy(() => import('../components/watercycle3d/WaterCycleQuest3D'))

interface PlayGameScreenProps {
  onNavigate: (screen: string) => void
}

const PlayGameScreen: React.FC<PlayGameScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="p-6 text-sky-700">Loading 3D scene...</div>}>
        <motion.header
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '16px',
          }}
        >
          <motion.button
            className="bg-white/20 backdrop-blur rounded-full p-3"
            onClick={() => onNavigate('activity')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white text-xl">←</span>
          </motion.button>
          
          
          <div className="flex items-center gap-3">
            
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </motion.header>
      
        <WaterCycleQuest3D />
      </Suspense>
    </div>
  )
}

export default PlayGameScreen