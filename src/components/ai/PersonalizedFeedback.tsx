import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { generatePersonalizedFeedback } from '../../features/smartTutor/smartTutorSlice'

interface PersonalizedFeedbackProps {
  userId: string
  contentId: string
  userSpeed: number
  recentInteractions: number
  onFeedbackGiven?: (feedback: any) => void
  onImprovementSuggested?: (suggestion: any) => void
}

export const PersonalizedFeedback: React.FC<PersonalizedFeedbackProps> = ({
  userId,
  contentId,
  userSpeed,
  recentInteractions,
  onFeedbackGiven,
  onImprovementSuggested
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    feedbackHistory, 
    tutorEnabled, 
    feedbackStyle,
    currentSession 
  } = useSelector((state: RootState) => state.smartTutor)
  
  const [currentFeedback, setCurrentFeedback] = useState<any>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  
  useEffect(() => {
    // Generate feedback based on recent interactions
    if (tutorEnabled && recentInteractions > 0 && recentInteractions % 5 === 0) {
      dispatch(generatePersonalizedFeedback({
        userId,
        contentId,
        userSpeed,
        recentPerformance: calculatePerformance(),
        feedbackStyle
      }))
    }
  }, [recentInteractions, tutorEnabled, userId, contentId, userSpeed, feedbackStyle, dispatch])
  
  const calculatePerformance = () => {
    // Mock performance calculation
    return {
      engagement: Math.random() * 100,
      accuracy: Math.random() * 100,
      speed: Math.random() * 100
    }
  }
  
  const handleFeedbackClick = (feedback: any) => {
    setCurrentFeedback(feedback)
    setShowFeedback(true)
    
    if (onFeedbackGiven) {
      onFeedbackGiven(feedback)
    }
  }
  
  const handleImprovementSuggestion = (suggestion: string) => {
    if (onImprovementSuggested) {
      onImprovementSuggested({ suggestion, timestamp: Date.now() })
    }
  }
  
  const recentFeedback = feedbackHistory.slice(-3) // Last 3 feedback items
  
  if (!tutorEnabled) {
    return null
  }
  
  return (
    <div className="personalized-feedback">
      {/* Feedback History */}
      {recentFeedback.length > 0 && (
        <div className="feedback-history">
          <h4>Recent Feedback</h4>
          {recentFeedback.map((feedback) => (
            <div 
              key={feedback.id}
              className={`feedback-item ${feedback.feedbackType}`}
              onClick={() => handleFeedbackClick(feedback)}
            >
              <div className="feedback-preview">
                {feedback.feedbackText.substring(0, 50)}...
              </div>
              <div className="feedback-type">
                {feedback.feedbackType}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Current Feedback Display */}
      {showFeedback && currentFeedback && (
        <div className="feedback-display">
          <div className="feedback-header">
            <span className={`feedback-type ${currentFeedback.feedbackType}`}>
              {currentFeedback.feedbackType === 'positive' && '🎉'}
              {currentFeedback.feedbackType === 'corrective' && '🔄'}
              {currentFeedback.feedbackType === 'encouraging' && '💪'}
              {currentFeedback.feedbackType === 'strategic' && '🎯'}
              {currentFeedback.feedbackType}
            </span>
            <button 
              className="close-feedback"
              onClick={() => setShowFeedback(false)}
            >
              ×
            </button>
          </div>
          
          <div className="feedback-content">
            <p>{currentFeedback.feedbackText}</p>
            
            {currentFeedback.improvementSuggestions && currentFeedback.improvementSuggestions.length > 0 && (
              <div className="improvement-suggestions">
                <h5>Suggestions for improvement:</h5>
                <ul>
                  {currentFeedback.improvementSuggestions.map((suggestion: string, index: number) => (
                    <li key={index} onClick={() => handleImprovementSuggestion(suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Feedback Request */}
      {!showFeedback && (
        <button 
          className="request-feedback-btn"
          onClick={() => {
            // Generate new feedback
            dispatch(generatePersonalizedFeedback({
              userId,
              contentId,
              userSpeed,
              recentPerformance: calculatePerformance(),
              feedbackStyle
            }))
          }}
        >
          📝 Get Feedback
        </button>
      )}
    </div>
  )
}

export default PersonalizedFeedback 