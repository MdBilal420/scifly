import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { loadAdaptiveLesson, startLearningSession, endLearningSession, addInteraction, trackInteraction, requestSpeedRecommendation } from '../features/adaptive/adaptiveSlice'
import { updateSpeedPerformance } from '../features/user/userSlice'
import { generateUIConfig } from '../utils/generativeUI'
import MasterContentRenderer from './content/MasterContentRenderer'

interface AdaptiveLessonContainerProps {
  lessonId?: string
  topicId: string
  children: React.ReactNode
  onLessonComplete?: (completed: boolean, engagementScore: number, timeSpent: number) => void
}

export const AdaptiveLessonContainer: React.FC<AdaptiveLessonContainerProps> = ({
  lessonId,
  topicId,
  children,
  onLessonComplete
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { 
    currentLessonContent, 
    isLoading, 
    currentSession, 
    adaptiveMode,
    showSpeedSuggestion,
    speedRecommendations,
    debugMode 
  } = useSelector((state: RootState) => state.adaptive)

  const [engagementScore, setEngagementScore] = useState(0)
  const [interactionCount, setInteractionCount] = useState(0)
  const [startTime] = useState(Date.now())

  // Load adaptive content when component mounts or user speed changes
  useEffect(() => {
    if (currentUser && adaptiveMode !== 'disabled' && lessonId) {
      const request = {
        lessonId,
        userId: currentUser.id,
        userSpeed: currentUser.learningSpeed,
        topicId
      }

      dispatch(loadAdaptiveLesson(request))
      dispatch(startLearningSession({ userId: currentUser.id, lessonId }))

      // Request speed recommendation after a delay
      setTimeout(() => {
        dispatch(requestSpeedRecommendation(currentUser.id))
      }, 30000) // After 30 seconds
    }

    return () => {
      if (currentSession) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000)
        const completed = engagementScore > 0.7
        
        dispatch(endLearningSession({ completed }))
        
        if (onLessonComplete) {
          onLessonComplete(completed, engagementScore, timeSpent)
        }

        // Update user speed performance
        if (currentUser) {
          dispatch(updateSpeedPerformance({
            speed: currentUser.learningSpeed,
            lessonCompleted: completed,
            engagementScore,
            completionTime: timeSpent
          }))
        }
      }
    }
  }, [currentUser?.learningSpeed, lessonId, adaptiveMode])

  // Calculate engagement score based on interactions
  const calculateEngagement = useCallback(() => {
    if (!currentSession || currentSession.interactions.length === 0) return 0

    const totalTime = Date.now() - currentSession.startTime
    const expectedTime = 300000 // 5 minutes baseline
    const timeScore = Math.min(1, totalTime / expectedTime)
    
    const interactionScore = Math.min(1, currentSession.interactions.length / 10) // 10 interactions = full score
    
    const completionScore = currentSession.interactions.filter(i => i.interactionType === 'complete').length > 0 ? 1 : 0.5
    
    return (timeScore * 0.3) + (interactionScore * 0.4) + (completionScore * 0.3)
  }, [currentSession])

  // Track user interactions automatically
  const trackUserInteraction = useCallback((type: string, data: any = {}) => {
    if (!currentUser || !currentSession || adaptiveMode === 'disabled' || !lessonId) return

    const engagement = calculateEngagement()
    setEngagementScore(engagement)
    setInteractionCount(prev => prev + 1)

    const interaction = {
      userId: currentUser.id,
      lessonId,
      adaptationId: currentLessonContent?.trackingId,
      interactionType: type as any,
      interactionData: {
        ...data,
        interactionCount,
        currentSpeed: currentUser.learningSpeed
      },
      engagementScore: engagement,
      timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000)
    }

    dispatch(addInteraction(interaction))
    
    // Dispatch to backend every few interactions
    if (interactionCount % 3 === 0) {
      dispatch(trackInteraction(interaction))
    }
  }, [currentUser, currentSession, currentLessonContent, lessonId, interactionCount, calculateEngagement, startTime])

  // Get UI configuration based on user speed
  const uiConfig = useMemo(() => {
    if (!currentUser || !currentLessonContent) {
      return generateUIConfig(3) // Default balanced config
    }
    
    return currentLessonContent.uiConfig || generateUIConfig(currentUser.learningSpeed)
  }, [currentUser, currentLessonContent])

  // Enhanced children with tracking capabilities
  const enhancedChildren = useMemo(() => {
    if (!React.isValidElement(children)) return children

    return React.cloneElement(children as React.ReactElement, {
      onInteraction: trackUserInteraction,
      adaptiveContent: currentLessonContent?.adaptedContent,
      userSpeed: currentUser?.learningSpeed || 3,
      uiConfig,
      isAdaptive: adaptiveMode !== 'disabled',
      engagementScore,
      interactionCount
    })
  }, [children, trackUserInteraction, currentLessonContent, currentUser, uiConfig, adaptiveMode, engagementScore, interactionCount])

  // Loading state
  if (isLoading) {
    return (
      <div className="adaptive-lesson-container loading" data-speed={currentUser?.learningSpeed || 3}>
        <div className="loading-indicator">
          <div className="spinner animate-spin"></div>
          <p>Personalizing your learning experience...</p>
        </div>
      </div>
    )
  }

  // Speed recommendation notification
  const SpeedRecommendationNotification = () => {
    if (!showSpeedSuggestion || !speedRecommendations.length) return null

    const recommendation = speedRecommendations[0]

    return (
      <div className="speed-recommendation-notification bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800">Learning Speed Suggestion</h4>
            <p className="text-blue-600 text-sm">
              Based on your performance, we recommend switching to speed {recommendation.suggestedSpeed}.
            </p>
            <p className="text-blue-500 text-xs mt-1">
              {recommendation.reason} (Confidence: {Math.round(recommendation.confidence * 100)}%)
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                dispatch({ type: 'adaptive/acceptSpeedRecommendation', payload: recommendation.suggestedSpeed })
                dispatch({ type: 'user/updateUserSpeed', payload: { 
                  newSpeed: recommendation.suggestedSpeed, 
                  reason: 'ai_suggestion' 
                }})
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Accept
            </button>
            <button 
              onClick={() => dispatch({ type: 'adaptive/dismissSpeedSuggestion' })}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Debug information (only in debug mode)
  const DebugInfo = () => {
    if (!debugMode) return null

    return (
      <div className="debug-info bg-gray-100 border rounded p-3 mb-4 text-xs font-mono">
        <h5 className="font-bold mb-2">Debug Information</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>Speed: {currentUser?.learningSpeed}</div>
          <div>Engagement: {Math.round(engagementScore * 100)}%</div>
          <div>Interactions: {interactionCount}</div>
          <div>Session: {currentSession?.sessionId}</div>
          <div>Adaptive Content: {currentLessonContent ? 'Loaded' : 'None'}</div>
          <div>UI Config: {uiConfig ? 'Applied' : 'Default'}</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`adaptive-lesson-container speed-${currentUser?.learningSpeed || 3} ${adaptiveMode}`}
      data-lesson-id={lessonId}
      data-user-speed={currentUser?.learningSpeed}
      data-adaptive-mode={adaptiveMode}
      style={{
        '--adaptive-font-size': uiConfig?.fontSize || 'standard',
        '--adaptive-layout': uiConfig?.layout || 'balanced-layout',
        '--adaptive-animation-speed': uiConfig?.animations || 'standard',
        '--adaptive-color-scheme': uiConfig?.colors || 'vibrant'
      } as React.CSSProperties}
    >
      <DebugInfo />
      <SpeedRecommendationNotification />
      
      <div className="adaptive-content-wrapper">
        {enhancedChildren}
      </div>
      
      {/* Invisible interaction tracking overlay */}
      <div 
        className="interaction-overlay absolute inset-0 pointer-events-none"
        onMouseMove={() => trackUserInteraction('move')}
        onScroll={() => trackUserInteraction('scroll')}
      />
    </div>
  )
}

export default AdaptiveLessonContainer 