import apiClient from './api'

export interface AdaptiveLessonRequest {
  lessonId: string
  userId: string
  userSpeed: number
  topicId: string
}

export interface AdaptiveLessonResponse {
  lesson: any
  adaptedContent: any
  uiConfig: any
  trackingId: string
}

export interface ContentAdaptation {
  id: string
  lessonId: string
  userSpeed: number
  adaptedContent: any
  adaptationType: 'auto' | 'manual' | 'ai_generated'
  effectivenessScore: number
  usageCount: number
}

export interface UserInteraction {
  userId: string
  lessonId: string
  adaptationId?: string
  interactionType: 'view' | 'click' | 'complete' | 'skip'
  interactionData: any
  engagementScore?: number
  timeSpentSeconds: number
}

/**
 * Get adaptive lesson content based on user's learning speed
 */
export const getAdaptiveLesson = async (request: AdaptiveLessonRequest): Promise<AdaptiveLessonResponse> => {
  return await apiClient.adaptive.getAdaptiveLesson(request.lessonId, request.userId, request.userSpeed)
}

/**
 * Track user interaction with adaptive content
 */
export const trackUserInteraction = async (interaction: UserInteraction): Promise<void> => {
  await apiClient.adaptive.trackUserInteraction(interaction)
}

/**
 * Get lessons adapted for specific user speed
 */
export const getLessonsForSpeed = async (topicId: string, userSpeed: number): Promise<any[]> => {
  return await apiClient.adaptive.getLessonsForSpeed(topicId, userSpeed)
}

/**
 * Suggest optimal learning speed based on user performance
 */
export const suggestOptimalSpeed = async (userId: string): Promise<{ suggestedSpeed: number, reason: string, confidence: number }> => {
  return await apiClient.adaptive.suggestOptimalSpeed(userId)
} 