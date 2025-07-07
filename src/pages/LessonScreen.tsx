import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateTopicProgress } from '../features/progress/progressSlice'
import { generateLessonContent, clearErrors } from '../features/topics/topicsSlice'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import AdaptiveLessonContainer from '../components/AdaptiveLessonContainer'
import MasterContentRenderer from '../components/content/MasterContentRenderer'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'

import { Speed1Layout, Speed2Layout, Speed3Layout, Speed4Layout, Speed5Layout } from '../components/layouts/SpeedSpecificLayouts'
// Import adaptive styles to ensure they're loaded
import '../styles/adaptiveComponents.css'

interface LessonScreenProps {
  onNavigate: (screen: string) => void
}

const LessonScreen: React.FC<LessonScreenProps> = ({ onNavigate }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const dispatch = useAppDispatch()
  
  const { currentTopic, lessonContent, isGeneratingContent, contentError } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)

  useEffect(() => {
    if (currentTopic && lessonContent.length === 0 && !isGeneratingContent && !contentError) {
      dispatch(generateLessonContent(currentTopic))
    }
  }, [currentTopic?.id, isGeneratingContent, contentError, dispatch]) // More specific dependencies

  // Show loading or redirect if no topic selected
  if (!currentTopic) {
    onNavigate('topics')
    return null
  }

  // Show loading state while generating content
  if (isGeneratingContent) {
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

  // Show error state if no content available
  if (!lessonContent || lessonContent.length === 0) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-6 max-w-md">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">No Lesson Content Available</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find any lesson content for {currentTopic.title}. 
              This might be because the content hasn't been generated yet or there was an issue loading it.
            </p>
            <PrimaryButton
              onClick={() => {
                dispatch(generateLessonContent(currentTopic))
              }}
              className="w-full mb-2"
            >
              Generate Lesson Content
            </PrimaryButton>
            <button
              onClick={() => onNavigate('activity')}
              className="text-gray-500 text-sm underline"
            >
              Choose Different Activity
            </button>
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
              onClick={() => {
                // Clear error first, then retry
                dispatch(clearErrors())
                dispatch(generateLessonContent(currentTopic))
              }}
              className="w-full mb-2"
            >
              Try Again
            </PrimaryButton>
            <button
              onClick={() => onNavigate('activity')}
              className="text-gray-500 text-sm underline"
            >
              Choose Different Activity
            </button>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  const currentContent = lessonContent[currentSection]

  // Safety check - if no current content, show loading
  if (!currentContent) {
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
              Loading lesson content... 🦁
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  const handleNext = () => {
    if (!currentUser || !lessonContent) return

    if (currentSection < lessonContent.length - 1) {
      setCurrentSection(currentSection + 1)
      // Track progress at topic level (sections within a topic)
      dispatch(updateTopicProgress({ 
        userId: currentUser.id, 
        topicId: currentTopic.id, 
        progressData: { 
          progress_percentage: currentProgress 
        } 
      }))
    } else {
      // Complete the entire topic
      dispatch(updateTopicProgress({ 
        userId: currentUser.id, 
        topicId: currentTopic.id, 
        progressData: { 
          progress_percentage: 100,
          completed: true 
        } 
      }))
      onNavigate('activity')
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    } else {
      onNavigate('activity')
    }
  }

  // Get user speed to determine layout
  const userSpeed = currentUser?.learningSpeed || 3

  // Calculate progress based on current section
  const currentProgress = lessonContent.length > 0 ? ((currentSection + 1) / lessonContent.length) * 100 : 0



  // Render speed-specific layouts
  return (
    <DynamicBackground theme={currentTopic.backgroundTheme}>
      <div className="lesson-screen-wrapper max-h-screen flex flex-col">
        {/* Header with progress and navigation */}
        <div className="flex-shrink-0 p-4 bg-white/10 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => onNavigate('activity')}
              type="button"
              className="p-2 text-xl rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 backdrop-blur-lg shadow-lg min-w-[40px] h-10 flex items-center justify-center"
                          >
                {(MdArrowBack as any)({ style: { display: 'inline' } })}
              </button>
            <div className="flex-1">
              <ProgressBar current={currentSection + 1} total={lessonContent.length} />
              <div className="text-center text-white text-sm mt-1 font-bold drop-shadow-lg">
                📚 Section {currentSection + 1} of {lessonContent.length} 
              </div>
        </div>
            <UserMenu />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1  max-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
              className="h-full p-3 sm:p-4"
            >
              {userSpeed === 1 && (
                <Speed1Layout 
                  currentContent={currentContent}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  currentSection={currentSection}
                  totalSections={lessonContent.length}
                />
              )}
              
              {userSpeed === 2 && (
                <Speed2Layout 
                  currentContent={currentContent}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  currentSection={currentSection}
                  totalSections={lessonContent.length}
                />
              )}
              
              {userSpeed === 3 && (
                <Speed3Layout 
                  currentContent={currentContent}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  currentSection={currentSection}
                  totalSections={lessonContent.length}
                />
              )}
              
              {userSpeed === 4 && (
                <Speed4Layout 
                  currentContent={currentContent}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  currentSection={currentSection}
                  totalSections={lessonContent.length}
                />
              )}
              
              {userSpeed === 5 && (
                <Speed5Layout 
                  currentContent={currentContent}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  currentSection={currentSection}
                  totalSections={lessonContent.length}
                />
              )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </DynamicBackground>
  )
}

export default LessonScreen 