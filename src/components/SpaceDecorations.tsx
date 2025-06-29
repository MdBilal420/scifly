import React from 'react'
import { motion } from 'framer-motion'

const SpaceDecorations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Planets */}
      <motion.div
        className="absolute top-20 right-10 w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg floating-3d"
        animate={{ 
          rotate: 360,
          y: [0, -20, 0]
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          boxShadow: '0 10px 25px rgba(220, 38, 127, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' 
        }}
      >
        {/* Mars-like planet */}
        <div className="absolute inset-1 bg-gradient-to-br from-red-300 to-red-500 rounded-full"></div>
        <div className="absolute top-2 left-1 w-2 h-1 bg-red-700 rounded-full opacity-60"></div>
      </motion.div>

      <motion.div
        className="absolute top-40 left-16 w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg"
        animate={{ 
          rotate: -360,
          x: [0, 30, 0],
          y: [0, -15, 0]
        }}
        transition={{ 
          rotate: { duration: 45, repeat: Infinity, ease: "linear" },
          x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Earth-like planet */}
        <div className="absolute inset-1 bg-gradient-to-br from-green-400 to-blue-400 rounded-full">
          <div className="absolute top-1 left-2 w-3 h-2 bg-green-600 rounded-full opacity-70"></div>
          <div className="absolute bottom-2 right-1 w-2 h-1 bg-green-500 rounded-full opacity-60"></div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-20 w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg"
        animate={{ 
          rotate: 360,
          x: [0, -25, 0],
          y: [0, 20, 0]
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          x: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Purple alien planet */}
        <div className="absolute inset-0.5 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full"></div>
      </motion.div>

      {/* Saturn-like planet with rings */}
      <motion.div
        className="absolute top-60 right-32 w-10 h-10"
        animate={{ 
          rotate: 360,
          y: [0, -30, 0]
        }}
        transition={{ 
          rotate: { duration: 50, repeat: Infinity, ease: "linear" },
          y: { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg relative">
          <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full"></div>
          {/* Rings */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-yellow-400 rounded-full opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-yellow-300 rounded-full opacity-30"></div>
        </div>
      </motion.div>

      {/* Shooting stars */}
      <motion.div
        className="absolute top-20 left-0 w-1 h-1 bg-white rounded-full shadow-lg"
        animate={{
          x: ['0vw', '100vw'],
          y: ['20vh', '80vh'],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 7,
          ease: "easeOut"
        }}
      >
        <div className="absolute -left-8 top-0 w-8 h-0.5 bg-gradient-to-r from-transparent to-white opacity-70"></div>
      </motion.div>

      <motion.div
        className="absolute top-40 left-0 w-1 h-1 bg-blue-200 rounded-full shadow-lg"
        animate={{
          x: ['0vw', '100vw'],
          y: ['40vh', '10vh'],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 12,
          ease: "easeOut",
          delay: 5
        }}
      >
        <div className="absolute -left-6 top-0 w-6 h-0.5 bg-gradient-to-r from-transparent to-blue-200 opacity-70"></div>
      </motion.div>

      {/* Cosmic nebula effect */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-radial from-pink-500/20 via-purple-500/10 to-transparent rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
    </div>
  )
}

export default SpaceDecorations 