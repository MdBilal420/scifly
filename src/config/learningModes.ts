// Learning modes configuration for generative UI
export type LearningMode = 'simplified' | 'visual' | 'reading' | 'kinesthetic' | 'conversational'

export interface SpeedModeMapping {
  primary: LearningMode
  secondary: LearningMode
  tertiary?: LearningMode
  characteristics: {
    contentChunking: 'small' | 'medium' | 'large'
    visualSupport: 'minimal' | 'moderate' | 'extensive'
    pacing: 'slow' | 'medium' | 'fast'
    repetition: 'high' | 'medium' | 'low'
    complexity: 'single' | 'moderate' | 'multiple'
    navigation: 'linear' | 'guided' | 'free'
  }
  uiElements: {
    fontSize: 'large' | 'standard' | 'compact'
    animations: 'slow' | 'standard' | 'quick'
    colors: 'calming' | 'vibrant' | 'professional'
    interactionLevel: 'simple' | 'moderate' | 'complex'
  }
}

export const SPEED_MODE_MAPPINGS: Record<string, SpeedModeMapping> = {
  '1': {
    primary: 'simplified',
    secondary: 'visual',
    tertiary: 'reading',
    characteristics: {
      contentChunking: 'small',
      visualSupport: 'extensive',
      pacing: 'slow',
      repetition: 'high',
      complexity: 'single',
      navigation: 'linear'
    },
    uiElements: {
      fontSize: 'large',
      animations: 'slow',
      colors: 'calming',
      interactionLevel: 'simple'
    }
  },
  '2': {
    primary: 'visual',
    secondary: 'reading',
    tertiary: 'simplified',
    characteristics: {
      contentChunking: 'small',
      visualSupport: 'extensive',
      pacing: 'slow',
      repetition: 'medium',
      complexity: 'single',
      navigation: 'guided'
    },
    uiElements: {
      fontSize: 'large',
      animations: 'standard',
      colors: 'calming',
      interactionLevel: 'moderate'
    }
  },
  '3': {
    primary: 'visual',
    secondary: 'kinesthetic',
    tertiary: 'reading',
    characteristics: {
      contentChunking: 'medium',
      visualSupport: 'moderate',
      pacing: 'medium',
      repetition: 'medium',
      complexity: 'moderate',
      navigation: 'guided'
    },
    uiElements: {
      fontSize: 'standard',
      animations: 'standard',
      colors: 'vibrant',
      interactionLevel: 'moderate'
    }
  },
  '4': {
    primary: 'reading',
    secondary: 'conversational',
    tertiary: 'kinesthetic',
    characteristics: {
      contentChunking: 'medium',
      visualSupport: 'moderate',
      pacing: 'fast',
      repetition: 'low',
      complexity: 'multiple',
      navigation: 'free'
    },
    uiElements: {
      fontSize: 'standard',
      animations: 'quick',
      colors: 'professional',
      interactionLevel: 'complex'
    }
  },
  '5': {
    primary: 'conversational',
    secondary: 'kinesthetic',
    tertiary: 'reading',
    characteristics: {
      contentChunking: 'large',
      visualSupport: 'minimal',
      pacing: 'fast',
      repetition: 'low',
      complexity: 'multiple',
      navigation: 'free'
    },
    uiElements: {
      fontSize: 'compact',
      animations: 'quick',
      colors: 'professional',
      interactionLevel: 'complex'
    }
  }
}

export const getModesForSpeed = (speed: number): SpeedModeMapping => {
  return SPEED_MODE_MAPPINGS[speed.toString()] || SPEED_MODE_MAPPINGS['3']
}

export const generateLessonConfig = (userSpeed: number) => {
  const mapping = getModesForSpeed(userSpeed)
  
  return {
    modes: mapping,
    className: `lesson-speed-${userSpeed}`,
    adaptationLevel: userSpeed <= 2 ? 'high' : userSpeed >= 4 ? 'advanced' : 'standard'
  }
} 