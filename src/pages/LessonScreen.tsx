import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch } from '../hooks/redux'
import { updateLessonProgress } from '../features/progress/progressSlice'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'

interface LessonScreenProps {
  onNavigate: (screen: string) => void
}

const lessonContent = [
  {
    id: 1,
    title: "What is Gravity?",
    content: "Gravity is an invisible force that pulls everything toward Earth! It's what keeps us on the ground instead of floating away into space.",
    tip: "Try dropping a ball and a feather - which falls faster?",
    interactive: "tap-to-reveal",
    image: "🌍"
  },
  {
    id: 2,
    title: "How Does Gravity Work?",
    content: "Everything with mass (weight) attracts everything else. Earth is really big and heavy, so it pulls everything toward its center!",
    tip: "The bigger and heavier something is, the stronger its gravity!",
    interactive: "drag-to-learn",
    image: "⚖️"
  },
  {
    id: 3,
    title: "Gravity in Space",
    content: "In space, astronauts float because they're falling around Earth at the same speed they're moving forward. It's like being on a really fast roller coaster!",
    tip: "Astronauts aren't really weightless - they're just falling!",
    interactive: "animation",
    image: "🚀"
  },
  {
    id: 4,
    title: "Gravity Fun Facts",
    content: "Did you know? If you weigh 100 pounds on Earth, you'd weigh only 38 pounds on Mars and 17 pounds on the Moon!",
    tip: "You've learned so much about gravity! Great job! 🎉",
    interactive: "celebration",
    image: "🌙"
  }
]

const LessonScreen: React.FC<LessonScreenProps> = ({ onNavigate }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const dispatch = useAppDispatch()

  const currentContent = lessonContent[currentSection]
  const progress = ((currentSection + 1) / lessonContent.length) * 100

  const handleNext = () => {
    if (currentSection < lessonContent.length - 1) {
      setCurrentSection(currentSection + 1)
      setIsRevealed(false)
      dispatch(updateLessonProgress({ lessonId: 'gravity', progress: progress + 25 }))
    } else {
      dispatch(updateLessonProgress({ lessonId: 'gravity', progress: 100 }))
      onNavigate('home')
    }
  }

  const handleInteraction = () => {
    setIsRevealed(true)
  }

  return (
    <div className="min-h-screen space-background p-4">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          className="bg-white/20 backdrop-blur rounded-full p-3"
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
        
        <div className="bg-white/20 backdrop-blur rounded-2xl px-3 py-2">
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
            className="bg-white/95 backdrop-blur rounded-3xl p-6 mb-6 shadow-xl"
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

            {/* Interactive Image/Animation */}
            <motion.div
              className="text-6xl text-center mb-6 cursor-pointer"
              onClick={handleInteraction}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={
                currentContent.interactive === 'animation' 
                  ? { rotate: [0, 5, -5, 0], y: [0, -10, 0] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentContent.image}
            </motion.div>

            {/* Interactive Zone */}
            <motion.div
              className={`p-4 rounded-2xl mb-4 cursor-pointer transition-all duration-300 ${
                isRevealed ? 'bg-success-100 border-2 border-success-300' : 'bg-gray-100 border-2 border-dashed border-gray-300'
              }`}
              onClick={handleInteraction}
              whileHover={{ scale: 1.02 }}
            >
              {isRevealed ? (
                <motion.p
                  className="text-gray-700 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentContent.content}
                </motion.p>
              ) : (
                <p className="text-gray-500 text-center">
                  🔍 Tap to reveal the science!
                </p>
              )}
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
            disabled={!isRevealed && currentContent.interactive !== 'celebration'}
            className="w-full"
            variant={currentSection === lessonContent.length - 1 ? 'success' : 'primary'}
            icon={currentSection === lessonContent.length - 1 ? '🎉' : '→'}
          >
            {currentSection === lessonContent.length - 1 ? 'Complete Lesson!' : 'Next'}
          </PrimaryButton>
        </motion.div>
      </div>
    </div>
  )
}

export default LessonScreen 