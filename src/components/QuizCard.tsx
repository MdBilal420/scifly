import React from 'react'
import { motion } from 'framer-motion'

interface QuizCardProps {
  question: string
  options: string[]
  selectedAnswer?: number
  correctAnswer?: number
  onAnswerSelect: (answerIndex: number) => void
  showResult?: boolean
  disabled?: boolean
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  onAnswerSelect,
  showResult = false,
  disabled = false
}) => {
  const getOptionStyle = (index: number) => {
    let baseClasses = 'w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 cursor-pointer'
    
    if (disabled) {
      baseClasses += ' cursor-not-allowed'
    }
    
    if (showResult) {
      if (index === correctAnswer) {
        return `${baseClasses} bg-success-100 border-success-500 text-success-800`
      } else if (index === selectedAnswer && index !== correctAnswer) {
        return `${baseClasses} bg-red-100 border-red-500 text-red-800`
      } else {
        return `${baseClasses} bg-gray-100 border-gray-300 text-gray-600`
      }
    }
    
    if (selectedAnswer === index) {
      return `${baseClasses} bg-primary-100 border-primary-500 text-primary-800 shadow-md`
    }
    
    return `${baseClasses} bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:shadow-sm`
  }

  const getOptionIcon = (index: number) => {
    if (!showResult) return null
    
    if (index === correctAnswer) {
      return <span className="text-success-500 text-xl">✓</span>
    } else if (index === selectedAnswer && index !== correctAnswer) {
      return <span className="text-red-500 text-xl">✗</span>
    }
    
    return null
  }

  return (
    <motion.div
      className="card w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-comic font-bold text-gray-800 mb-6">{question}</h2>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            className={getOptionStyle(index)}
            onClick={() => !disabled && onAnswerSelect(index)}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {getOptionIcon(index)}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default QuizCard 