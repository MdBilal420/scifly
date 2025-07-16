import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { setCurrentTopic } from '../features/topics/topicsSlice'
import { loadDailyGoal, loadUserProgress } from '../features/progress/progressSlice'
import { Topic } from '../data/topics'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import SpaceDecorations from '../components/SpaceDecorations'
import TopicSelectionDialog from '../components/TopicSelectionDialog'
import UserMenu from '../components/UserMenu'

interface HomeScreenProps {
  onNavigate: (screen: string) => void
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { dailyProgress, dailyGoal } = useAppSelector((state) => state.progress)
  const { currentUser } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)

  useEffect(() => {
    if (currentUser?.id ) {
      dispatch(loadDailyGoal(currentUser.id))
      dispatch(loadUserProgress(currentUser.id))
    }
  }, [dispatch, currentUser?.id])

  const handleTopicSelect = (topic: Topic) => {
    dispatch(setCurrentTopic(topic))
    onNavigate('activity')
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
          <div className="text-4xl">{currentUser?.avatar || '👤'}</div>
          <div>
            <h1 className="text-white font-comic text-2xl font-bold">
              {currentUser ? `Hi, ${currentUser.name}! 🚀` : 'SciFly 🚀'}
            </h1>
            <p className="text-white/80 text-sm">
              {currentUser 
                ? `${currentUser.learningSpeed <= 2 ? 'Steady explorer' : currentUser.learningSpeed >= 4 ? 'Quick learner' : 'Balanced student'} • Ready to learn?`
                : 'Your science adventure starts here!'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="bg-white/20 backdrop-blur rounded-2xl px-3 py-2 glass-3d tilt-3d">
              <div className="text-white text-center">
                <p className="text-xs opacity-80">Learning Speed</p>
                <p className="font-bold">{currentUser.learningSpeed}/5 {currentUser.avatar}</p>
              </div>
            </div>
          )}
          
          <motion.div
            className="bg-secondary-500 rounded-full p-3 shadow-lg floating-3d"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white text-xl">⭐</span>
          </motion.div>
          
          {/* User Menu with Logout */}
          <UserMenu />
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
              {currentUser 
                ? `Hey ${currentUser.name}! I&apos;ve prepared lessons perfect for a ${currentUser.learningSpeed <= 2 ? 'careful explorer like you! We&apos;ll take our time.' : currentUser.learningSpeed >= 4 ? 'quick thinker like you! Let&apos;s move fast!' : 'balanced learner like you! Just the right pace.'} Ready? 🦁`
                : 'Hi! I&apos;m Simba! Welcome to SciFly! Ready to explore amazing science topics? 🦁'
              }
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
          <h3 className="font-comic font-bold text-gray-800 mb-4">Today&apos;s Goal</h3>
          {dailyProgress >= dailyGoal ? (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-600 animate-bounce">🎉 Goal Smashed! {dailyProgress} lessons completed! 🎉</div>
              <ProgressBar
                current={dailyGoal}
                total={dailyGoal}
                label="Lessons Completed"
                color="success"
                animate={true}
              />
            </div>
          ) : (
            <>
              <ProgressBar
                current={dailyProgress}
                total={dailyGoal}
                label="Lessons Completed"
                color="success"
                animate={true}
              />
            </>
          )}
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
            <p className="font-bold text-gray-700 text-sm">Ask Simba</p>
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

// Disable static generation since this page uses Redux hooks
export const getServerSideProps = async () => {
  return {
    props: {}
  }
} 