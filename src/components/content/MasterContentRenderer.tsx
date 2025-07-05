import React, { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { trackInteraction } from '../../features/adaptive/adaptiveSlice'
import { getModesForSpeed } from '../../config/learningModes'

// Import all content renderers
import VisualContentRenderer from './VisualContentRenderer'
import InteractiveContentRenderer from './InteractiveContentRenderer'
import ConversationalContentRenderer from './ConversationalContentRenderer'

// Import layout components
import { 
  AdaptiveLayoutSelector, 
  SpeedResponsiveGrid, 
  SpeedNavigation 
} from '../layouts/SpeedBasedLayout'

// Import styles
import '../../styles/adaptiveComponents.css'

interface MasterContentRendererProps {
  lessonId?: string
  topicId: string
  content: any
  onLessonComplete?: (results: any) => void
  onSpeedChange?: (newSpeed: number) => void
  onInteraction?: (type: string, data?: any) => void
  onNext?: () => void
  onPrevious?: () => void
  aiEnhanced?: boolean
  engagementScore?: number
  strugglingAreas?: string[]
}

interface ContentSection {
  id: string
  type: 'visual' | 'interactive' | 'conversational' | 'mixed'
  content: any
  priority: number
  modes: string[]
}

export const MasterContentRenderer: React.FC<MasterContentRendererProps> = ({
  lessonId,
  topicId,
  content,
  onLessonComplete,
  onSpeedChange,
  onInteraction,
  onNext,
  onPrevious,
  aiEnhanced,
  engagementScore,
  strugglingAreas
}) => {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { currentSession } = useSelector((state: RootState) => state.adaptive)
  
  const userSpeed = currentUser?.learningSpeed || 3
  const speedConfig = getModesForSpeed(userSpeed)
  
  // Process content based on user speed and modes
  const processedContent = useMemo(() => {
    return processContentForSpeed(content, userSpeed, speedConfig)
  }, [content, userSpeed, speedConfig])

  // Track session start
  useEffect(() => {
    if (currentUser && lessonId) {
      const interaction = {
        userId: currentUser.id,
        lessonId,
        interactionType: 'view' as const,
        interactionData: {
          topicId,
          userSpeed,
          modes: [speedConfig.primary, speedConfig.secondary],
          timestamp: new Date().toISOString(),
          action: 'lesson_start'
        },
        engagementScore: 0,
        timeSpentSeconds: 0
      }
      dispatch(trackInteraction(interaction) as any)
    }
  }, [lessonId, topicId, userSpeed, speedConfig, dispatch, currentUser])

  // Handle interactions from child components
  const handleInteraction = (type: string, data?: any) => {
    if (currentUser && lessonId) {
      // Map custom types to valid interaction types
      const validType = mapToValidInteractionType(type)
      
      const interaction = {
        userId: currentUser.id,
        lessonId,
        interactionType: validType,
        interactionData: {
          ...data,
          topicId,
          userSpeed,
          timestamp: new Date().toISOString(),
          originalType: type
        },
        engagementScore: 0.5,
        timeSpentSeconds: Math.floor((Date.now() - (currentSession?.startTime || Date.now())) / 1000)
      }
      dispatch(trackInteraction(interaction) as any)
    }
    
    // Call the external onInteraction callback if provided
    if (onInteraction) {
      onInteraction(type, data)
    }
  }

  // Handle navigation between sections
  const handleNavigation = (direction: 'previous' | 'next' | 'menu') => {
    handleInteraction('navigation', { direction })
  }

  // Render content based on speed and modes
  const renderContentSections = () => {
    const sections = processedContent.sections || []
    
    return sections.map((section: ContentSection) => {
      const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
        <div 
          key={section.id}
          className={`content-section ${section.type} priority-${section.priority}`}
        >
          {children}
        </div>
      )

      switch (section.type) {
        case 'visual':
          return (
            <SectionWrapper key={section.id}>
              <VisualContentRenderer
                content={section.content}
                userSpeed={userSpeed}
                topic={topicId}
                onInteraction={handleInteraction}
              />
            </SectionWrapper>
          )
        
        case 'interactive':
          return (
            <SectionWrapper key={section.id}>
              <InteractiveContentRenderer
                content={section.content}
                userSpeed={userSpeed}
                onInteraction={handleInteraction}
              />
            </SectionWrapper>
          )
        
        case 'conversational':
          return (
            <SectionWrapper key={section.id}>
              <ConversationalContentRenderer
                content={section.content}
                userSpeed={userSpeed}
                onInteraction={handleInteraction}
              />
            </SectionWrapper>
          )
        
        default:
          return null
      }
    })
  }

  return (
    <div className={`master-content-renderer speed-${userSpeed}`}>
      <AdaptiveLayoutSelector
        speed={userSpeed as 1 | 2 | 3 | 4 | 5}
        className="lesson-layout"
        onPrevious={() => handleNavigation('previous')}
        onNext={() => handleNavigation('next')}
        onMenu={() => handleNavigation('menu')}
      >
        {/* Simplified header for Speed 1, detailed for others */}
        {userSpeed === 1 ? (
          <div className="lesson-header simple">
            <h2 className="lesson-title simple">{content?.title || 'Learning Time'}</h2>
          </div>
        ) : (
          <div className="lesson-header">
            <h2 className="lesson-title">{content?.title || 'Interactive Lesson'}</h2>
            <div className="lesson-meta">
              <span className="speed-indicator">
                Speed: {userSpeed} {getSpeedEmoji(userSpeed)}
              </span>
              <span className="modes-indicator">
                Modes: {speedConfig.primary} + {speedConfig.secondary}
              </span>
            </div>
          </div>
        )}

        <div className="lesson-content">
          <SpeedResponsiveGrid
            speed={userSpeed as 1 | 2 | 3 | 4 | 5}
            columns={processedContent.gridColumns}
          >
            {renderContentSections()}
          </SpeedResponsiveGrid>
        </div>

        {/* Only show SpeedNavigation for Speed 3+ since Speed 1-2 have built-in navigation */}
        {userSpeed >= 3 && (
          <div className="lesson-footer">
            <SpeedNavigation
              speed={userSpeed as 1 | 2 | 3 | 4 | 5}
              onPrevious={() => handleNavigation('previous')}
              onNext={() => handleNavigation('next')}
              onMenu={() => handleNavigation('menu')}
            />
          </div>
        )}
      </AdaptiveLayoutSelector>
    </div>
  )
}

