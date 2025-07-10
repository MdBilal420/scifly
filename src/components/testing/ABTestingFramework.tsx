import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { trackInteraction } from '../../features/adaptive/adaptiveSlice'
import '../../styles/adaptiveComponents.css'

interface ABTestingFrameworkProps {
  testId: string
  userSpeed: number
  onTestComplete: (results: ABTestResults) => void
}

interface ABTestVariant {
  id: string
  name: string
  weight: number
  component: React.ComponentType<any>
  props?: any
}

interface ABTestResults {
  testId: string
  variantId: string
  userId: string
  userSpeed: number
  metrics: {
    conversionRate: number
    engagementTime: number
    interactionCount: number
    completionRate: number
    errorCount: number
    userSatisfaction: number
  }
  startTime: number
  endTime: number
}

interface ABTestConfig {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  targetAudience: {
    speeds: number[]
    minAge?: number
    maxAge?: number
  }
  successMetrics: string[]
  duration: number // in days
  confidenceLevel: number
}

// Pre-defined A/B tests for different aspects of the UI
const abTests: Record<string, ABTestConfig> = {
  'layout-optimization': {
    id: 'layout-optimization',
    name: 'Layout Optimization',
    description: 'Test different layout approaches for better engagement',
    variants: [
      {
        id: 'current-layout',
        name: 'Current Layout',
        weight: 0.5,
        component: () => <div className="current-layout">Current Layout</div>
      },
      {
        id: 'optimized-layout',
        name: 'Optimized Layout',
        weight: 0.5,
        component: () => <div className="optimized-layout">Optimized Layout</div>
      }
    ],
    targetAudience: {
      speeds: [1, 2, 3, 4, 5]
    },
    successMetrics: ['engagement_time', 'completion_rate'],
    duration: 7,
    confidenceLevel: 0.95
  },
  'interaction-styles': {
    id: 'interaction-styles',
    name: 'Interaction Styles',
    description: 'Test different interaction patterns for speed-based learning',
    variants: [
      {
        id: 'button-heavy',
        name: 'Button Heavy',
        weight: 0.33,
        component: () => <div className="button-heavy">Button Heavy UI</div>
      },
      {
        id: 'gesture-based',
        name: 'Gesture Based',
        weight: 0.33,
        component: () => <div className="gesture-based">Gesture Based UI</div>
      },
      {
        id: 'voice-enabled',
        name: 'Voice Enabled',
        weight: 0.34,
        component: () => <div className="voice-enabled">Voice Enabled UI</div>
      }
    ],
    targetAudience: {
      speeds: [3, 4, 5]
    },
    successMetrics: ['interaction_count', 'user_satisfaction'],
    duration: 14,
    confidenceLevel: 0.95
  },
  'content-presentation': {
    id: 'content-presentation',
    name: 'Content Presentation',
    description: 'Test different ways to present educational content',
    variants: [
      {
        id: 'text-focused',
        name: 'Text Focused',
        weight: 0.25,
        component: () => <div className="text-focused">Text Focused Content</div>
      },
      {
        id: 'visual-heavy',
        name: 'Visual Heavy',
        weight: 0.25,
        component: () => <div className="visual-heavy">Visual Heavy Content</div>
      },
      {
        id: 'interactive-rich',
        name: 'Interactive Rich',
        weight: 0.25,
        component: () => <div className="interactive-rich">Interactive Rich Content</div>
      },
      {
        id: 'ai-assisted',
        name: 'AI Assisted',
        weight: 0.25,
        component: () => <div className="ai-assisted">AI Assisted Content</div>
      }
    ],
    targetAudience: {
      speeds: [1, 2, 3, 4, 5]
    },
    successMetrics: ['completion_rate', 'engagement_time', 'user_satisfaction'],
    duration: 21,
    confidenceLevel: 0.99
  }
}

export const ABTestingFramework: React.FC<ABTestingFrameworkProps> = ({
  testId,
  userSpeed,
  onTestComplete
}) => {
  const [currentTest, setCurrentTest] = useState<ABTestConfig | null>(null)
  const [assignedVariant, setAssignedVariant] = useState<ABTestVariant | null>(null)
  const [testResults, setTestResults] = useState<ABTestResults | null>(null)
  const [testStartTime, setTestStartTime] = useState<number>(0)
  const [metrics, setMetrics] = useState({
    conversionRate: 0,
    engagementTime: 0,
    interactionCount: 0,
    completionRate: 0,
    errorCount: 0,
    userSatisfaction: 0
  })
  
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector(state => state.user)

  useEffect(() => {
    if (testId && abTests[testId]) {
      initializeTest(testId)
    }
  }, [testId])

  useEffect(() => {
    // Track metrics updates
    if (assignedVariant && testStartTime) {
      updateMetrics()
    }
  }, [assignedVariant, testStartTime])

  const initializeTest = (testId: string) => {
    const test = abTests[testId]
    if (!test) return

    // Check if user is eligible for this test
    if (!test.targetAudience.speeds.includes(userSpeed)) {
      console.log(`User speed ${userSpeed} not eligible for test ${testId}`)
      return
    }

    // Check if user has already been assigned to this test
    const existingAssignment = localStorage.getItem(`ab_test_${testId}`)
    if (existingAssignment) {
      const assignment = JSON.parse(existingAssignment)
      setCurrentTest(test)
      setAssignedVariant(assignment.variant)
      setTestStartTime(assignment.startTime)
      return
    }

    // Assign user to a variant based on weights
    const variant = assignVariant(test.variants)
    const assignment = {
      variant,
      startTime: Date.now(),
      userId: currentUser?.id || 'anonymous'
    }

    localStorage.setItem(`ab_test_${testId}`, JSON.stringify(assignment))
    
    setCurrentTest(test)
    setAssignedVariant(variant)
    setTestStartTime(assignment.startTime)

    // Track test assignment
    if (currentUser) {
      dispatch(trackInteraction({
        userId: currentUser.id,
        lessonId: 'ab-test',
        interactionType: 'view',
        interactionData: {
          testId,
          variantId: variant.id,
          userSpeed,
          timestamp: Date.now(),
          action: 'ab_test_assigned'
        },
        engagementScore: 0.5,
        timeSpentSeconds: 0
      }))
    }
  }

  const assignVariant = (variants: ABTestVariant[]): ABTestVariant => {
    const random = Math.random()
    let cumulativeWeight = 0
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight
      if (random <= cumulativeWeight) {
        return variant
      }
    }
    
    return variants[variants.length - 1]
  }

  const updateMetrics = () => {
    if (!currentUser || !assignedVariant || !testStartTime) return

    // Simplified metrics calculation without requiring interactions data
    const engagementTime = Math.round((Date.now() - testStartTime) / 1000 / 60) // minutes
    const interactionCount = Math.floor(Math.random() * 20) + 5 // Mock data for demo
    const completionRate = Math.floor(Math.random() * 40) + 60 // Mock 60-100%
    const conversionRate = Math.floor(Math.random() * 30) + 70 // Mock 70-100%
    const errorCount = Math.floor(Math.random() * 3) // Mock 0-3 errors
    const userSatisfaction = Math.floor(Math.random() * 20) + 80 // Mock 80-100%

    setMetrics({
      conversionRate,
      engagementTime,
      interactionCount,
      completionRate,
      errorCount,
      userSatisfaction
    })
  }

  const completeTest = () => {
    if (!currentTest || !assignedVariant || !currentUser) return

    const results: ABTestResults = {
      testId: currentTest.id,
      variantId: assignedVariant.id,
      userId: currentUser.id,
      userSpeed,
      metrics,
      startTime: testStartTime,
      endTime: Date.now()
    }

    setTestResults(results)
    
    // Track test completion
    dispatch(trackInteraction({
      userId: currentUser.id,
      lessonId: 'ab-test',
      interactionType: 'complete',
      interactionData: {
        testId: currentTest.id,
        variantId: assignedVariant.id,
        metrics,
        userSpeed,
        timestamp: Date.now(),
        action: 'ab_test_completed'
      },
      engagementScore: metrics.userSatisfaction / 100,
      timeSpentSeconds: Math.round((Date.now() - testStartTime) / 1000)
    }))

    onTestComplete(results)
  }

  const renderVariant = () => {
    if (!assignedVariant) return null

    const VariantComponent = assignedVariant.component
    return (
      <motion.div
        className={`ab-test-variant variant-${assignedVariant.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VariantComponent {...(assignedVariant.props || {})} />
      </motion.div>
    )
  }

  const renderTestInfo = () => {
    if (!currentTest || !assignedVariant) return null

    return (
      <div className="ab-test-info">
        <div className="test-header">
          <h3>{currentTest.name}</h3>
          <span className="variant-badge">Variant: {assignedVariant.name}</span>
        </div>
        
        {userSpeed >= 4 && (
          <div className="test-metrics">
            <div className="metric">
              <span className="metric-label">Engagement Time:</span>
              <span className="metric-value">{metrics.engagementTime}min</span>
            </div>
            <div className="metric">
              <span className="metric-label">Interactions:</span>
              <span className="metric-value">{metrics.interactionCount}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Completion Rate:</span>
              <span className="metric-value">{metrics.completionRate.toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Satisfaction:</span>
              <span className="metric-value">{metrics.userSatisfaction.toFixed(1)}%</span>
            </div>
          </div>
        )}
        
        <div className="test-actions">
          <button 
            className="complete-test-btn"
            onClick={completeTest}
          >
            Complete Test
          </button>
        </div>
      </div>
    )
  }

  const renderResults = () => {
    if (!testResults) return null

    return (
      <motion.div
        className="ab-test-results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3>Test Results</h3>
        <div className="results-grid">
          <div className="result-card">
            <h4>Conversion Rate</h4>
            <div className="result-value">{testResults.metrics.conversionRate.toFixed(1)}%</div>
          </div>
          <div className="result-card">
            <h4>Engagement Time</h4>
            <div className="result-value">{testResults.metrics.engagementTime}min</div>
          </div>
          <div className="result-card">
            <h4>Completion Rate</h4>
            <div className="result-value">{testResults.metrics.completionRate.toFixed(1)}%</div>
          </div>
          <div className="result-card">
            <h4>User Satisfaction</h4>
            <div className="result-value">{testResults.metrics.userSatisfaction.toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="test-summary">
          <p>
            You participated in the <strong>{currentTest?.name}</strong> test with the{' '}
            <strong>{assignedVariant?.name}</strong> variant for{' '}
            <strong>{Math.round((testResults.endTime - testResults.startTime) / 1000 / 60)}min</strong>.
          </p>
          <p>
            Your feedback helps us improve the learning experience for all users! 🎯
          </p>
        </div>
      </motion.div>
    )
  }

  if (testResults) {
    return renderResults()
  }

  if (!currentTest || !assignedVariant) {
    return (
      <div className="ab-test-inactive">
        <p>No active A/B test for your current speed and profile.</p>
      </div>
    )
  }

  return (
    <div className={`ab-testing-framework speed-${userSpeed}`}>
      {userSpeed >= 3 && renderTestInfo()}
      {renderVariant()}
    </div>
  )
}

// Utility functions for managing A/B tests
export const ABTestUtils = {
  // Get all active tests for a user
  getActiveTests: (userSpeed: number) => {
    return Object.values(abTests).filter(test =>
      test.targetAudience.speeds.includes(userSpeed)
    )
  },

  // Check if user is in a specific test
  isUserInTest: (testId: string) => {
    return localStorage.getItem(`ab_test_${testId}`) !== null
  },

  // Get user's variant for a test
  getUserVariant: (testId: string) => {
    const assignment = localStorage.getItem(`ab_test_${testId}`)
    return assignment ? JSON.parse(assignment).variant : null
  },

  // Clear all test assignments (for testing purposes)
  clearAllTests: () => {
    Object.keys(abTests).forEach(testId => {
      localStorage.removeItem(`ab_test_${testId}`)
    })
  },

  // Export test results for analysis
  exportTestResults: () => {
    const results: any[] = []
    Object.keys(abTests).forEach(testId => {
      const assignment = localStorage.getItem(`ab_test_${testId}`)
      if (assignment) {
        results.push({
          testId,
          ...JSON.parse(assignment)
        })
      }
    })
    return results
  }
}

export default ABTestingFramework 