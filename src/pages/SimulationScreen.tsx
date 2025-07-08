import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateTopicProgress } from '../features/progress/progressSlice'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import SimbaMascot from '../components/SimbaMascot'
import { MdArrowBack } from 'react-icons/md'
import PhotosynthesisSimulation from '../components/simulations/PhotosynthesisSimulation'

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
    onNavigate('activity')
    return null
  }

  const userSpeed = currentUser?.learningSpeed || 3

  // Get simulation configuration based on topic
  const getSimulationConfig = () => {
    switch (currentTopic.title.toLowerCase()) {
      case 'solar system':
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
      case 'weather patterns':
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
      if (currentUser) {
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
  if (isComplete) {
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

        {/* Progress */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressBar
            current={simulationStep + 1}
            total={config.steps.length}
            label="Steps"
            color="accent"
            animate={true}
          />
          
          <div className="flex items-center justify-center gap-4 mt-3 text-white/80 text-sm">
            <span>Step {simulationStep + 1} of {config.steps.length}</span>
          </div>
        </motion.div>

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
                {config.steps[simulationStep].name}
              </h2>
              <p className="text-white/70 text-sm">
                {config.steps[simulationStep].description}
              </p>
            </div>

            {/* Simulation Canvas */}
            <div className="flex-1 bg-white/5 backdrop-blur rounded-2xl p-4 mb-4 min-h-0">
              {currentTopic.title.toLowerCase() === 'plants & photosynthesis' ? (
                <PhotosynthesisSimulation
                  userSpeed={userSpeed}
                  onStepComplete={(step) => {
                    setSimulationStep(step)
                    if (step === 4) {
                      setIsComplete(true)
                      setIsRunning(false)
                      if (currentUser) {
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
              {currentTopic.title.toLowerCase() === 'plants & photosynthesis' ? (
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

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">🔍 Fun Facts</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• <strong>Chlorophyll:</strong> The green pigment that captures sunlight</p>
                      <p>• <strong>Stomata:</strong> Tiny holes in leaves for gas exchange</p>
                      <p>• <strong>Xylem:</strong> Tubes that carry water from roots to leaves</p>
                      <p>• <strong>Phloem:</strong> Tubes that carry glucose throughout the plant</p>
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