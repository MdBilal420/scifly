import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { startQuiz, answerQuestion, nextQuestion, resetQuiz } from '../features/quiz/quizSlice'
import { unlockAchievement } from '../features/achievements/achievementSlice'
import { generateQuizQuestions } from '../features/topics/topicsSlice'
import QuizCard from '../components/QuizCard'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import SimbaMascot from '../components/SimbaMascot'
import DynamicBackground from '../components/DynamicBackground'

interface QuizScreenProps {
  onNavigate: (screen: string) => void
}

const QuizScreen: React.FC<QuizScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch()
  const quizState = useAppSelector((state) => state.quiz)
  const { currentTopic, quizQuestions, isGeneratingQuiz, quizError } = useAppSelector((state) => state.topics)
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined)
  const [showResult, setShowResult] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isQuizComplete, setIsQuizComplete] = useState(false)

  useEffect(() => {
    if (!currentTopic) {
      onNavigate('topics')
      return
    }

    if (quizQuestions.length === 0 && !isGeneratingQuiz) {
      dispatch(generateQuizQuestions(currentTopic))
    }

    return () => {
      dispatch(resetQuiz())
    }
  }, [dispatch, currentTopic, quizQuestions.length, isGeneratingQuiz, onNavigate])

  // Show loading or redirect if no topic selected
  if (!currentTopic) {
    onNavigate('topics')
    return null
  }

  // Show loading state while generating quiz
  if (isGeneratingQuiz || quizQuestions.length === 0) {
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
              Preparing your {currentTopic.title} quiz... 🦁
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  // Show error state if quiz generation failed
  if (quizError) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-6 max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">I couldn't generate the quiz questions. Let's try again!</p>
            <PrimaryButton
              onClick={() => dispatch(generateQuizQuestions(currentTopic))}
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

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    setHasAnswered(true)
    
    // Check if answer is correct
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(undefined)
      setShowResult(false)
      setHasAnswered(false)
    } else {
      // Quiz completed
      setIsQuizComplete(true)
      if (score === quizQuestions.length) {
        dispatch(unlockAchievement('quiz-master'))
      }
    }
  }

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100
    if (percentage === 100) return `Perfect! You're a ${currentTopic.title} expert! 🌟`
    if (percentage >= 80) return `Great job! You really understand ${currentTopic.title}! 🎉`
    if (percentage >= 60) return `Good work! Keep learning about ${currentTopic.title}! 👍`
    return `Nice try! Want to learn more about ${currentTopic.title}? 🤔`
  }

  if (isQuizComplete) {
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
              Quiz Complete!
            </h2>
            
            <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-4 mb-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {score}/{quizQuestions.length}
              </div>
              <p className="text-gray-600">{getScoreMessage()}</p>
            </div>

            <div className="flex justify-center mb-6">
              <SimbaMascot size="md" animate={true} />
            </div>

            <div className="space-y-3">
              <PrimaryButton
                onClick={() => onNavigate('lesson')}
                className="w-full"
                variant="secondary"
                icon="📚"
              >
                Review Lesson
              </PrimaryButton>
              
              <PrimaryButton
                onClick={() => onNavigate('home')}
                className="w-full"
                icon="🏠"
              >
                Go Home
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      </div>
      </DynamicBackground>
    )
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
          className="bg-white/20 backdrop-blur rounded-full p-3"
          onClick={() => onNavigate('home')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-white text-xl">←</span>
        </motion.button>
        
        <div className="flex-1 mx-4">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={quizQuestions.length}
            color="secondary"
            showPercentage={false}
          />
        </div>
        
        <div className="bg-white/20 backdrop-blur rounded-2xl px-3 py-2">
          <span className="text-white font-bold text-sm">
            {currentQuestionIndex + 1}/{quizQuestions.length}
          </span>
        </div>
      </motion.header>

      {/* Quiz Title */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-comic text-2xl font-bold text-white mb-2">
          SciFly {currentTopic.title} Quiz 🧩
        </h1>
        <p className="text-white/80">Test what you've learned!</p>
      </motion.div>

      {/* Question Card */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <QuizCard
            key={currentQuestionIndex}
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            onAnswerSelect={handleAnswerSelect}
            showResult={showResult}
            disabled={hasAnswered}
          />
        </AnimatePresence>
      </motion.div>

      {/* Feedback Section */}
      {showResult && (
        <motion.div
          className="flex items-start gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SimbaMascot size="sm" animate={true} />
          <div className="chat-bubble flex-1">
            <p className="text-gray-700 text-sm">
              {selectedAnswer === currentQuestion.correctAnswer
                ? `Correct! ${currentQuestion.explanation} 🎉`
                : `Not quite! ${currentQuestion.explanation} Keep trying! 💪`
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Next Button */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PrimaryButton
            onClick={handleNext}
            className="w-full"
            variant={currentQuestionIndex === quizQuestions.length - 1 ? 'success' : 'primary'}
            icon={currentQuestionIndex === quizQuestions.length - 1 ? '🏁' : '→'}
          >
            {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </PrimaryButton>
        </motion.div>
      )}
    </div>
    </DynamicBackground>
  )
}

export default QuizScreen 