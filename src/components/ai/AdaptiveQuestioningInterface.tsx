import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { generateAdaptiveQuestion } from '../../features/smartTutor/smartTutorSlice'

interface AdaptiveQuestioningInterfaceProps {
  contentId: string
  userId: string
  userSpeed: number
  currentProgress: number
  onQuestionAnswered?: (answer: any) => void
  onStruggleDetected?: (context: string) => void
}

export const AdaptiveQuestioningInterface: React.FC<AdaptiveQuestioningInterfaceProps> = ({
  contentId,
  userId,
  userSpeed,
  currentProgress,
  onQuestionAnswered,
  onStruggleDetected
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentQuestion, tutorEnabled } = useSelector((state: RootState) => state.smartTutor)
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showQuestion, setShowQuestion] = useState(false)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  
  useEffect(() => {
    // Generate question based on progress
    if (tutorEnabled && currentProgress > 0.3 && !currentQuestion) {
      dispatch(generateAdaptiveQuestion({
        contentId,
        userId,
        currentProgress,
        userSpeed
      }))
    }
  }, [tutorEnabled, currentProgress, contentId, userId, userSpeed, dispatch])
  
  const handleAnswerSubmit = () => {
    if (selectedAnswer && currentQuestion) {
      const answerData = {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect: selectedAnswer === currentQuestion.correctAnswer,
        timestamp: Date.now()
      }
      
      if (onQuestionAnswered) {
        onQuestionAnswered(answerData)
      }
      
      // If answer is incorrect, trigger struggle detection
      if (!answerData.isCorrect && onStruggleDetected) {
        onStruggleDetected(`Incorrect answer to ${currentQuestion.questionType} question`)
      }
      
      setAnswerSubmitted(true)
    }
  }
  
  const handleNextQuestion = () => {
    setSelectedAnswer('')
    setAnswerSubmitted(false)
    setShowQuestion(false)
    // Generate next question
    dispatch(generateAdaptiveQuestion({
      contentId,
      userId,
      currentProgress,
      userSpeed
    }))
  }
  
  if (!tutorEnabled || !currentQuestion) {
    return null
  }
  
  return (
    <div className="adaptive-questioning-interface">
      {!showQuestion && (
        <button 
          className="show-question-btn"
          onClick={() => setShowQuestion(true)}
        >
          🤔 Check Understanding
        </button>
      )}
      
      {showQuestion && (
        <div className="question-container">
          <div className="question-header">
            <h4>Quick Check</h4>
            <button 
              className="close-question"
              onClick={() => setShowQuestion(false)}
            >
              ×
            </button>
          </div>
          
          <div className="question-content">
            <p className="question-text">{currentQuestion.questionText}</p>
            
            {currentQuestion.questionType === 'multiple-choice' && currentQuestion.options && (
              <div className="answer-options">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="answer-option">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      disabled={answerSubmitted}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion.questionType === 'true-false' && (
              <div className="answer-options">
                <label className="answer-option">
                  <input
                    type="radio"
                    name="answer"
                    value="true"
                    checked={selectedAnswer === 'true'}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={answerSubmitted}
                  />
                  True
                </label>
                <label className="answer-option">
                  <input
                    type="radio"
                    name="answer"
                    value="false"
                    checked={selectedAnswer === 'false'}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={answerSubmitted}
                  />
                  False
                </label>
              </div>
            )}
            
            {currentQuestion.questionType === 'open-ended' && (
              <textarea
                className="open-answer"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={answerSubmitted}
                placeholder="Type your answer here..."
              />
            )}
            
            {!answerSubmitted && (
              <button 
                className="submit-answer-btn"
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </button>
            )}
            
            {answerSubmitted && (
              <div className="answer-feedback">
                <div className={`feedback ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
                  {selectedAnswer === currentQuestion.correctAnswer 
                    ? '✅ Correct!' 
                    : '❌ Not quite right.'
                  }
                </div>
                
                {currentQuestion.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>
                )}
                
                <button 
                  className="next-question-btn"
                  onClick={handleNextQuestion}
                >
                  Next Question
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdaptiveQuestioningInterface 