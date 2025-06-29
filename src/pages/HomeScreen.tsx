import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { setCurrentTopic } from '../features/topics/topicsSlice'
import { Topic } from '../data/topics'
import AvatarIcon from '../components/AvatarIcon'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import SpaceDecorations from '../components/SpaceDecorations'
import TopicSelectionDialog from '../components/TopicSelectionDialog'

interface HomeScreenProps {
  onNavigate: (screen: string) => void
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { dailyProgress, dailyGoal, totalScore, streak } = useAppSelector((state) => state.progress)
  const dispatch = useAppDispatch()
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)

  const handleTopicSelect = (topic: Topic) => {
    dispatch(setCurrentTopic(topic))
    onNavigate('lesson')
  }

  return (
    <div className="min-h-screen space-background p-4 relative">
      <SpaceDecorations />
      {/* Header */}
      <motion.header
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <AvatarIcon size="lg" />
          <div>
            <h1 className="text-white font-comic text-2xl font-bold">SciFly 🚀</h1>
            <p className="text-white/80 text-sm">Your science adventure starts here!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 glass-3d tilt-3d">
            <div className="text-white text-center">
              <p className="text-xs opacity-80">Streak</p>
              <p className="font-bold">{streak} 🔥</p>
            </div>
          </div>
          
          <motion.div
            className="bg-secondary-500 rounded-full p-3 shadow-lg floating-3d"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white text-xl">⭐</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Nova Mascot with Chat Bubble */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center mb-4">
            <SimbaMascot size="lg" animate={true} />
          </div>
          
          <motion.div
            className="chat-bubble mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-gray-700 font-medium">
              Hi! I'm Simba! Welcome to SciFly! Ready to explore amazing science topics? 🦁
            </p>
          </motion.div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="bg-white/95 backdrop-blur rounded-2xl p-6 mb-6 shadow-xl card-3d glass-3d"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-comic font-bold text-gray-800 mb-4">Today's Goal</h3>
          <ProgressBar
            current={dailyProgress}
            total={dailyGoal}
            label="Lessons Completed"
            color="success"
            animate={true}
          />
          
          <div className="flex justify-between mt-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Total Score</p>
              <p className="font-bold text-primary-600">{totalScore}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Streak</p>
              <p className="font-bold text-secondary-600">{streak} days</p>
            </div>
          </div>
        </motion.div>

        {/* Main Action Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <PrimaryButton
            onClick={() => setIsTopicDialogOpen(true)}
            size="lg"
            className="w-full"
            icon="🔬"
          >
            Choose a Science Topic
          </PrimaryButton>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg text-center tilt-3d glass-3d"
            onClick={() => onNavigate('quiz')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">🧩</div>
            <p className="font-bold text-gray-700 text-sm">Quiz</p>
          </motion.button>

          <motion.button
            className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg text-center tilt-3d glass-3d"
            onClick={() => onNavigate('chat')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">💭</div>
            <p className="font-bold text-gray-700 text-sm">Fun Facts</p>
          </motion.button>

          <motion.button
            className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg text-center tilt-3d glass-3d"
            onClick={() => onNavigate('achievements')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">🏆</div>
            <p className="font-bold text-gray-700 text-sm">Achievements</p>
          </motion.button>
        </motion.div>
      </div>

      {/* Topic Selection Dialog */}
      <TopicSelectionDialog
        isOpen={isTopicDialogOpen}
        onClose={() => setIsTopicDialogOpen(false)}
        onTopicSelect={handleTopicSelect}
      />
    </div>
  )
}

export default HomeScreen 