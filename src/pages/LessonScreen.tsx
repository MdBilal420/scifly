import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateLessonProgress } from '../features/progress/progressSlice'
import { generateLessonContent } from '../features/topics/topicsSlice'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import DynamicBackground from '../components/DynamicBackground'

interface LessonScreenProps {
  onNavigate: (screen: string) => void
}

const LessonScreen: React.FC<LessonScreenProps> = ({ onNavigate }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const dispatch = useAppDispatch()
  
  const { currentTopic, lessonContent, isGeneratingContent, contentError } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)

  useEffect(() => {
    if (currentTopic && lessonContent.length === 0 && !isGeneratingContent) {
      dispatch(generateLessonContent(currentTopic))
    }
  }, [currentTopic, lessonContent.length, isGeneratingContent, dispatch])

  // Show loading or redirect if no topic selected
  if (!currentTopic) {
    onNavigate('topics')
    return null
  }

  // Show loading state while generating content
  if (isGeneratingContent || lessonContent.length === 0) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <SimbaMascot size="lg" animate={true} />
            <motion.div
              className="mt-4 text-white text-xl font-comic"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparing your {currentTopic.title} lesson... 🦁
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  // Show error state if content generation failed
  if (contentError) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-6 max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">I couldn't generate the lesson content. Let's try again!</p>
            <PrimaryButton
              onClick={() => dispatch(generateLessonContent(currentTopic))}
              className="w-full mb-2"
            >
              Try Again
            </PrimaryButton>
            <button
              onClick={() => onNavigate('topics')}
              className="text-gray-500 text-sm underline"
            >
              Choose Different Topic
            </button>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  const currentContent = lessonContent[currentSection]
  const progress = ((currentSection + 1) / lessonContent.length) * 100

  const handleNext = () => {
    if (!currentUser) return

    if (currentSection < lessonContent.length - 1) {
      setCurrentSection(currentSection + 1)
      dispatch(updateLessonProgress({ 
        userId: currentUser.id, 
        lessonId: currentTopic.id, 
        progressData: { 
          progress_percentage: progress + (100 / lessonContent.length) 
        } 
      }))
    } else {
      dispatch(updateLessonProgress({ 
        userId: currentUser.id, 
        lessonId: currentTopic.id, 
        progressData: { 
          progress_percentage: 100,
          completed: true 
        } 
      }))
      onNavigate('home')
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
        <motion.button
          className="bg-white/20 backdrop-blur rounded-full p-3 tilt-3d glass-3d"
          onClick={() => onNavigate('home')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-white text-xl">←</span>
        </motion.button>
        
        <div className="flex-1 mx-4">
          <ProgressBar
            current={currentSection + 1}
            total={lessonContent.length}
            color="secondary"
            showPercentage={false}
          />
        </div>
        
        <div className="bg-white/20 backdrop-blur rounded-2xl px-3 py-2 glass-3d tilt-3d">
          <span className="text-white font-bold text-sm">
            {currentSection + 1}/{lessonContent.length}
          </span>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            className="bg-white/95 backdrop-blur rounded-3xl p-6 mb-6 shadow-xl card-3d glass-3d"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Topic Title */}
            <motion.h1
              className="font-comic text-2xl font-bold text-gray-800 mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentContent.title}
            </motion.h1>

            {/* Interactive Image */}
            <motion.div
              className="text-6xl text-center mb-6"
              animate={
                currentContent.interactive === 'animation' 
                  ? { rotate: [0, 5, -5, 0], y: [0, -10, 0] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentContent.image}
            </motion.div>

            {/* Science Content */}
            <motion.div
              className="p-4 rounded-2xl mb-4 bg-success-100 border-2 border-success-300 tilt-3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.p
                className="text-gray-700 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {currentContent.content}
              </motion.p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Nova's Tip */}
        <motion.div
          className="flex items-start gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SimbaMascot size="sm" animate={true} />
          <div className="chat-bubble flex-1">
            <p className="text-gray-700 text-sm">{currentContent.tip}</p>
          </div>
        </motion.div>

        {/* Next Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PrimaryButton
            onClick={handleNext}
            className="w-full"
            variant={currentSection === lessonContent.length - 1 ? 'success' : 'primary'}
            icon={currentSection === lessonContent.length - 1 ? '🎉' : '→'}
          >
            {currentSection === lessonContent.length - 1 ? 'Complete Lesson!' : 'Next'}
          </PrimaryButton>
        </motion.div>
      </div>
    </div>
    </DynamicBackground>
  )
}

export default LessonScreen 