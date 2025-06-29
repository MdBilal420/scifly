import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { startQuiz, answerQuestion, nextQuestion, resetQuiz } from '../features/quiz/quizSlice'
import { unlockAchievement } from '../features/achievements/achievementSlice'
import QuizCard from '../components/QuizCard'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import SimbaMascot from '../components/SimbaMascot'

interface QuizScreenProps {
  onNavigate: (screen: string) => void
}

const QuizScreen: React.FC<QuizScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch()
  const quizState = useAppSelector((state) => state.quiz)
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined)
  const [showResult, setShowResult] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  useEffect(() => {
    dispatch(startQuiz('gravity-quiz'))
    return () => {
      dispatch(resetQuiz())
    }
  }, [dispatch])

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.totalQuestions) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    setHasAnswered(true)
    
    dispatch(answerQuestion({
      questionId: currentQuestion.id,
      answer: answerIndex
    }))
  }

  const handleNext = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      dispatch(nextQuestion())
      setSelectedAnswer(undefined)
      setShowResult(false)
      setHasAnswered(false)
    } else {
      // Quiz completed
      if (quizState.score === quizState.totalQuestions) {
        dispatch(unlockAchievement('quiz-master'))
      }
      // Navigate to results or home
      onNavigate('home')
    }
  }

  const getScoreMessage = () => {
    const percentage = (quizState.score / quizState.totalQuestions) * 100
    if (percentage === 100) return "Perfect! You're a gravity expert! 🌟"
    if (percentage >= 80) return "Great job! You really understand gravity! 🎉"
    if (percentage >= 60) return "Good work! Keep learning about gravity! 👍"
    return "Nice try! Want to learn more about gravity? 🤔"
  }

  if (quizState.showResults) {
    return (
      <div className="min-h-screen space-background p-4">
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
                {quizState.score}/{quizState.totalQuestions}
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
            current={quizState.currentQuestionIndex + 1}
            total={quizState.totalQuestions}
            color="secondary"
            showPercentage={false}
          />
        </div>
        
        <div className="bg-white/20 backdrop-blur rounded-2xl px-3 py-2">
          <span className="text-white font-bold text-sm">
            {quizState.currentQuestionIndex + 1}/{quizState.totalQuestions}
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
          SciFly Gravity Quiz 🧩
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
            key={currentQuestion.id}
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
            variant={quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'success' : 'primary'}
            icon={quizState.currentQuestionIndex === quizState.questions.length - 1 ? '🏁' : '→'}
          >
            {quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </PrimaryButton>
        </motion.div>
      )}
    </div>
  )
}

export default QuizScreen 