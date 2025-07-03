import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { initializeAchievements } from '../features/achievements/achievementSlice'
import AchievementBadge from '../components/AchievementBadge'
import ProgressBar from '../components/ProgressBar'
import SimbaMascot from '../components/SimbaMascot'
import UserMenu from '../components/UserMenu'

interface AchievementsScreenProps {
  onNavigate: (screen: string) => void
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch()
  const { achievements, totalUnlocked, isLoading, error } = useAppSelector((state) => state.achievements)
  const { currentUser } = useAppSelector((state) => state.user)
  const totalAchievements = achievements.length
  const completionPercentage = totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  // Initialize achievements when component mounts if user is available and achievements are empty
  useEffect(() => {
    if (currentUser && achievements.length === 0 && !isLoading && !error) {
      dispatch(initializeAchievements(currentUser.id))
    }
  }, [dispatch, currentUser, achievements.length, isLoading, error])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen space-background flex items-center justify-center p-4">
        <div className="text-center">
          <SimbaMascot size="lg" animate={true} />
          <motion.div
            className="mt-4 text-white text-xl font-comic"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading your achievements... 🏆
          </motion.div>
        </div>
      </div>
    )
  }

  // Show empty state if no achievements are available
  if (!isLoading && achievements.length === 0) {
    return (
      <div className="min-h-screen space-background p-4">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              className="bg-white/20 backdrop-blur rounded-full p-3"
              onClick={() => onNavigate('home')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white text-xl">←</span>
            </motion.button>
            
            <h1 className="font-comic text-2xl font-bold text-white">SciFly Achievements 🏆</h1>
          </div>
          
          <UserMenu />
        </motion.header>

        <div className="max-w-md mx-auto text-center">
          <motion.div
            className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SimbaMascot size="lg" animate={true} />
            <h2 className="font-comic text-xl font-bold text-gray-800 mt-4 mb-2">
              Achievements Coming Soon! 🚧
            </h2>
            <p className="text-gray-600 mb-6">
              {error 
                ? "We're having trouble loading achievements right now. The database might need to be set up with seed data."
                : "Achievement system is being prepared for you! Keep learning and check back soon!"
              }
            </p>
            <motion.button
              className="bg-primary-500 text-white font-bold py-3 px-6 rounded-2xl"
              onClick={() => onNavigate('home')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Learning 🚀
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-background p-4">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            className="bg-white/20 backdrop-blur rounded-full p-3"
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white text-xl">←</span>
          </motion.button>
          
          <h1 className="font-comic text-2xl font-bold text-white">SciFly Achievements 🏆</h1>
        </div>
        
        {/* User Menu */}
        <UserMenu />
      </motion.header>

      <div className="max-w-2xl mx-auto">
        {/* Progress Overview */}
        <motion.div
          className="bg-white/95 backdrop-blur rounded-3xl p-6 mb-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <SimbaMascot size="md" animate={true} />
            <div className="flex-1">
              <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">
                Your Progress
              </h2>
              <ProgressBar
                current={totalUnlocked}
                total={totalAchievements}
                label="Achievements Unlocked"
                color="secondary"
                animate={true}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl p-3">
              <div className="text-2xl font-bold text-secondary-600">{totalUnlocked}</div>
              <p className="text-xs text-gray-600">Unlocked</p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-3">
              <div className="text-2xl font-bold text-primary-600">{totalAchievements - totalUnlocked}</div>
              <p className="text-xs text-gray-600">Remaining</p>
            </div>
            <div className="bg-gradient-to-br from-success-100 to-success-200 rounded-2xl p-3">
              <div className="text-2xl font-bold text-success-600">{Math.round(completionPercentage)}%</div>
              <p className="text-xs text-gray-600">Complete</p>
            </div>
          </div>
        </motion.div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-comic text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🏆</span> Unlocked Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unlockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <AchievementBadge
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    unlocked={achievement.unlocked}
                    progress={achievement.progress}
                    maxProgress={achievement.maxProgress}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Locked Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-comic text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🔒</span> Keep Going!
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <AchievementBadge
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                  maxProgress={achievement.maxProgress}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Share Button */}
        {totalUnlocked > 0 && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🌟 Share Your Progress
            </motion.button>
          </motion.div>
        )}

        {/* Motivational Message */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
            <p className="text-white/90 text-sm">
              {totalUnlocked === 0 
                ? "Start your science journey to unlock your first achievement! 🚀"
                : totalUnlocked === totalAchievements
                ? "Amazing! You've unlocked all achievements! You're a true scientist! 🎓"
                : `Great progress! ${totalAchievements - totalUnlocked} more achievements to go! 💪`
              }
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AchievementsScreen 