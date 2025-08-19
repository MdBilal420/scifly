import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  generateFlashcards,
  startFlashcardSession,
  endFlashcardSession,
  flipCard,
  nextCard,
  previousCard,
  shuffleCards,
  resetSession,
  clearFlashcards
} from '../features/flashcards/flashcardSlice'
import { updateTopicProgress } from '../features/progress/progressSlice'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import SimbaMascot from '../components/SimbaMascot'
import { MdArrowBack, MdShuffle } from 'react-icons/md'

interface FlashcardScreenProps {
  onNavigate: (screen: string) => void
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch()
  const { currentTopic } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)
  const {
    flashcards,
    currentCardIndex,
    isFlipped,
    showingResults,
    session,
    completionStats,
    isGenerating,
    error
  } = useAppSelector((state) => state.flashcards)

  // Initialize flashcards when component mounts
  useEffect(() => {
    if (currentTopic && currentUser && flashcards.length === 0 && !isGenerating && !error) {
      dispatch(generateFlashcards({ topic: currentTopic, userProfile: currentUser }))
    }
  }, [dispatch, currentTopic, currentUser, flashcards.length, isGenerating, error])

  // Start session when flashcards are loaded
  useEffect(() => {
    if (flashcards.length > 0 && !session) {
      dispatch(startFlashcardSession({ 
        topicId: currentTopic?.id || '', 
        totalCards: flashcards.length 
      }))
    }
  }, [dispatch, flashcards.length, session, currentTopic])

  // Redirect if no topic selected
  if (!currentTopic) {
    onNavigate('activity')
    return null
  }

  const userSpeed = currentUser?.learningSpeed || 3

  // Show loading state
  if (isGenerating) {
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
              Generating your {currentTopic.title} flashcards... 🃏
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  // Show error state
  if (error || flashcards.length === 0) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-6 max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {error || "I couldn't generate the flashcards. Let's try again!"}
            </p>
            <PrimaryButton
              onClick={() => {
                if (currentTopic && currentUser) {
                  dispatch(generateFlashcards({ topic: currentTopic, userProfile: currentUser }))
                }
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

  const currentCard = flashcards[currentCardIndex]

  // Handle card completion
  const handleComplete = async () => {
    if (session) {
      await dispatch(endFlashcardSession())
      
      // Update topic progress and daily goals
      if (currentUser) {
        dispatch(updateTopicProgress({
          userId: currentUser.id,
          topicId: currentTopic.id,
          progressData: {
            progress_percentage: 100,
            completed: true
          }
        }))
      }
    }
  }

  // Show completion stats
  if (showingResults && completionStats) {
    // Format time display
    const formatTime = (seconds: number) => {
      if (seconds < 60) {
        return `${seconds}s`
      } else {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
      }
    }
    
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen p-4">
          <div className="max-w-md mx-auto pt-8">
            <motion.div
              className="bg-white/95 backdrop-blur rounded-3xl p-8 text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 3 }}
              >
                🎉
              </motion.div>
              
              <h2 className="font-comic text-2xl font-bold text-gray-800 mb-4">
                Flashcards Complete!
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {completionStats.totalCards}
                  </div>
                  <p className="text-blue-700 text-sm">Cards Studied</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(completionStats.timeSpent)}
                  </div>
                  <p className="text-purple-700 text-sm">Time Spent</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <SimbaMascot size="md" animate={true} />
              </div>

              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
                  <h3 className="text-gray-700 font-bold mb-3">Want to study again?</h3>
                  <div className="space-y-2">
                    <PrimaryButton
                      onClick={() => {
                        dispatch(resetSession());
                        dispatch(shuffleCards());
                      }}
                      className="w-full"
                      icon="🔄"
                      variant="secondary"
                    >
                      Study Same Cards (Shuffled)
                    </PrimaryButton>

                    <PrimaryButton
                      onClick={() => {
                        dispatch(clearFlashcards());
                        if (currentTopic && currentUser) {
                          dispatch(generateFlashcards({ topic: currentTopic, userProfile: currentUser }));
                        }
                      }}
                      className="w-full"
                      icon="✨"
                      variant="secondary"
                    >
                      Generate New Cards
                    </PrimaryButton>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <PrimaryButton
                    onClick={() => onNavigate('activity')}
                    className="w-full mb-3"
                    icon="🎯"
                  >
                    Try Another Activity
                  </PrimaryButton>
                  
                  <button
                    onClick={() => onNavigate('topics')}
                    className="text-gray-500 text-sm underline w-full text-center"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  // Main flashcard interface
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
              onClick={() => onNavigate('activity')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {(MdArrowBack as any)({ style: { display: 'inline', fontSize: '20px' } })}
            </motion.button>
            
            <div>
              <h1 className="font-comic text-2xl font-bold text-white">
                {currentTopic.title} Flashcards
              </h1>
              <p className="text-white/80 text-sm">
                {userSpeed === 1 ? 'Simple & Clear' : 'Visual Learning'} • {flashcards.length} cards
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Controls */}
            <motion.button
              className="bg-white/20 backdrop-blur rounded-full p-3 text-white"
              onClick={() => dispatch(shuffleCards())}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Shuffle Cards"
            >
              {(MdShuffle as any)({ style: { display: 'inline', fontSize: '20px' } })}
            </motion.button>
            
            <UserMenu />
          </div>
        </motion.header>

        {/* Progress */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressBar
            current={currentCardIndex + 1}
            total={flashcards.length}
            label="Cards"
            color="primary"
            animate={true}
          />
          
          <div className="flex items-center justify-center gap-4 mt-3 text-white/80 text-sm">
            <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
          </div>
        </motion.div>

        {/* Flashcard */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`flashcard-container ${
              userSpeed === 1 ? 'speed-1' : 'speed-2'
            }`}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '300px',
              perspective: '1000px',
              cursor: 'pointer'
            }}
            onClick={() => dispatch(flipCard())}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of card */}
              <div
                className={`flashcard-face flashcard-front ${
                  userSpeed === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                  'bg-gradient-to-br from-purple-400 to-purple-600'
                }`}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                <div className="text-xs uppercase tracking-wide mb-4 opacity-70">
                  {currentCard?.type === 'qa' ? 'Question' :
                   currentCard?.type === 'term_definition' ? 'Term' :
                   currentCard?.type === 'image_description' ? 'Describe' :
                   'Fill in the blank'}
                </div>
                
                <div className={`text-center ${userSpeed === 1 ? 'text-2xl' : 'text-xl'} font-bold mb-4`}>
                  {currentCard?.front}
                </div>
                
                {currentCard?.hint && (
                  <div className="text-sm opacity-70 italic">
                    💡 Hint: {currentCard.hint}
                  </div>
                )}
                
                <div className="absolute bottom-4 text-xs opacity-50">
                  Tap to reveal answer
                </div>
              </div>

              {/* Back of card */}
              <div
                className={`flashcard-face flashcard-back ${
                  userSpeed === 1 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                  'bg-gradient-to-br from-teal-400 to-teal-600'
                }`}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                <div className="text-xs uppercase tracking-wide mb-4 opacity-70">
                  {currentCard?.type === 'qa' ? 'Answer' :
                   currentCard?.type === 'term_definition' ? 'Definition' :
                   currentCard?.type === 'image_description' ? 'Term' :
                   'Answer'}
                </div>
                
                <div className={`text-center ${userSpeed === 1 ? 'text-2xl' : 'text-xl'} font-bold`}>
                  {currentCard?.back}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
              userSpeed === 1 ? 'text-lg' : 'text-base'
            } bg-white/20 backdrop-blur text-white hover:bg-white/30`}
            onClick={() => dispatch(previousCard())}
            disabled={currentCardIndex === 0}
            whileHover={{ scale: currentCardIndex === 0 ? 1 : 1.05 }}
            whileTap={{ scale: currentCardIndex === 0 ? 1 : 0.95 }}
            style={{ opacity: currentCardIndex === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </motion.button>
          
          <motion.button
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
              userSpeed === 1 ? 'text-lg' : 'text-base'
            } bg-white/20 backdrop-blur text-white hover:bg-white/30`}
            onClick={async () => {
              if (currentCardIndex === flashcards.length - 1) {
                // First dispatch nextCard to set showingResults = true
                dispatch(nextCard());
                // Then handle completion after a small delay to ensure state is updated
                setTimeout(async () => {
                await handleComplete();
                }, 100);
              } else {
                dispatch(nextCard());
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next →'}
          </motion.button>
        </motion.div>
      </div>
    </DynamicBackground>
  )
}

export default FlashcardScreen 