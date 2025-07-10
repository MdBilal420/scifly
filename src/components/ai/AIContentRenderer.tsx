import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { 
  generateAIContent, 
  adjustContentDifficulty, 
  updateContentEffectiveness,
  addToGenerationQueue 
} from '../../features/aiContent/aiContentSlice'
import { generateSmartHint } from '../../features/smartTutor/smartTutorSlice'

// Import Phase 2 components
import MasterContentRenderer from '../content/MasterContentRenderer'
import { AdaptiveLayoutSelector } from '../layouts/SpeedBasedLayout'
import SmartHintSystem from './SmartHintSystem'
import AdaptiveQuestioningInterface from './AdaptiveQuestioningInterface'
import PersonalizedFeedback from './PersonalizedFeedback'

interface AIContentRendererProps {
  lessonId: string
  topicId: string
  originalContent: any
  onLessonComplete?: (results: any) => void
  onContentAdapted?: (adaptedContent: any) => void
}

export const AIContentRenderer: React.FC<AIContentRendererProps> = ({
  lessonId,
  topicId,
  originalContent,
  onLessonComplete,
  onContentAdapted
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { 
    generatedContent, 
    contentLoading, 
    aiEnabled, 
    personalizationLevel 
  } = useSelector((state: RootState) => state.aiContent)
  
  const { 
    currentSession: tutorSession, 
    tutorEnabled, 
    showHintPanel 
  } = useSelector((state: RootState) => state.smartTutor)
  
  const [strugglingAreas, setStruggling] = useState<string[]>([])
  const [engagementScore, setEngagementScore] = useState(0)
  const [startTime] = useState(Date.now())
  const [interactionCount, setInteractionCount] = useState(0)
  
  const userSpeed = currentUser?.learningSpeed || 3
  const contentKey = `${lessonId}-${currentUser?.id || 'anonymous'}`
  const aiGeneratedContent = generatedContent[contentKey]
  const isLoading = contentLoading[contentKey] || false
  
  // Generate AI content when component mounts or user changes
  useEffect(() => {
    if (currentUser && aiEnabled && originalContent) {
      // Check if we need to generate new content
      const shouldGenerate = !aiGeneratedContent || 
        (Date.now() - aiGeneratedContent.generatedAt) > 600000 // 10 minutes
      
      if (shouldGenerate) {
        dispatch(generateAIContent({
          lessonId,
          userId: currentUser.id,
          userSpeed,
          originalContent,
          personalizationLevel
        }))
      }
    }
  }, [currentUser, aiEnabled, originalContent, lessonId, userSpeed, personalizationLevel])
  
  // Track user interactions and engagement
  const handleInteraction = useCallback((type: string, data?: any) => {
    setInteractionCount(prev => prev + 1)
    
    // Calculate engagement based on interaction frequency and type
    const timeSpent = (Date.now() - startTime) / 1000
    const interactionRate = interactionCount / (timeSpent / 60) // per minute
    const newEngagementScore = Math.min(1, interactionRate / 5) // 5 interactions per minute = max engagement
    
    setEngagementScore(newEngagementScore)
    
    // Detect struggling areas
    if (type === 'struggle' || type === 'hint_request' || type === 'repeated_error') {
      const area = data?.area || data?.concept || 'general'
      if (!strugglingAreas.includes(area)) {
        setStruggling(prev => [...prev, area])
      }
    }
    
    // Update content effectiveness
    if (aiGeneratedContent) {
      const effectiveness = (newEngagementScore * 0.6) + (interactionCount > 0 ? 0.4 : 0)
      dispatch(updateContentEffectiveness({
        contentId: aiGeneratedContent.id,
        effectiveness
      }))
    }
  }, [interactionCount, startTime, strugglingAreas, aiGeneratedContent, dispatch])
  
  // Adjust difficulty based on performance
  const handleDifficultyAdjustment = useCallback((adjustment: number, reason: string) => {
    if (aiGeneratedContent) {
      dispatch(adjustContentDifficulty({
        contentId: aiGeneratedContent.id,
        difficultyAdjustment: adjustment,
        reason
      }))
    }
  }, [aiGeneratedContent, dispatch])
  
  // Generate smart hint when user struggles
  const handleStruggleDetected = useCallback((context: string) => {
    if (currentUser && tutorEnabled && aiGeneratedContent) {
      dispatch(generateSmartHint({
        contentId: aiGeneratedContent.id,
        userId: currentUser.id,
        struggleContext: context,
        userSpeed,
        previousHints: [] // TODO: Get from tutor session
      }))
    }
  }, [currentUser, tutorEnabled, aiGeneratedContent, userSpeed, dispatch])
  
  // Handle lesson completion
  const handleLessonComplete = useCallback((results: any) => {
    const completionData = {
      ...results,
      aiEnhanced: aiEnabled,
      engagementScore,
      interactionCount,
      strugglingAreas,
      contentEffectiveness: aiGeneratedContent?.effectiveness || 0,
      timeSpent: (Date.now() - startTime) / 1000
    }
    
    if (onLessonComplete) {
      onLessonComplete(completionData)
    }
  }, [aiEnabled, engagementScore, interactionCount, strugglingAreas, aiGeneratedContent, startTime, onLessonComplete])
  
  // Notify parent of content adaptation
  useEffect(() => {
    if (aiGeneratedContent && onContentAdapted) {
      onContentAdapted(aiGeneratedContent.adaptedContent)
    }
  }, [aiGeneratedContent, onContentAdapted])
  
  // Loading state
  if (isLoading) {
    return (
      <div className="ai-content-renderer loading">
        <AdaptiveLayoutSelector speed={userSpeed} className="loading-layout">
          <div className="ai-loading-indicator">
            <div className="spinner">🤖</div>
            <h3>AI is personalizing your learning experience...</h3>
            <p>Analyzing your learning style and creating adapted content</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </AdaptiveLayoutSelector>
      </div>
    )
  }
  
  // Fallback to original content if AI is disabled or failed
  const contentToRender = aiEnabled && aiGeneratedContent 
    ? aiGeneratedContent.adaptedContent 
    : originalContent
  
  return (
    <div className="ai-content-renderer" data-ai-enabled={aiEnabled}>
      <AdaptiveLayoutSelector speed={userSpeed} className="ai-enhanced-layout">
        {/* Smart Hint System */}
        {tutorEnabled && showHintPanel && (
          <SmartHintSystem 
            contentId={aiGeneratedContent?.id || lessonId}
            userId={currentUser?.id || ''}
            strugglingAreas={strugglingAreas}
            onHintUsed={(hint) => handleInteraction('hint_used', { hint })}
            onStruggleDetected={handleStruggleDetected}
          />
        )}
        
        {/* Main Content with AI Enhancement */}
        <MasterContentRenderer
          lessonId={lessonId}
          topicId={topicId}
          content={contentToRender}
          onLessonComplete={handleLessonComplete}
          onInteraction={handleInteraction}
          aiEnhanced={aiEnabled && !!aiGeneratedContent}
          engagementScore={engagementScore}
          strugglingAreas={strugglingAreas}
        />
        
        {/* Adaptive Questioning Interface */}
        {tutorEnabled && (
          <AdaptiveQuestioningInterface
            contentId={aiGeneratedContent?.id || lessonId}
            userId={currentUser?.id || ''}
            userSpeed={userSpeed}
            currentProgress={engagementScore}
            onQuestionAnswered={(answer) => handleInteraction('question_answered', answer)}
            onStruggleDetected={handleStruggleDetected}
          />
        )}
        
        {/* Personalized Feedback System */}
        {tutorEnabled && (
          <PersonalizedFeedback
            userId={currentUser?.id || ''}
            contentId={aiGeneratedContent?.id || lessonId}
            userSpeed={userSpeed}
            recentInteractions={interactionCount}
            onFeedbackGiven={(feedback) => handleInteraction('feedback_received', feedback)}
            onImprovementSuggested={(suggestion) => handleInteraction('improvement_suggested', suggestion)}
          />
        )}
        
        {/* AI Content Controls */}
        {aiEnabled && aiGeneratedContent && (
          <div className="ai-content-controls">
            <div className="content-metrics">
              <div className="metric">
                <span className="label">Engagement:</span>
                <span className="value">{Math.round(engagementScore * 100)}%</span>
              </div>
              <div className="metric">
                <span className="label">Difficulty:</span>
                <span className="value">{aiGeneratedContent.difficultyLevel}/10</span>
              </div>
              <div className="metric">
                <span className="label">Personalization:</span>
                <span className="value">{aiGeneratedContent.personalizationLevel}%</span>
              </div>
            </div>
            
            <div className="difficulty-controls">
              <button 
                className="difficulty-btn easier"
                onClick={() => handleDifficultyAdjustment(-1, 'User requested easier content')}
                disabled={aiGeneratedContent.difficultyLevel <= 1}
              >
                Make Easier
              </button>
              <button 
                className="difficulty-btn harder"
                onClick={() => handleDifficultyAdjustment(1, 'User requested harder content')}
                disabled={aiGeneratedContent.difficultyLevel >= 10}
              >
                Make Harder
              </button>
            </div>
          </div>
        )}
      </AdaptiveLayoutSelector>
      
      {/* AI Enhancement Indicator */}
      {aiEnabled && aiGeneratedContent && (
        <div className="ai-enhancement-indicator">
          <div className="ai-badge">
            <span className="ai-icon">🤖</span>
            <span className="ai-text">AI Enhanced</span>
            <div className="ai-tooltip">
              Content personalized for your learning style and speed
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIContentRenderer 