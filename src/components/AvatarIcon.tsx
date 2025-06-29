import React from 'react'
import { motion } from 'framer-motion'

interface AvatarIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const AvatarIcon: React.FC<AvatarIconProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 p-1 shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center">
        <span className="text-white font-bold text-lg">👦</span>
      </div>
    </motion.div>
  )
}

export default AvatarIcon 