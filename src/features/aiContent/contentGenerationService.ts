import { PersonalizationProfile } from './aiContentSlice'
import { getModesForSpeed } from '../../config/learningModes'

// Types for content generation
export interface ContentGenerationRequest {
  originalContent: any
  userSpeed: number
  personalizationLevel: number
  userProfile?: PersonalizationProfile
}

export interface AdaptedContent {
  text: string
  visualElements: any[]
  interactions: any[]
  difficulty: number
  difficultyLevel: number
  complexity: number
  pacing: string
  style: string
  examples: any[]
  hints: string[]
  confidence: number
}

/**
 * Generate adaptive content based on user profile and learning speed
 */
export const generateAdaptiveContent = async (
  request: ContentGenerationRequest
): Promise<AdaptedContent> => {
  const { originalContent, userSpeed, userProfile } = request
  
  // Get speed-based learning modes
  const speedConfig = getModesForSpeed(userSpeed)
  
  // Base difficulty calculation
  const baseDifficulty = calculateBaseDifficulty(originalContent, userSpeed)
  
  // Apply personalization adjustments
  const personalizedDifficulty = userProfile 
    ? adjustDifficultyForUser(baseDifficulty, userProfile)
    : baseDifficulty
  
  // Generate adapted content
  const adaptedContent: AdaptedContent = {
    text: adaptTextForSpeed(originalContent.text || '', userSpeed, userProfile),
    visualElements: generateVisualElements(originalContent, speedConfig, userProfile),
    interactions: generateInteractions(originalContent, speedConfig, userProfile),
    difficulty: personalizedDifficulty,
    difficultyLevel: Math.round(personalizedDifficulty * 10), // Scale to 1-10
    complexity: typeof speedConfig.characteristics.complexity === 'number' ? speedConfig.characteristics.complexity : 0.6,
    pacing: speedConfig.characteristics.pacing,
    style: determineContentStyle(userProfile, speedConfig),
    examples: generatePersonalizedExamples(originalContent, userProfile),
    hints: generateAdaptiveHints(originalContent, userSpeed, userProfile),
    confidence: calculateConfidence(originalContent, userProfile)
  }
  
  return adaptedContent
}

/**
 * Personalize content for a specific user
 */
export const personalizeContent = async (
  content: AdaptedContent,
  userProfile: PersonalizationProfile
): Promise<AdaptedContent> => {
  return {
    ...content,
    text: personalizeText(content.text, userProfile),
    examples: generatePersonalizedExamples({ text: content.text }, userProfile),
    style: determineContentStyle(userProfile),
    hints: personalizeHints(content.hints, userProfile),
    confidence: calculateConfidence({ text: content.text }, userProfile)
  }
}

/**
 * Adjust content difficulty dynamically
 */
export const adjustDifficulty = async (
  content: AdaptedContent,
  adjustment: number,
  reason: string
): Promise<AdaptedContent> => {
  const newDifficulty = Math.max(0.1, Math.min(1.0, content.difficulty + (adjustment * 0.1)))
  
  return {
    ...content,
    difficulty: newDifficulty,
    difficultyLevel: Math.round(newDifficulty * 10),
    text: adjustTextDifficulty(content.text, adjustment),
    interactions: adjustInteractionDifficulty(content.interactions, adjustment),
    hints: adjustHintDifficulty(content.hints, adjustment),
    confidence: Math.max(0.3, content.confidence - Math.abs(adjustment) * 0.1)
  }
}

// Helper functions
function calculateBaseDifficulty(content: any, userSpeed: number): number {
  // Base difficulty from speed (Speed 1 = easier, Speed 5 = harder)
  const speedDifficultyMap = {
    1: 0.2, // Very easy
    2: 0.4, // Easy
    3: 0.6, // Medium
    4: 0.8, // Hard
    5: 1.0  // Very hard
  }
  
  const baseDifficulty = speedDifficultyMap[userSpeed as keyof typeof speedDifficultyMap] || 0.6
  
  // Adjust based on content complexity indicators
  const textLength = content.text?.length || 0
  const complexityBonus = textLength > 1000 ? 0.1 : 0
  
  return Math.min(1.0, baseDifficulty + complexityBonus)
}

function adjustDifficultyForUser(baseDifficulty: number, userProfile: PersonalizationProfile): number {
  let adjustedDifficulty = baseDifficulty
  
  // Adjust based on user's preferred complexity
  if (userProfile.preferredComplexity) {
    const complexityFactor = userProfile.preferredComplexity / 100
    adjustedDifficulty = (adjustedDifficulty + complexityFactor) / 2
  }
  
  // Adjust based on challenges
  if (userProfile.challenges.length > 0) {
    adjustedDifficulty = Math.max(0.1, adjustedDifficulty - 0.1)
  }
  
  // Adjust based on strengths
  if (userProfile.strengths.length > 0) {
    adjustedDifficulty = Math.min(1.0, adjustedDifficulty + 0.1)
  }
  
  return adjustedDifficulty
}

function adaptTextForSpeed(text: string, userSpeed: number, userProfile?: PersonalizationProfile): string {
  if (!text) return ''
  
  // Speed-based text adaptation
  switch (userSpeed) {
    case 1: // Simplify language, shorter sentences
      return simplifyText(text, 0.8)
    case 2: // Moderate simplification
      return simplifyText(text, 0.9)
    case 3: // Balanced
      return text
    case 4: // Add more detail
      return enhanceText(text, 1.1)
    case 5: // Advanced vocabulary and concepts
      return enhanceText(text, 1.3)
    default:
      return text
  }
}

function simplifyText(text: string, factor: number): string {
  // Simple text simplification
  return text
    .replace(/([.!?])\s+/g, '$1\n\n') // Add more paragraph breaks
    .replace(/\b\w{10,}\b/g, (word) => word.length > 12 ? word.substring(0, 8) + '...' : word)
    .substring(0, Math.floor(text.length * factor))
}

function enhanceText(text: string, factor: number): string {
  // Text enhancement with additional context
  const enhanced = text + '\n\nAdditional context and examples would be generated here based on the topic.'
  return enhanced
}

function generateVisualElements(content: any, speedConfig: any, userProfile?: PersonalizationProfile): any[] {
  const elements = []
  
  // Generate visual elements based on learning modes
  if (speedConfig.modes.includes('visual')) {
    elements.push({
      type: 'diagram',
      complexity: speedConfig.characteristics.complexity,
      style: userProfile?.learningStyle === 'visual' ? 'detailed' : 'simple'
    })
  }
  
  return elements
}

function generateInteractions(content: any, speedConfig: any, userProfile?: PersonalizationProfile): any[] {
  const interactions = []
  
  // Generate interactions based on learning modes
  if (speedConfig.modes.includes('kinesthetic')) {
    interactions.push({
      type: 'drag-drop',
      difficulty: speedConfig.characteristics.complexity,
      style: userProfile?.learningStyle === 'kinesthetic' ? 'hands-on' : 'simple'
    })
  }
  
  return interactions
}

function determineContentStyle(userProfile?: PersonalizationProfile, speedConfig?: any): string {
  if (!userProfile) return 'neutral'
  
  // Style based on learning preferences
  const styleMap = {
    visual: 'image-rich',
    auditory: 'narrative',
    kinesthetic: 'interactive',
    reading: 'text-focused'
  }
  
  return styleMap[userProfile.learningStyle] || 'neutral'
}

function generatePersonalizedExamples(content: any, userProfile?: PersonalizationProfile): any[] {
  if (!userProfile) return []
  
  const examples: any[] = []
  
  // Generate examples based on user interests
  userProfile.interests.forEach(interest => {
    examples.push({
      topic: interest,
      example: `Example related to ${interest} would be generated here`,
      relevance: 0.8
    })
  })
  
  return examples.slice(0, 3) // Limit to 3 examples
}

function generateAdaptiveHints(content: any, userSpeed: number, userProfile?: PersonalizationProfile): string[] {
  const hints = []
  
  // Base hints based on speed
  const hintComplexity = userSpeed <= 2 ? 'simple' : userSpeed >= 4 ? 'detailed' : 'moderate'
  
  hints.push(`${hintComplexity} hint about the main concept`)
  
  // Personalized hints based on challenges
  if (userProfile?.challenges.length) {
    userProfile.challenges.forEach(challenge => {
      hints.push(`Hint to help with ${challenge}`)
    })
  }
  
  return hints
}

function personalizeText(text: string, userProfile: PersonalizationProfile): string {
  let personalizedText = text
  
  // Add cultural context if specified
  if (userProfile.culturalContext) {
    personalizedText += `\n\nIn the context of ${userProfile.culturalContext}, this concept relates to...`
  }
  
  return personalizedText
}

function personalizeHints(hints: string[], userProfile: PersonalizationProfile): string[] {
  return hints.map(hint => {
    // Adapt hint style based on learning style
    switch (userProfile.learningStyle) {
      case 'visual':
        return `💡 ${hint} (Think of it as a picture...)`
      case 'auditory':
        return `🔊 ${hint} (Listen to the concept...)`
      case 'kinesthetic':
        return `✋ ${hint} (Try doing this...)`
      case 'reading':
        return `📚 ${hint} (Read more about...)`
      default:
        return hint
    }
  })
}

function adjustTextDifficulty(text: string, adjustment: number): string {
  if (adjustment > 0) {
    // Make harder - add complexity
    return text + '\n\nAdvanced concepts and detailed explanations would be added here.'
  } else if (adjustment < 0) {
    // Make easier - simplify
    return simplifyText(text, 0.8)
  }
  return text
}

function adjustInteractionDifficulty(interactions: any[], adjustment: number): any[] {
  return interactions.map(interaction => ({
    ...interaction,
    difficulty: Math.max(0.1, Math.min(1.0, (interaction.difficulty || 0.5) + adjustment * 0.1))
  }))
}

function adjustHintDifficulty(hints: string[], adjustment: number): string[] {
  if (adjustment > 0) {
    // Make hints less obvious
    return hints.map(hint => hint.replace(/💡|🔊|✋|📚/g, '🤔'))
  } else if (adjustment < 0) {
    // Make hints more obvious
    return hints.map(hint => `💡 HINT: ${hint}`)
  }
  return hints
}

function calculateConfidence(content: any, userProfile?: PersonalizationProfile): number {
  let confidence = 0.7 // Base confidence
  
  // Higher confidence if we have user profile
  if (userProfile) {
    confidence += 0.2
  }
  
  // Higher confidence if content is substantial
  if (content.text && content.text.length > 500) {
    confidence += 0.1
  }
  
  return Math.min(1.0, confidence)
} 