import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateTopicProgress } from '../features/progress/progressSlice'
import PrimaryButton from '../components/PrimaryButton'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import SimbaMascot from '../components/SimbaMascot'
import { MdArrowBack } from 'react-icons/md'
import PhotosynthesisSimulation from '../components/simulations/PhotosynthesisSimulation'
import SolarSystemSimulation from '../components/simulations/SolarSystemSimulation'
import WaterCycleSimulation from '../components/simulations/WaterCycleSimulation'
import ForcesMotionSimulation from '../components/simulations/ForcesMotionSimulation'
import HumanBodySimulation from '../components/simulations/HumanBodySimulation'
import EcosystemsSimulation from '../components/simulations/EcosystemsSimulation'

interface SimulationScreenProps {
  onNavigate: (screen: string) => void
}

const SimulationScreen: React.FC<SimulationScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch()
  const { currentTopic } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)
  
  const [isRunning, setIsRunning] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Redirect if no topic selected
  if (!currentTopic) {
    // Use setTimeout to avoid navigation during render
    setTimeout(() => onNavigate('activity'), 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔬</div>
          <p className="text-gray-600">Loading simulation...</p>
        </div>
      </div>
    )
  }

  const userSpeed = currentUser?.learningSpeed || 3

  // Get simulation configuration based on topic
  const getSimulationConfig = () => {
    if (!currentTopic?.title) {
      return {
        title: 'Science Simulator',
        description: 'Interactive exploration of scientific concepts',
        icon: '🔬',
        steps: [
          { name: 'Observation', description: 'Watch and learn' },
          { name: 'Experiment', description: 'Try different settings' },
          { name: 'Analysis', description: 'Understand the results' },
          { name: 'Conclusion', description: 'What did you discover?' }
        ]
      }
    }
    
    switch (currentTopic.title.toLowerCase()) {
      case 'solar system & space':
      case 'solar-system':
        return {
          title: 'Solar System Explorer',
          description: 'Explore the planets and their orbits',
          icon: '🌌',
          steps: [
            { name: 'Sun', description: 'The center of our solar system' },
            { name: 'Mercury', description: 'The closest planet to the Sun' },
            { name: 'Venus', description: 'The hottest planet' },
            { name: 'Earth', description: 'Our home planet' },
            { name: 'Mars', description: 'The red planet' },
            { name: 'Jupiter', description: 'The largest planet' },
            { name: 'Saturn', description: 'The ringed planet' },
            { name: 'Uranus', description: 'The ice giant' },
            { name: 'Neptune', description: 'The windiest planet' }
          ]
        }
      case 'ecosystems & environment':
      case 'ecosystems':
        return {
          title: 'Ecosystem Builder',
          description: 'Create and observe food chains',
          icon: '🌿',
          steps: [
            { name: 'Plants', description: 'Producers that make their own food' },
            { name: 'Herbivores', description: 'Animals that eat plants' },
            { name: 'Carnivores', description: 'Animals that eat other animals' },
            { name: 'Decomposers', description: 'Break down dead organisms' }
          ]
        }
      case 'water cycle & weather':
      case 'water-cycle':
        return {
          title: 'Weather Simulator',
          description: 'Experiment with temperature and pressure',
          icon: '🌤️',
          steps: [
            { name: 'Temperature', description: 'How hot or cold it is' },
            { name: 'Pressure', description: 'Air pressure affects weather' },
            { name: 'Humidity', description: 'Amount of water in the air' },
            { name: 'Wind', description: 'Movement of air' }
          ]
        }
      case 'plants & photosynthesis':
      case 'plants-photosynthesis':
        return {
          title: 'Photosynthesis Simulation',
          description: 'Explore the process of photosynthesis',
          icon: '🌞',
          steps: [
            { name: 'Light', description: 'The energy source for photosynthesis' },
            { name: 'Water', description: 'The reactant in photosynthesis' },
            { name: 'Carbon Dioxide', description: 'The reactant in photosynthesis' },
            { name: 'Glucose', description: 'The product of photosynthesis' }
          ]
        }
      default:
        return {
          title: 'Science Simulator',
          description: 'Interactive exploration of scientific concepts',
          icon: '🔬',
          steps: [
            { name: 'Observation', description: 'Watch and learn' },
            { name: 'Experiment', description: 'Try different settings' },
            { name: 'Analysis', description: 'Understand the results' },
            { name: 'Conclusion', description: 'What did you discover?' }
          ]
        }
    }
  }

  const config = getSimulationConfig()

  const handleStartSimulation = () => {
    setIsRunning(true)
    setSimulationStep(0)
    setIsComplete(false)
  }

  const handlePauseSimulation = () => {
    setIsRunning(false)
  }

  const handleResetSimulation = () => {
    setIsRunning(false)
    setSimulationStep(0)
    setIsComplete(false)
  }

  const handleNextStep = () => {
    if (simulationStep < config.steps.length - 1) {
      setSimulationStep(simulationStep + 1)
    } else {
      setIsComplete(true)
      setIsRunning(false)
      
      // Update progress
      if (currentUser && currentTopic) {
        dispatch(updateTopicProgress({
          userId: currentUser.id,
          topicId: currentTopic.id,
          progressData: {
            progress_percentage: 100,
            completed: true
          }
        }))
      }
    }
  }

  // Show completion screen
  if (isComplete && currentTopic) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen p-4">
          <div className="max-w-md mx-auto pt-8">
            <motion.div
              className="bg-white/95 backdrop-blur rounded-3xl p-8 text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 3 }}
              >
                🎉
              </motion.div>
              
              <h2 className="font-comic text-2xl font-bold text-gray-800 mb-4">
                Simulation Complete!
              </h2>
              
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-4 mb-4">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  {config.steps.length} Steps Explored
                </div>
                <p className="text-gray-600">Great job exploring {currentTopic.title}!</p>
              </div>

              <div className="flex justify-center mb-6">
                <SimbaMascot size="md" animate={true} />
              </div>

              <div className="space-y-3">
                <PrimaryButton
                  onClick={() => {
                    handleResetSimulation()
                    handleStartSimulation()
                  }}
                  className="w-full"
                  icon="🔄"
                  variant="secondary"
                >
                  Run Simulation Again
                </PrimaryButton>

                <PrimaryButton
                  onClick={() => onNavigate('activity')}
                  className="w-full"
                  icon="🎯"
                >
                  Try Another Activity
                </PrimaryButton>
                
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-500 text-sm underline w-full text-center"
                >
                  Go Home
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  // Safety check for currentTopic
  if (!currentTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔬</div>
          <p className="text-gray-600">Loading simulation...</p>
        </div>
      </div>
    )
  }

  return (
    <DynamicBackground theme={currentTopic.backgroundTheme}>
      <div className="min-h-screen p-4">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              className="bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300"
              onClick={() => onNavigate('activity')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {(MdArrowBack as any)({ style: { display: 'inline', fontSize: '20px' } })}
            </motion.button>
            
            <div>
              <h1 className="font-comic text-2xl font-bold text-white">
                {config.title}
              </h1>
              <p className="text-white/80 text-sm">
                {config.description} • Speed {userSpeed}
              </p>
            </div>
          </div>
          
          <UserMenu />
        </motion.header>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Simulation */}
          <motion.div
            className="bg-white/10 backdrop-blur rounded-3xl p-6 flex flex-col"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{config.icon}</div>
              <h2 className="font-comic text-lg font-bold text-white mb-1">
                {config.steps[simulationStep]?.name || 'Step'}
              </h2>
              <p className="text-white/70 text-sm">
                {config.steps[simulationStep]?.description || 'Explore and learn'}
              </p>
            </div>

            {/* Simulation Canvas */}
            <div className="flex-1 bg-white/5 backdrop-blur rounded-2xl p-4 mb-4 min-h-0">
              {currentTopic?.title?.toLowerCase() === 'plants & photosynthesis' || currentTopic?.title?.toLowerCase() === 'plants-photosynthesis' ? (
                <PhotosynthesisSimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 4) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser && currentTopic) {
                        dispatch(updateTopicProgress({
                          userId: currentUser.id,
                          topicId: currentTopic.id,
                          progressData: {
                            progress_percentage: 100,
                            completed: true
                          }
                        }))
                      }
                    }
                  }}
                  onComplete={() => {
                    setIsComplete(true)
                    setIsRunning(false)
                  }}
                />
              ) : currentTopic?.title?.toLowerCase() === 'solar system & space' || currentTopic?.title?.toLowerCase() === 'solar-system' ? (
                <SolarSystemSimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 8) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser && currentTopic) {
                        dispatch(updateTopicProgress({
                          userId: currentUser.id,
                          topicId: currentTopic.id,
                          progressData: {
                            progress_percentage: 100,
                            completed: true
                          }
                        }))
                      }
                    }
                  }}
                  onComplete={() => {
                    setIsComplete(true)
                    setIsRunning(false)
                  }}
                />
              ) : currentTopic?.title?.toLowerCase() === 'water cycle & weather' || currentTopic?.title?.toLowerCase() === 'water-cycle' ? (
                <WaterCycleSimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 3) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser && currentTopic) {
                        dispatch(updateTopicProgress({
                          userId: currentUser.id,
                          topicId: currentTopic.id,
                          progressData: {
                            progress_percentage: 100,
                            completed: true
                          }
                        }))
                      }
                    }
                  }}
                  onComplete={() => {
                    setIsComplete(true)
                    setIsRunning(false)
                  }}
                />
              ) : currentTopic?.title?.toLowerCase() === 'forces & motion' || currentTopic?.title?.toLowerCase() === 'forces-motion' ? (
                <ForcesMotionSimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 3) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser && currentTopic) {
                        dispatch(updateTopicProgress({
                          userId: currentUser.id,
                          topicId: currentTopic.id,
                          progressData: {
                            progress_percentage: 100,
                            completed: true
                          }
                        }))
                      }
                    }
                  }}
                  onComplete={() => {
                    setIsComplete(true)
                    setIsRunning(false)
                  }}
                />
              ) : currentTopic?.title?.toLowerCase() === 'human body systems' || currentTopic?.title?.toLowerCase() === 'human-body' ? (
                <HumanBodySimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 3) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser && currentTopic) {
                        dispatch(updateTopicProgress({
                          userId: currentUser.id,
                          topicId: currentTopic.id,
                          progressData: {
                            progress_percentage: 100,
                            completed: true
                          }
                        }))
                      }
                    }
                  }}
                  onComplete={() => {
                    setIsComplete(true)
                    setIsRunning(false)
                  }}
                />
              ) : currentTopic?.title?.toLowerCase() === 'ecosystems & environment' || currentTopic?.title?.toLowerCase() === 'ecosystems' ? (
                <EcosystemsSimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 3) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser && currentTopic) {
                        dispatch(updateTopicProgress({
                          userId: currentUser.id,
                          topicId: currentTopic.id,
                          progressData: {
                            progress_percentage: 100,
                            completed: true
                          }
                        }))
                      }
                    }
                  }}
                  onComplete={() => {
                    setIsComplete(true)
                    setIsRunning(false)
                  }}
                />
              ) : (
                <div className="text-center h-full flex items-center justify-center">
                  <div>
                    <div className="text-4xl mb-4">🔬</div>
                    <p className="text-white/60 text-sm">
                      Interactive simulation coming soon!
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      This will include hands-on experiments and visual models
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <PrimaryButton
                  onClick={handleStartSimulation}
                  icon="▶️"
                  className="px-6 text-sm"
                >
                  Start
                </PrimaryButton>
              ) : (
                <>
                  <PrimaryButton
                    onClick={handlePauseSimulation}
                    icon="⏸️"
                    variant="secondary"
                    className="px-4 text-sm"
                  >
                    Pause
                  </PrimaryButton>
                  
                  <PrimaryButton
                    onClick={handleNextStep}
                    icon="⏭️"
                    className="px-4 text-sm"
                  >
                    Next
                  </PrimaryButton>
                </>
              )}
              
              <PrimaryButton
                onClick={handleResetSimulation}
                icon="🔄"
                variant="secondary"
                className="px-4 text-sm"
              >
                Reset
              </PrimaryButton>
            </div>
          </motion.div>

          {/* Right Side - Educational Content */}
          <motion.div
            className="bg-white/10 backdrop-blur rounded-3xl p-6 flex flex-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-4">
              <h2 className="font-comic text-xl font-bold text-white mb-2">
                📚 Learning Content
              </h2>
              <p className="text-white/70 text-sm">
                Explore the science behind {currentTopic.title}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Topic-specific educational content */}
              {currentTopic.title.toLowerCase() === 'plants & photosynthesis' || currentTopic.title.toLowerCase() === 'plants-photosynthesis' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-3">🔬 How Photosynthesis Works</h3>
                    
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-3 mb-3 text-center">
                      <div className="text-sm font-bold text-gray-800">
                        6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Plants are amazing food factories!</strong> They use sunlight, carbon dioxide from the air, and water from the soil to make their own food (glucose) and release oxygen for us to breathe.
                    </p>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☀️</span>
                        <span><strong>Sunlight:</strong> Provides energy for the process</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌿</span>
                        <span><strong>Leaves:</strong> Contain chlorophyll (green pigment)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💨</span>
                        <span><strong>CO₂:</strong> Absorbed from air through stomata</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💧</span>
                        <span><strong>Water:</strong> Absorbed by roots from soil</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍯</span>
                        <span><strong>Glucose:</strong> Plant food (sugar)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌬️</span>
                        <span><strong>Oxygen:</strong> Released for us to breathe</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">🌱 Why Photosynthesis Matters</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Food Chain Base:</strong> Plants are the foundation of most food chains</p>
                      <p>• <strong>Oxygen Production:</strong> Plants produce the oxygen we breathe</p>
                      <p>• <strong>Carbon Cycle:</strong> Plants help regulate Earth's carbon dioxide levels</p>
                      <p>• <strong>Energy Source:</strong> Fossil fuels come from ancient plants</p>
                    </div>
                  </div>
                </div>
              ) : currentTopic.title.toLowerCase() === 'solar system & space' || currentTopic.title.toLowerCase() === 'solar-system' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">🪐 Our Solar System</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Our solar system is a vast cosmic neighborhood!</strong> It contains the Sun, eight planets, moons, asteroids, comets, and other celestial objects all held together by gravity.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☀️</span>
                        <span><strong>Sun:</strong> The star at the center of our solar system</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪐</span>
                        <span><strong>Planets:</strong> Eight worlds orbiting the Sun</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌙</span>
                        <span><strong>Moons:</strong> Natural satellites orbiting planets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☄️</span>
                        <span><strong>Asteroids:</strong> Rocky objects in the asteroid belt</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">🌍 Planet Types</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Terrestrial:</strong> Rocky planets (Mercury, Venus, Earth, Mars)</p>
                      <p>• <strong>Gas Giants:</strong> Large planets made of gas (Jupiter, Saturn)</p>
                      <p>• <strong>Ice Giants:</strong> Cold gas planets (Uranus, Neptune)</p>
                      <p>• <strong>Dwarf Planets:</strong> Smaller objects like Pluto</p>
                    </div>
                  </div>
                </div>
              ) : currentTopic.title.toLowerCase() === 'water cycle & weather' || currentTopic.title.toLowerCase() === 'water-cycle' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">💧 The Water Cycle</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Water is constantly moving around our planet!</strong> The water cycle describes how water evaporates from the surface, forms clouds, falls as precipitation, and returns to the surface.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☀️</span>
                        <span><strong>Evaporation:</strong> Sun heats water into vapor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">☁️</span>
                        <span><strong>Condensation:</strong> Water vapor forms clouds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌧️</span>
                        <span><strong>Precipitation:</strong> Water falls as rain/snow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌊</span>
                        <span><strong>Collection:</strong> Water returns to oceans/lakes</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">🌤️ Weather Factors</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Temperature:</strong> How hot or cold the air is</p>
                      <p>• <strong>Humidity:</strong> Amount of water vapor in the air</p>
                      <p>• <strong>Pressure:</strong> Weight of air pressing down</p>
                      <p>• <strong>Wind:</strong> Movement of air from high to low pressure</p>
                    </div>
                  </div>
                </div>
              ) : currentTopic.title.toLowerCase() === 'forces & motion' || currentTopic.title.toLowerCase() === 'forces-motion' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                    <h3 className="text-lg font-bold text-red-800 mb-3">⚡ Forces & Motion</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Forces make things move and change!</strong> Understanding forces helps us explain how everything from falling apples to rocket launches works.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⬇️</span>
                        <span><strong>Gravity:</strong> Pulls objects toward Earth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🛑</span>
                        <span><strong>Friction:</strong> Slows down moving objects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📐</span>
                        <span><strong>Inclined Plane:</strong> Makes work easier</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🕰️</span>
                        <span><strong>Pendulum:</strong> Swings back and forth</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
                    <h3 className="text-lg font-bold text-yellow-800 mb-3">🔧 Simple Machines</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Lever:</strong> Uses a fulcrum to lift heavy objects</p>
                      <p>• <strong>Pulley:</strong> Changes direction of force</p>
                      <p>• <strong>Wheel & Axle:</strong> Reduces friction for movement</p>
                      <p>• <strong>Inclined Plane:</strong> Makes lifting easier</p>
                    </div>
                  </div>
                </div>
              ) : currentTopic.title.toLowerCase() === 'human body systems' || currentTopic.title.toLowerCase() === 'human-body' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-pink-200">
                    <h3 className="text-lg font-bold text-pink-800 mb-3">🫀 Human Body Systems</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Your body is an amazing machine!</strong> Different systems work together to keep you healthy, moving, and alive.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">❤️</span>
                        <span><strong>Circulatory:</strong> Pumps blood throughout body</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🫁</span>
                        <span><strong>Respiratory:</strong> Brings oxygen to cells</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍽️</span>
                        <span><strong>Digestive:</strong> Breaks down food for energy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🦴</span>
                        <span><strong>Skeletal:</strong> Provides structure and protection</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">💪 Staying Healthy</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Exercise:</strong> Keeps muscles and heart strong</p>
                      <p>• <strong>Good Nutrition:</strong> Provides energy and building blocks</p>
                      <p>• <strong>Rest:</strong> Allows body to repair and grow</p>
                      <p>• <strong>Hygiene:</strong> Prevents illness and infection</p>
                    </div>
                  </div>
                </div>
              ) : currentTopic.title.toLowerCase() === 'ecosystems & environment' || currentTopic.title.toLowerCase() === 'ecosystems' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-3">🌍 Ecosystems</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Ecosystems are communities of living things!</strong> All organisms in an ecosystem depend on each other and their environment to survive.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌱</span>
                        <span><strong>Producers:</strong> Plants that make their own food</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🦌</span>
                        <span><strong>Consumers:</strong> Animals that eat other organisms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🦠</span>
                        <span><strong>Decomposers:</strong> Break down dead organisms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span><strong>Energy Flow:</strong> Moves through food chains</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">🛡️ Environmental Protection</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Reduce Waste:</strong> Use less and recycle more</p>
                      <p>• <strong>Conserve Energy:</strong> Turn off lights and electronics</p>
                      <p>• <strong>Protect Habitats:</strong> Don't disturb wildlife homes</p>
                      <p>• <strong>Plant Trees:</strong> Help clean the air</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border-2 border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-800 mb-3">📖 About {currentTopic.title}</h3>
                    <p className="text-gray-700 text-sm">
                      This topic explores the fascinating world of {currentTopic.title.toLowerCase()}. 
                      Use the simulation on the left to interact with the concepts and see how they work in real-time!
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
                    <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 Learning Tips</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Observe:</strong> Watch how the simulation responds to your actions</p>
                      <p>• <strong>Experiment:</strong> Try different settings and see what happens</p>
                      <p>• <strong>Question:</strong> Ask yourself "why" things happen the way they do</p>
                      <p>• <strong>Connect:</strong> Think about how this relates to the real world</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Mascot */}
        <motion.div
          className="fixed bottom-6 right-6 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <SimbaMascot size="md" animate={true} />
        </motion.div>
      </div>
    </DynamicBackground>
  )
}

export default SimulationScreen 
