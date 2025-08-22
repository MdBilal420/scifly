import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '../hooks/redux'
// import { getModesForSpeed } from '../config/learningModes'
//import PrimaryButton from '../components/PrimaryButton'

import UserMenu from '../components/UserMenu'
import SimbaMascot from '../components/SimbaMascot'
import { MdArrowBack } from 'react-icons/md'

interface ActivitySelectionScreenProps {
  onNavigate: (screen: string) => void
}

const ActivitySelectionScreen: React.FC<ActivitySelectionScreenProps> = ({ onNavigate }) => {
  const { currentTopic } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)
  const [gradientVariant, setGradientVariant] = useState<string>('default')

  useEffect(() => {
    // Redirect if no topic selected
    if (!currentTopic) {
      onNavigate('topics')
    }
  }, [currentTopic, onNavigate])

  // Return null (or a loader) while redirecting
  if (!currentTopic) {
    return null
  }

  const userSpeed = currentUser?.learningSpeed || 3

  // Activity gradient variants for background changes
  const activityGradients: Record<string, string> = {
    'lesson': 'lesson',
    'quiz': 'quiz',
    'ask-simba': 'chat',
    'flashcards': 'cards',
    'storybook': 'story',
    'playgame': 'game'
  }

  const handleActivityHover = (activityId: string) => {
    const variant = activityGradients[activityId] || 'default'
    setGradientVariant(variant)
  }

  const handleActivityLeave = () => {
    setGradientVariant('default')
  }

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
        id: 'ask-simba',
        title: 'Ask Simba',
        description: 'Chat with your AI science companion',
        icon: '🦁',
        color: 'from-orange-500 to-orange-600',
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
      case 'ask-simba':
        onNavigate('chat')
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

  // Gradient variations based on topic theme and activity hover
  const getBackgroundGradient = () => {
    const baseTheme = currentTopic?.backgroundTheme || 'space'
    
    // Get base colors for the topic theme
    const getThemeBaseColors = () => {
      switch (baseTheme) {
        case 'space':
          return { primary: 'slate', secondary: 'blue', accent: 'indigo' }
        case 'forest':
          return { primary: 'green', secondary: 'emerald', accent: 'teal' }
        case 'ocean':
          return { primary: 'blue', secondary: 'cyan', accent: 'teal' }
        case 'weather':
          return { primary: 'gray', secondary: 'blue', accent: 'cyan' }
        case 'laboratory':
          return { primary: 'indigo', secondary: 'purple', accent: 'blue' }
        case 'human-body':
          return { primary: 'red', secondary: 'pink', accent: 'rose' }
        case 'earth':
          return { primary: 'amber', secondary: 'orange', accent: 'red' }
        default:
          return { primary: 'slate', secondary: 'blue', accent: 'indigo' }
      }
    }

    const colors = getThemeBaseColors()
    
    // Create gradient variations based on activity
    switch (gradientVariant) {
      case 'lesson':
        // Deeper, more focused variation
        return `bg-gradient-to-br from-${colors.primary}-900 via-${colors.secondary}-900 to-${colors.accent}-900`
      case 'quiz':
        // Sharper, more contrasted variation
        return `bg-gradient-to-br from-${colors.accent}-900 via-${colors.primary}-800 to-${colors.secondary}-900`
      case 'chat':
        // Warmer, more inviting variation
        return `bg-gradient-to-br from-${colors.secondary}-900 via-${colors.accent}-800 to-${colors.primary}-800`
      case 'cards':
        // Flowing, memory-like variation
        return `bg-gradient-to-br from-${colors.accent}-800 via-${colors.secondary}-900 to-${colors.primary}-900`
      case 'story':
        // Creative, imaginative variation
        return `bg-gradient-to-br from-${colors.primary}-800 via-${colors.accent}-900 to-${colors.secondary}-800`
      case 'game':
        // Energetic, dynamic variation
        return `bg-gradient-to-br from-${colors.secondary}-800 via-${colors.primary}-900 to-${colors.accent}-800`
      default:
        // Original topic theme gradient
        switch (baseTheme) {
          case 'space':
            return 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
          case 'forest':
            return 'bg-gradient-to-br from-green-900 via-green-700 to-emerald-800'
          case 'ocean':
            return 'bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-800'
          case 'weather':
            return 'bg-gradient-to-br from-gray-700 via-blue-600 to-cyan-500'
          case 'laboratory':
            return 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900'
          case 'human-body':
            return 'bg-gradient-to-br from-red-900 via-pink-800 to-rose-900'
          case 'earth':
            return 'bg-gradient-to-br from-amber-900 via-orange-800 to-red-900'
          default:
            return 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
        }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Gradient Background */}
      <motion.div
        key={gradientVariant}
        className={`absolute inset-0 ${getBackgroundGradient()}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Space decorations overlay */}
      <div className="absolute inset-0">
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
      </div>
      
      {/* Header - Fixed positioning to avoid z-index issues */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            className="bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300"
            onClick={() => onNavigate('topics')}
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

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 pt-24">

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
            <span>📚 Grade 5 Curriculum</span>
            <span>•</span>
            <span>🚀 Speed {userSpeed}</span>
          </div>
        </motion.div>

        {/* Activity Options */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 tilt-3d glass-3d ${
                  activity.primary 
                    ? 'border-yellow-400 bg-white/20 shadow-2xl ring-2 ring-yellow-400/50' 
                    : 'border-white/20 bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => handleActivitySelect(activity.id)}
                onMouseEnter={() => handleActivityHover(activity.id)}
                onMouseLeave={handleActivityLeave}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activity.primary && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <span className="text-white text-sm">⭐</span>
                  </motion.div>
                )}
                
                {/* Activity Icon */}
                <div className="text-center mb-3">
                  <motion.div
                    className="text-3xl mb-2"
                    animate={activity.primary ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {activity.icon}
                  </motion.div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${activity.color}`}>
                    {activity.primary ? 'Recommended' : 'Activity'}
                  </div>
                </div>

                {/* Activity Title */}
                <h3 className="font-comic font-bold text-white text-lg mb-2 text-center">
                  {activity.title}
                </h3>

                {/* Activity Description */}
                <p className="text-white/80 text-sm text-center">
                  {activity.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mascot */}
        <motion.div
          className="fixed bottom-6 right-6 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <SimbaMascot size="md" animate={true} />
        </motion.div>
      </div>
    </div>
  )
}

export default ActivitySelectionScreen 