import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { topics, Topic } from '../data/topics'
import SimbaMascot from './SimbaMascot'
import PrimaryButton from './PrimaryButton'

interface TopicSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onTopicSelect: (topic: Topic) => void
}

const TopicSelectionDialog: React.FC<TopicSelectionDialogProps> = ({ 
  isOpen, 
  onClose, 
  onTopicSelect 
}) => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [previewTheme, setPreviewTheme] = useState<string>('space')

  const topicColors = {
    purple: 'from-purple-500 to-purple-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    cyan: 'from-cyan-500 to-cyan-700',
    red: 'from-red-500 to-red-700',
    orange: 'from-orange-500 to-orange-700',
    indigo: 'from-indigo-500 to-indigo-700',
    brown: 'from-amber-600 to-amber-800',
    yellow: 'from-yellow-500 to-yellow-700',
    teal: 'from-teal-500 to-teal-700'
  }

  const handleTopicHover = (topic: Topic) => {
    setPreviewTheme(topic.backgroundTheme)
  }

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic)
  }

  const handleStartLearning = () => {
    if (selectedTopic) {
      onTopicSelect(selectedTopic)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedTopic(null)
    setPreviewTheme('space')
    onClose()
  }

  const renderDynamicBackground = () => {
    const backgroundStyles = {
      space: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900',
      forest: 'bg-gradient-to-br from-green-900 via-green-700 to-emerald-800',
      ocean: 'bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-800',
      weather: 'bg-gradient-to-br from-gray-700 via-blue-600 to-cyan-500',
      laboratory: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900',
      'human-body': 'bg-gradient-to-br from-red-900 via-pink-800 to-rose-900',
      earth: 'bg-gradient-to-br from-amber-900 via-orange-800 to-red-900'
    }

    return (
      <motion.div
        key={previewTheme}
        className={`absolute inset-0 ${backgroundStyles[previewTheme as keyof typeof backgroundStyles] || backgroundStyles.space}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 modal-backdrop z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl modal-content">
              {/* Dynamic Background */}
              <div className="absolute inset-0 overflow-hidden">
                {renderDynamicBackground()}
                
                {/* Animated Elements */}
                {previewTheme === 'space' && (
                  <>
                    <motion.div
                      className="absolute top-10 right-10 w-4 h-4 bg-white rounded-full opacity-80"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute bottom-20 left-10 w-3 h-3 bg-blue-300 rounded-full opacity-60"
                      animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </>
                )}
                
                {previewTheme === 'forest' && (
                  <>
                    <motion.div
                      className="absolute top-16 left-1/4 text-2xl opacity-70"
                      animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🍃
                    </motion.div>
                    <motion.div
                      className="absolute bottom-24 right-1/3 text-xl opacity-60"
                      animate={{ y: [0, -10, 0], rotate: [0, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      🌿
                    </motion.div>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 max-h-[90vh] overflow-y-auto modal-scroll">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <SimbaMascot size="sm" animate={true} />
                    <div>
                      <h2 className="text-white font-comic text-2xl font-bold">Choose Your Adventure! 🚀</h2>
                      <p className="text-white/80 text-sm">Grade 5 Science Curriculum</p>
                    </div>
                  </div>
                  
                  <motion.button
                    className="bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/30 transition-colors tilt-3d glass-3d"
                    onClick={handleClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-xl">✕</span>
                  </motion.button>
                </div>



                {/* Topics Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, staggerChildren: 0.1 }}
                >
                  <AnimatePresence>
                    {topics.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 tilt-3d glass-3d ${
                          selectedTopic?.id === topic.id 
                            ? 'border-white bg-white/20 shadow-2xl scale-105' 
                            : 'border-white/20 bg-white/10 hover:bg-white/20'
                        }`}
                        onClick={() => handleTopicClick(topic)}
                        onMouseEnter={() => handleTopicHover(topic)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        {/* Topic Icon */}
                        <div className="text-center mb-3">
                          <motion.div
                            className="text-3xl mb-2"
                            animate={selectedTopic?.id === topic.id ? { rotate: [0, 5, -5, 0] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {topic.icon}
                          </motion.div>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${topicColors[topic.color as keyof typeof topicColors]}`}>
                            {topic.estimatedTime} min
                          </div>
                        </div>

                        {/* Topic Title */}
                        <h3 className="font-comic font-bold text-white text-sm mb-3 text-center">
                          {topic.title}
                        </h3>

                        {/* Key Learning Points */}
                        <div className="space-y-1 mb-3">
                          {topic.keyLearningPoints.slice(0, 1).map((point, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-white/60 rounded-full flex-shrink-0" />
                              <span className="text-white/70 text-xs line-clamp-1">{point}</span>
                            </div>
                          ))}
                          {topic.keyLearningPoints.length > 1 && (
                            <div className="text-white/50 text-xs text-center">
                              +{topic.keyLearningPoints.length - 1} more
                            </div>
                          )}
                        </div>

                        {/* Start Learning Button - Only shown when selected */}
                        <AnimatePresence>
                          {selectedTopic?.id === topic.id && (
                            <motion.div
                              className="mt-3"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                            >
                              <PrimaryButton
                                onClick={handleStartLearning}
                                size="sm"
                                icon="🚀"
                                className="w-full"
                              >
                                Start Learning!
                              </PrimaryButton>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Selection Indicator */}
                        {selectedTopic?.id === topic.id && (
                          <motion.div
                            className="absolute -top-2 -right-2 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <span className="text-white text-sm">✓</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Simba's Encouragement */}
                {!selectedTopic && (
                  <motion.div
                    className="flex items-start gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="chat-bubble max-w-sm">
                      <p className="text-gray-700 text-sm text-center">
                        These topics are perfect for Grade 5 students! Pick any science topic that sparks your curiosity - every adventure is mane-ificent! 🦁✨
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TopicSelectionDialog 