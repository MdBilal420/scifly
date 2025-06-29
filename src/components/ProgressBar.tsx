import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  color?: 'primary' | 'secondary' | 'success' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animate?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  color = 'primary',
  size = 'md',
  showPercentage = true,
  animate = true
}) => {
  const percentage = Math.min((current / total) * 100, 100)
  
  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    accent: 'bg-accent-500'
  }
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-gray-600">
              {current}/{total} {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <motion.div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full relative`}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animate ? 1 : 0, ease: "easeOut" }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={animate ? {
              x: ['-100%', '100%'],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      
      {/* Milestone indicators */}
      {total > 1 && (
        <div className="flex justify-between mt-1">
          {Array.from({ length: total }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index < current ? colorClasses[color] : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProgressBar 