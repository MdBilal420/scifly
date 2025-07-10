import React from 'react'
import { motion } from 'framer-motion'

interface DynamicBackgroundProps {
  theme: 'space' | 'forest' | 'ocean' | 'weather' | 'laboratory' | 'human-body' | 'earth'
  children: React.ReactNode
}

const SpaceBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Stars */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
    <div className="absolute inset-0" style={{
      backgroundImage: `
        radial-gradient(2px 2px at 20% 30%, #fff, transparent),
        radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.8), transparent),
        radial-gradient(1px 1px at 90% 40%, #fff, transparent),
        radial-gradient(1px 1px at 60% 10%, #fff, transparent),
        radial-gradient(2px 2px at 10% 80%, rgba(255,255,255,0.9), transparent)
      `,
      backgroundSize: '550px 400px, 350px 300px, 250px 200px, 150px 100px, 400px 350px'
    }} />
    
    {/* Planets */}
    <motion.div
      className="absolute top-20 right-16 w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full"
      animate={{ rotate: 360, y: [0, -20, 0] }}
      transition={{ rotate: { duration: 30, repeat: Infinity }, y: { duration: 6, repeat: Infinity } }}
    />
    <motion.div
      className="absolute top-40 left-20 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"
      animate={{ rotate: -360, x: [0, 15, 0] }}
      transition={{ rotate: { duration: 25, repeat: Infinity }, x: { duration: 8, repeat: Infinity } }}
    />
  </div>
)

const ForestBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-700 to-emerald-800" />
    
    {/* Animated leaves */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      >
        <div className="text-2xl opacity-70">
          {['🍃', '🌿', '🍀'][Math.floor(Math.random() * 3)]}
        </div>
      </motion.div>
    ))}

    {/* Tree silhouettes */}
    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-900 to-transparent" />
    <motion.div
      className="absolute bottom-0 left-10 w-16 h-24 bg-green-900 opacity-60"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </div>
)

const OceanBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-800" />
    
    {/* Water waves */}
    <motion.div
      className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-600 to-transparent opacity-50"
      animate={{ x: [-20, 20, -20] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    
    {/* Bubbles */}
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-4 bg-cyan-200 rounded-full opacity-30"
        style={{
          left: `${Math.random() * 100}%`,
          bottom: `${Math.random() * 60}%`,
        }}
        animate={{ y: [-100, -200], opacity: [0.3, 0] }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      />
    ))}

    {/* Fish */}
    <motion.div
      className="absolute top-1/3 text-4xl"
      animate={{ x: ['100vw', '-100px'] }}
      transition={{ duration: 8, repeat: Infinity, delay: 2 }}
    >
      🐠
    </motion.div>
  </div>
)

const WeatherBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-blue-600 to-cyan-500" />
    
    {/* Clouds */}
    <motion.div
      className="absolute top-20 left-10 text-6xl opacity-80"
      animate={{ x: [0, 50, 0] }}
      transition={{ duration: 8, repeat: Infinity }}
    >
      ☁️
    </motion.div>
    <motion.div
      className="absolute top-32 right-16 text-4xl opacity-60"
      animate={{ x: [0, -30, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
    >
      ⛅
    </motion.div>

    {/* Rain */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-8 bg-blue-300 opacity-70"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 20}%`,
        }}
        animate={{ y: ['0vh', '100vh'] }}
        transition={{
          duration: 1 + Math.random() * 0.5,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}

    {/* Lightning */}
    <motion.div
      className="absolute top-16 right-1/4 text-3xl"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5 }}
    >
      ⚡
    </motion.div>
  </div>
)

const LaboratoryBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900" />
    
    {/* Scientific elements */}
    <motion.div
      className="absolute top-20 left-16 text-3xl"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      ⚛️
    </motion.div>
    
    <motion.div
      className="absolute top-40 right-20 text-2xl"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🧪
    </motion.div>

    <motion.div
      className="absolute bottom-32 left-12 text-2xl"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      🔬
    </motion.div>

    {/* Floating particles */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-purple-300 rounded-full opacity-60"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
)

const HumanBodyBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-pink-800 to-rose-900" />
    
    {/* Heartbeat visualization */}
    <motion.div
      className="absolute top-20 left-1/4 text-4xl"
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      ❤️
    </motion.div>

    {/* Body system icons */}
    <motion.div
      className="absolute top-32 right-16 text-2xl"
      animate={{ rotate: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🧠
    </motion.div>

    <motion.div
      className="absolute bottom-40 left-20 text-2xl"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      🫁
    </motion.div>

    {/* Flowing particles (blood cells) */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 bg-red-400 rounded-full opacity-70"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
)

const EarthBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900" />
    
    {/* Mountains */}
    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-stone-800 to-transparent" />
    <motion.div
      className="absolute bottom-0 left-0 w-32 h-32 bg-stone-700"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-40 h-40 bg-stone-600"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />

    {/* Geological elements */}
    <motion.div
      className="absolute top-20 right-20 text-3xl"
      animate={{ rotate: [0, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      🌋
    </motion.div>

    <motion.div
      className="absolute top-40 left-16 text-2xl"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🏔️
    </motion.div>

    {/* Floating dust particles */}
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-40"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      />
    ))}
  </div>
)

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ theme, children }) => {
  const renderBackground = () => {
    switch (theme) {
      case 'space':
        return <SpaceBackground />
      case 'forest':
        return <ForestBackground />
      case 'ocean':
        return <OceanBackground />
      case 'weather':
        return <WeatherBackground />
      case 'laboratory':
        return <LaboratoryBackground />
      case 'human-body':
        return <HumanBodyBackground />
      case 'earth':
        return <EarthBackground />
      default:
        return <SpaceBackground />
    }
  }

  return (
    <div className="relative min-h-screen">
      {renderBackground()}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default DynamicBackground 