import React from 'react'
import { motion } from 'framer-motion'

interface SimbaMascotProps {
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}

const SimbaMascot: React.FC<SimbaMascotProps> = ({ size = 'md', animate = true, className = '' }) => {
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  }

  const animations = animate ? {
    animate: {
      y: [0, -8, 0],
      rotate: [0, 2, -2, 0],
      scale: [1, 1.05, 1],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {}

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} select-none`}
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
      }}
      {...animations}
    >
      🦁
    </motion.div>
  )
}

export default SimbaMascot 