// Content processing utilities
const processContentForSpeed = (content: any, userSpeed: number, speedConfig: any) => {
  const primaryMode = speedConfig.primary
  const secondaryMode = speedConfig.secondary
  
  const sections: ContentSection[] = []
  let gridColumns = 1
  
  // Determine grid layout based on speed
  switch (userSpeed) {
    case 1: gridColumns = 1; break
    case 2: gridColumns = 2; break
    case 3: gridColumns = 3; break
    case 4: gridColumns = 2; break
    case 5: gridColumns = 4; break
    default: gridColumns = 2
  }

  // Speed 1: Only simple visual content
  if (userSpeed === 1) {
    sections.push({
      id: 'simple-content',
      type: 'visual',
      content: {
        type: 'simple-display',
        title: content.title || 'Learning Topic',
        description: content.description || content.content || 'Let\'s explore this topic together!',
        image: content.image || '🔬',
        tip: content.tip || 'You\'re doing great! Keep learning!',
        simple: true
      },
      priority: 1,
      modes: [primaryMode, secondaryMode]
    })
  }
  // Speed 2: Visual + some reading
  else if (userSpeed === 2) {
    sections.push({
      id: 'visual-content',
      type: 'visual',
      content: createDefaultVisualContent(content, userSpeed),
      priority: 1,
      modes: [primaryMode, secondaryMode]
    })
  }
  // Speed 3+: Full interactive experience
  else {
    sections.push({
      id: 'default-visual',
      type: 'visual',
      content: createDefaultVisualContent(content, userSpeed),
      priority: 1,
      modes: [primaryMode, secondaryMode]
    })
    
    if (userSpeed >= 3) {
      sections.push({
        id: 'default-interactive',
        type: 'interactive',
        content: createDefaultInteractiveContent(content, userSpeed),
        priority: 2,
        modes: [primaryMode, secondaryMode]
      })
    }
    
    if (userSpeed >= 4) {
      sections.push({
        id: 'default-conversational',
        type: 'conversational',
        content: createDefaultConversationalContent(content, userSpeed),
        priority: 3,
        modes: [primaryMode, secondaryMode]
      })
    }
  }

  return { sections, gridColumns }
}

