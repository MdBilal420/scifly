import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { createUser, hideOnboarding } from '../features/user/userSlice'
import PrimaryButton from './PrimaryButton'
import SimbaMascot from './SimbaMascot'

const UserOnboardingDialog: React.FC = () => {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [learningSpeed, setLearningSpeed] = useState<1 | 2 | 3 | 4 | 5>(3)
  const dispatch = useAppDispatch()
  const { showOnboarding } = useAppSelector((state) => state.user)

  const learningSpeedOptions = [
    {
      value: 1,
      title: 'Careful Explorer 🐢',
      description: 'I like to take my time and understand everything step by step',
      detail: 'Perfect for students who prefer thorough explanations and multiple examples'
    },
    {
      value: 2,
      title: 'Steady Learner 🐨',
      description: 'I enjoy learning at a comfortable pace with good explanations',
      detail: 'Great for students who like detailed content but not too slow'
    },
    {
      value: 3,
      title: 'Balanced Student 🦁',
      description: 'I learn best with a mix of explanation and practice',
      detail: 'Ideal for most students who want balanced content'
    },
    {
      value: 4,
      title: 'Quick Thinker 🐎',
      description: 'I pick up concepts quickly and like to move fast',
      detail: 'Perfect for students who grasp concepts easily'
    },
    {
      value: 5,
      title: 'Lightning Fast 🚀',
      description: 'I understand things immediately and want to race ahead!',
      detail: 'For advanced students who need minimal explanation'
    }
  ]

  const handleComplete = () => {
    if (name.trim()) {
      dispatch(createUser({ name: name.trim(), learningSpeed }))
    }
  }

  const handleSkip = () => {
    dispatch(hideOnboarding())
  }

  if (!showOnboarding) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-3xl p-6 text-center">
            <SimbaMascot size="lg" animate={true} />
            <h1 className="font-comic text-2xl font-bold text-white mt-4">
              Welcome to SciFly! 🚀
            </h1>
            <p className="text-white/90 mt-2">
              Let's personalize your learning adventure!
            </p>
          </div>

          <div className="p-6">
            {/* Step 1: Name Input */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">
                    What should I call you? 🦁
                  </h2>
                  <p className="text-gray-600">
                    Simba wants to know your name so we can be great friends!
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-lg font-medium"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <PrimaryButton
                      onClick={() => setStep(2)}
                      disabled={!name.trim()}
                      className="flex-1"
                      icon="→"
                    >
                      Next
                    </PrimaryButton>
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Learning Speed */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">
                    How do you like to learn, {name}? 🎯
                  </h2>
                  <p className="text-gray-600">
                    This helps us create lessons that are perfect for you!
                  </p>
                </div>

                <div className="space-y-3">
                  {learningSpeedOptions.map((option) => (
                    <motion.div
                      key={option.value}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        learningSpeed === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLearningSpeed(option.value as 1 | 2 | 3 | 4 | 5)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{option.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{option.detail}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          learningSpeed === option.value
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {learningSpeed === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                  <PrimaryButton
                    onClick={handleComplete}
                    className="flex-1"
                    icon="🎉"
                  >
                    Start Learning!
                  </PrimaryButton>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UserOnboardingDialog 