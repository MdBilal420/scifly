import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '../hooks/redux'
// import { getModesForSpeed } from '../config/learningModes'
import PrimaryButton from '../components/PrimaryButton'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import SimbaMascot from '../components/SimbaMascot'
import { MdArrowBack } from 'react-icons/md'

interface ActivitySelectionScreenProps {
  onNavigate: (screen: string) => void
}

const ActivitySelectionScreen: React.FC<ActivitySelectionScreenProps> = ({ onNavigate }) => {
  const { currentTopic } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)

  useEffect(() => {
    // Redirect if no topic selected
    if (!currentTopic) {
      onNavigate('home')
    }
  }, [currentTopic, onNavigate])

  // Return null (or a loader) while redirecting
  if (!currentTopic) {
    return null
  }

  const userSpeed = currentUser?.learningSpeed || 3

  // Get speed-specific activity options
  const getActivityOptions = () => {
    // Base activities that are always available
    const baseActivities = [
      {
        id: 'lesson',
        title: 'Start Lesson',
        description: 'Learn step-by-step with visual guides',
        icon: '📚',
        color: 'from-blue-500 to-blue-600',
        primary: true
      },
      {
        id: 'quiz',
        title: 'Take Quiz',
        description: 'Test your knowledge with simple questions',
        icon: '🧩',
        color: 'from-green-500 to-green-600',
        primary: false
      },
      {
        id: 'flashcards',
        title: 'Review Flashcards',
        description: 'Quick review with visual cards',
        icon: '🃏',
        color: 'from-purple-500 to-purple-600',
        primary: false
      }
    ]

    // Add storybook for all speeds
    const activities = [...baseActivities]
    activities.push({
      id: 'storybook',
      title: 'View Storybook',
      description: 'Read an AI-generated story',
      icon: '📖',
      color: 'from-yellow-500 to-yellow-600',
      primary: false
    })

    // Add play game only for water cycle topic
    if (currentTopic?.id === 'water-cycle') {
      activities.push({
        id: 'playgame',
        title: 'Play Game',
        description: 'Play a simple game for this topic',
        icon: '🎮',
        color: 'from-pink-500 to-pink-600',
        primary: false
      })
    }

    return activities
  }

  const activities = getActivityOptions()

  const handleActivitySelect = (activityId: string) => {
    // Navigate to the selected activity
    switch (activityId) {
      case 'lesson':
        onNavigate('lesson')
        break
      case 'quiz':
        onNavigate('quiz')
        break
      case 'flashcards':
        onNavigate('flashcards')
        break
     case 'storybook':
       onNavigate('storybook')
       break
      case 'chat':
        onNavigate('chat')
        break
      case 'simulation':
        onNavigate('simulation')
        break
      case 'practice':
      case 'challenge':
      case 'research':
        // These are future features - for now, navigate to lesson
        console.log(`${activityId} mode selected - redirecting to lesson for now`)
        onNavigate('lesson')
        break
      case 'playgame':
        onNavigate('playgame')
        break
      default:
        onNavigate('lesson')
    }
  }

  const getSpeedDescription = () => {
    switch (userSpeed) {
      case 1:
        return 'Simplified & Visual • Take your time to learn'
      case 2:
        return 'Visual & Reading • Steady learning pace'
      case 3:
        return 'Balanced Learning • Perfect mix of methods'
      case 4:
        return 'Fast & Text-focused • Quick comprehensive learning'
      case 5:
        return 'Conversational & Advanced • Self-directed exploration'
      default:
        return 'Balanced Learning'
    }
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
              onClick={() => onNavigate('home')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {(MdArrowBack as any)({ style: { display: 'inline', fontSize: '20px' } })}
            </motion.button>
            
            <div>
              <h1 className="font-comic text-2xl font-bold text-white">Choose Your Activity</h1>
              <p className="text-white/80 text-sm">{getSpeedDescription()}</p>
            </div>
          </div>
          
          <UserMenu />
        </motion.header>

        {/* Topic Info */}
        <motion.div
          className="bg-white/10 backdrop-blur rounded-3xl p-6 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl">{currentTopic.icon}</div>
            <div>
              <h2 className="font-comic text-xl font-bold text-white">{currentTopic.title}</h2>
              <p className="text-white/70 text-sm">{currentTopic.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
            <span>⏱️ {currentTopic.estimatedTime} min</span>
            <span>•</span>
            <span>📊 {currentTopic.difficulty === 1 ? 'Beginner' : currentTopic.difficulty === 2 ? 'Intermediate' : 'Advanced'}</span>
            <span>•</span>
            <span>🚀 Speed {userSpeed}</span>
          </div>
        </motion.div>

        {/* Activity Options */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className={`relative bg-white/10 backdrop-blur rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:scale-105 ${
                  activity.primary ? 'ring-2 ring-white/30' : ''
                }`}
                onClick={() => handleActivitySelect(activity.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activity.primary && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${activity.color} mb-3`}>
                    <span className="text-2xl">{activity.icon}</span>
                  </div>
                  <h3 className="font-comic text-lg font-bold text-white mb-2">{activity.title}</h3>
                  <p className="text-white/70 text-sm">{activity.description}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <PrimaryButton
                    onClick={() => handleActivitySelect(activity.id)}
                    size="sm"
                    className="w-full"
                  >
                    {activity.primary ? 'Start Now' : 'Select'}
                  </PrimaryButton>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

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

export default ActivitySelectionScreen 