// Default content creators
const createDefaultVisualContent = (content: any, userSpeed: number) => {
  return {
    title: content?.title || 'Visual Learning',
    visual: [
      {
        type: 'infographic',
        data: {
          title: 'Key Concepts',
          sections: [
            {
              icon: '📚',
              title: 'Main Idea',
              description: content?.mainIdea || 'Core concept explanation'
            },
            {
              icon: '🔍',
              title: 'Details',
              description: content?.details || 'Important details and examples'
            }
          ]
        }
      }
    ]
  }
}

const createDefaultInteractiveContent = (content: any, userSpeed: number) => {
  return {
    title: content?.title || 'Interactive Learning',
    interactive: [
      {
        type: 'drag-drop',
        title: 'Match the Concepts',
        instructions: 'Drag items to their correct categories',
        items: [
          { id: 'item1', label: 'Concept A', icon: '🅰️' },
          { id: 'item2', label: 'Concept B', icon: '🅱️' }
        ],
        targets: [
          { id: 'target1', label: 'Category 1', icon: '📁' },
          { id: 'target2', label: 'Category 2', icon: '📂' }
        ],
        correctMatches: {
          'item1': 'target1',
          'item2': 'target2'
        }
      }
    ]
  }
}

const createDefaultConversationalContent = (content: any, userSpeed: number) => {
  return {
    title: content?.title || 'Discussion & Questions',
    conversation: {
      introduction: "Hi! I'm here to help you explore this topic. What questions do you have?"
    },
    questions: [
      {
        id: 'q1',
        question: 'What do you think about this concept?',
        category: 'understanding',
        difficulty: 'basic',
        followUp: ['Can you think of an example?', 'How does this relate to what you already know?']
      }
    ],
    discussionTopics: [
      {
        id: 'topic1',
        title: 'Real-world Applications',
        description: 'How can we apply this concept in everyday life?',
        icon: '🌍'
      }
    ]
  }
}

// Utility functions
const getSpeedEmoji = (speed: number): string => {
  const emojis = {
    1: '🐢',
    2: '🐨',
    3: '🦁',
    4: '🐎',
    5: '🚀'
  }
  return emojis[speed as keyof typeof emojis] || '🦁'
}

const mapToValidInteractionType = (type: string): 'view' | 'click' | 'complete' | 'skip' => {
  switch (type) {
    case 'lesson_start':
    case 'lesson_view':
    case 'content_view':
      return 'view'
    case 'button_click':
    case 'drag_start':
    case 'drop_attempt':
    case 'slider_change':
    case 'chat_message_sent':
    case 'navigation':
    case 'component_place':
      return 'click'
    case 'lesson_complete':
    case 'activity_complete':
    case 'target_achieved':
      return 'complete'
    case 'lesson_skip':
    case 'activity_skip':
    case 'speed_suggestion_dismissed':
      return 'skip'
    default:
      return 'view'
  }
}

export default MasterContentRenderer 