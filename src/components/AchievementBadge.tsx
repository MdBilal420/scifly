import React from 'react'
import { motion } from 'framer-motion'

interface AchievementBadgeProps {
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
  onClick?: () => void
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  unlocked,
  progress,
  maxProgress,
  onClick
}) => {
  const progressPercentage = (progress / maxProgress) * 100

  return (
    <motion.div
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 achievement-badge-3d ${
        unlocked 
          ? 'bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-300 shadow-lg' 
          : 'bg-gray-100 border-gray-300'
      } ${unlocked ? 'pulse-3d' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div className="flex justify-center mb-3">
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
            unlocked ? 'bg-secondary-200' : 'bg-gray-200'
          }`}
          animate={unlocked ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className={unlocked ? '' : 'grayscale opacity-50'}>{icon}</span>
        </motion.div>
      </div>

      {/* Title */}
      <h3 className={`font-comic font-bold text-center mb-2 ${
        unlocked ? 'text-gray-800' : 'text-gray-500'
      }`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm text-center mb-3 ${
        unlocked ? 'text-gray-600' : 'text-gray-400'
      }`}>
        {description}
      </p>

      {/* Progress Bar */}
      {!unlocked && maxProgress > 1 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <motion.div
            className="bg-primary-500 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Progress Text */}
      {!unlocked && maxProgress > 1 && (
        <p className="text-xs text-gray-500 text-center">
          {progress}/{maxProgress}
        </p>
      )}

      {/* Unlock Effect */}
      {unlocked && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span className="text-white text-sm">✓</span>
        </motion.div>
      )}

      {/* Lock Icon for Locked Badges */}
      {!unlocked && progress === 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">🔒</span>
        </div>
      )}
    </motion.div>
  )
}

export default AchievementBadge 