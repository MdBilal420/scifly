import React from 'react'
import { motion } from 'framer-motion'

interface SimbaMascotProps {
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}

const SimbaMascot: React.FC<SimbaMascotProps> = ({ size = 'md', animate = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const animations = animate ? {
    animate: {
      y: [0, -5, 0],
      rotate: [0, 1, -1, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {}

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative`}
      {...animations}
    >
      {/* Lion Head */}
      <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 relative overflow-hidden shadow-lg">
        {/* Mane */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 -z-10"></div>
        
        {/* Face */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 relative">
          {/* Eyes */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <motion.div 
              className="w-3 h-3 bg-amber-800 rounded-full relative"
              animate={animate ? { scale: [1, 0.8, 1] } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-0 left-1 w-0.5 h-0.5 bg-white rounded-full"></div>
            </motion.div>
            <motion.div 
              className="w-3 h-3 bg-amber-800 rounded-full relative"
              animate={animate ? { scale: [1, 0.8, 1] } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-0 left-1 w-0.5 h-0.5 bg-white rounded-full"></div>
            </motion.div>
          </div>
          
          {/* Nose */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-pink-600 rounded-full"></div>
          </div>
          
          {/* Mouth */}
          <motion.div 
            className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-2"
            animate={animate ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="w-full h-px bg-amber-800 rounded-full"></div>
            <div className="absolute top-0 left-1 w-1 h-1 border-l border-b border-amber-800 rounded-bl-full"></div>
            <div className="absolute top-0 right-1 w-1 h-1 border-r border-b border-amber-800 rounded-br-full"></div>
          </motion.div>
          
          {/* Whiskers */}
          <div className="absolute top-4 left-0 w-2 h-px bg-amber-800"></div>
          <div className="absolute top-5 left-0 w-1.5 h-px bg-amber-800"></div>
          <div className="absolute top-4 right-0 w-2 h-px bg-amber-800"></div>
          <div className="absolute top-5 right-0 w-1.5 h-px bg-amber-800"></div>
          
          {/* Graduation Cap */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-4 bg-primary-700 rounded-t-lg"></div>
            <div className="absolute -top-1 -right-2 w-1 h-3 bg-secondary-500 rounded-full"></div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-700 rounded-full"></div>
          </div>
          
          {/* Ears */}
          <div className="absolute -top-1 left-2 w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="absolute -top-1 right-2 w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="absolute -top-0.5 left-2.5 w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
          <div className="absolute -top-0.5 right-2.5 w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  )
}

export default SimbaMascot 