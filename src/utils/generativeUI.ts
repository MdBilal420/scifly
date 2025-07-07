import { getModesForSpeed, SpeedModeMapping, LearningMode } from '../config/learningModes'

export interface AdaptiveContent {
  text: string
  visualElements: string[]
  interactions: string[]
  pacing: number
  complexity: string
}

export interface GeneratedUIConfig {
  layout: string
  components: string[]
  styling: Record<string, any>
  behavior: Record<string, any>
}

/**
 * Generate adaptive content based on user's learning speed
 */
export const generateContentForSpeed = (
  rawContent: string, 
  userSpeed: number
): AdaptiveContent => {
  const mapping = getModesForSpeed(userSpeed)
  
  return {
    text: adaptTextForSpeed(rawContent, mapping),
    visualElements: generateVisualElements(mapping),
    interactions: generateInteractions(mapping),
    pacing: calculatePacing(mapping.characteristics.pacing),
    complexity: mapping.characteristics.complexity
  }
}

/**
 * Adapt text content based on speed characteristics
 */
const adaptTextForSpeed = (content: string, mapping: SpeedModeMapping): string => {
  const { contentChunking, repetition } = mapping.characteristics
  
  switch (contentChunking) {
    case 'small':
      return chunkIntoSmallPieces(content, repetition === 'high')
    case 'medium':
      return chunkIntoMediumPieces(content)
    case 'large':
      return expandWithDetails(content)
    default:
      return content
  }
}

/**
 * Break content into small, digestible pieces
 */
const chunkIntoSmallPieces = (content: string, addRepetition: boolean): string => {
  const sentences = content.split('. ')
  const simplified = sentences.map(sentence => {
    // Simplify vocabulary and structure
    return sentence
      .replace(/\b(approximately|approximately|essentially|fundamentally)\b/gi, '')
      .replace(/\b(therefore|consequently|furthermore)\b/gi, 'So')
      .replace(/\b(utilize|implement)\b/gi, 'use')
  })
  
  if (addRepetition) {
    // Add reinforcement sentences
    return simplified.map(sentence => 
      `${sentence}. ${generateReinforcementSentence(sentence)}`
    ).join(' ')
  }
  
  return simplified.join('. ')
}

/**
 * Create medium-sized content chunks
 */
const chunkIntoMediumPieces = (content: string): string => {
  // Keep original structure but add transitional phrases
  return content
    .replace(/\. /g, '. \n\n**Next:** ')
    .replace(/\n\n\*\*Next:\*\* $/, '')
}

/**
 * Expand content with additional details
 */
const expandWithDetails = (content: string): string => {
  // Add technical details and deeper explanations
  return content
    .replace(/gravity/gi, 'gravitational force (the fundamental interaction that attracts objects with mass)')
    .replace(/photosynthesis/gi, 'photosynthesis (the complex biochemical process by which plants convert light energy into chemical energy)')
}

/**
 * Generate reinforcement sentences for better understanding
 */
const generateReinforcementSentence = (originalSentence: string): string => {
  const reinforcements = [
    'This means',
    'In other words',
    'Simply put',
    'To put it another way'
  ]
  
  const randomReinforcement = reinforcements[Math.floor(Math.random() * reinforcements.length)]
  return `${randomReinforcement}, this is important to remember.`
}

/**
 * Generate visual elements based on learning mode
 */
const generateVisualElements = (mapping: SpeedModeMapping): string[] => {
  const elements: string[] = []
  
  if (mapping.primary === 'visual' || mapping.secondary === 'visual') {
    elements.push('diagrams', 'illustrations', 'infographics')
  }
  
  if (mapping.primary === 'simplified') {
    elements.push('large-icons', 'simple-diagrams', 'color-coding')
  }
  
  if (mapping.characteristics.visualSupport === 'extensive') {
    elements.push('animations', 'step-by-step-visuals', 'interactive-images')
  }
  
  return elements
}

/**
 * Generate interactions based on learning mode
 */
const generateInteractions = (mapping: SpeedModeMapping): string[] => {
  const interactions: string[] = []
  
  switch (mapping.uiElements.interactionLevel) {
    case 'simple':
      interactions.push('click-to-reveal', 'simple-navigation')
      break
    case 'moderate':
      interactions.push('drag-drop', 'interactive-quizzes', 'hover-effects')
      break
    case 'complex':
      interactions.push('simulations', 'chat-interface', 'advanced-controls')
      break
  }
  
  if (mapping.primary === 'kinesthetic') {
    interactions.push('hands-on-activities', 'manipulatives')
  }
  
  if (mapping.primary === 'conversational') {
    interactions.push('ai-chat', 'question-prompts', 'exploration-tools')
  }
  
  return interactions
}

/**
 * Calculate pacing multiplier
 */
const calculatePacing = (pacing: 'slow' | 'medium' | 'fast'): number => {
  switch (pacing) {
    case 'slow': return 0.5
    case 'medium': return 1.0
    case 'fast': return 1.5
    default: return 1.0
  }
}

/**
 * Generate UI configuration for a specific learning speed
 */
export const generateUIConfig = (userSpeed: number): GeneratedUIConfig => {
  const mapping = getModesForSpeed(userSpeed)
  
  return {
    layout: determineLayout(mapping),
    components: determineComponents(mapping),
    styling: generateStyling(mapping),
    behavior: generateBehavior(mapping)
  }
}

/**
 * Determine optimal layout for learning mode
 */
const determineLayout = (mapping: SpeedModeMapping): string => {
  if (mapping.primary === 'simplified') return 'single-column-large'
  if (mapping.primary === 'visual') return 'image-focused'
  if (mapping.primary === 'reading') return 'text-focused'
  if (mapping.primary === 'conversational') return 'chat-interface'
  return 'balanced-layout'
}

/**
 * Determine which components to include
 */
const determineComponents = (mapping: SpeedModeMapping): string[] => {
  const components = ['content-area']
  
  if (mapping.characteristics.visualSupport !== 'minimal') {
    components.push('visual-area')
  }
  
  if (mapping.primary === 'conversational') {
    components.push('chat-area')
  }
  
  if (mapping.secondary === 'kinesthetic') {
    components.push('interactive-area')
  }
  
  if (mapping.characteristics.navigation === 'linear') {
    components.push('simple-navigation')
  } else {
    components.push('advanced-navigation')
  }
  
  return components
}

/**
 * Generate styling configuration
 */
const generateStyling = (mapping: SpeedModeMapping): Record<string, any> => {
  return {
    fontSize: mapping.uiElements.fontSize,
    colorScheme: mapping.uiElements.colors,
    animationSpeed: mapping.uiElements.animations,
    spacing: mapping.characteristics.contentChunking === 'small' ? 'large' : 'normal',
    contrast: mapping.uiElements.colors === 'calming' ? 'high' : 'normal'
  }
}

/**
 * Generate behavior configuration
 */
const generateBehavior = (mapping: SpeedModeMapping): Record<string, any> => {
  return {
    autoAdvance: mapping.characteristics.pacing === 'fast',
    showHints: mapping.characteristics.repetition === 'high',
    allowSkipping: mapping.characteristics.navigation === 'free',
    pauseOnInteraction: mapping.characteristics.pacing === 'slow'
  }
} 