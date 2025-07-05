import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '../../hooks/redux'
import { analyzeBundleSize } from '../../utils/lazyLoadingUtils'
import '../../styles/adaptiveComponents.css'

interface AnalyticsDashboardProps {
  userSpeed: number
  onOptimizationAction: (action: string, data?: any) => void
}

interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number
  componentCount: number
  interactionCount: number
  errorCount: number
  userEngagement: number
}

interface UserAnalytics {
  sessionDuration: number
  topicsCompleted: number
  speedChanges: number
  preferredInteractionType: string
  strugglingAreas: string[]
  strengths: string[]
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userSpeed,
  onOptimizationAction
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    interactionCount: 0,
    errorCount: 0,
    userEngagement: 0
  })
  
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    sessionDuration: 0,
    topicsCompleted: 0,
    speedChanges: 0,
    preferredInteractionType: 'visual',
    strugglingAreas: [],
    strengths: []
  })
  
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  
  const { currentUser } = useAppSelector(state => state.user)
  const { messages } = useAppSelector(state => state.chat)
  const adaptive = useAppSelector(state => state.adaptive)
  const smartTutor = useAppSelector(state => state.smartTutor)

  useEffect(() => {
    // Update metrics every 10 seconds
    const interval = setInterval(() => {
      updateMetrics()
      generateOptimizationSuggestions()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const updateMetrics = () => {
    const performanceEntries = performance.getEntriesByType('navigation') as any[]
    const loadTime = performanceEntries.length > 0 ? (performanceEntries[0].loadEventEnd || 0) : 0
    
    const memoryInfo = (performance as any).memory || {}
    const memoryUsage = memoryInfo.usedJSHeapSize || 0
    
    const componentCount = document.querySelectorAll('[data-component]').length
    const interactionCount = messages?.length || 0 // Use chat messages as proxy for interactions
    const errorCount = getErrorCount()
    const userEngagement = calculateEngagement()
    
    setMetrics({
      loadTime: Math.round(loadTime),
      memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
      componentCount,
      interactionCount,
      errorCount,
      userEngagement
    })
    
    // Update user analytics with simplified data
    setUserAnalytics(prev => ({
      ...prev,
      sessionDuration: Math.round((Date.now() - (sessionStartTime || Date.now())) / 1000 / 60),
      topicsCompleted: 0, // Simplified
      speedChanges: 0, // Simplified
      preferredInteractionType: 'visual', // Default
      strugglingAreas: [], // Simplified
      strengths: [] // Simplified
    }))
  }

  const getErrorCount = () => {
    // Count JavaScript errors from console
    return (window as any).__errorCount || 0
  }

  const calculateEngagement = () => {
    const chatMessages = messages?.length || 0
    const sessionTime = Math.round((Date.now() - (sessionStartTime || Date.now())) / 1000 / 60)
    
    // Simple engagement calculation based on chat activity and session time
    return Math.min(100, (chatMessages * 10 + sessionTime * 2))
  }

  const sessionStartTime = sessionStorage.getItem('sessionStartTime') 
    ? parseInt(sessionStorage.getItem('sessionStartTime')!)
    : Date.now()

  const generateOptimizationSuggestions = () => {
    const suggestions: string[] = []
    
    if (metrics.memoryUsage > 100) {
      suggestions.push('Consider clearing unused components to reduce memory usage')
    }
    
    if (metrics.loadTime > 3000) {
      suggestions.push('Enable lazy loading for better performance')
    }
    
    if (userAnalytics.speedChanges > 5) {
      suggestions.push('Consider auto-adjusting speed based on performance')
    }
    
    if (userAnalytics.strugglingAreas.length > 2) {
      suggestions.push('Increase AI assistance for struggling areas')
    }
    
    if (metrics.userEngagement < 30) {
      suggestions.push('Add more interactive elements to improve engagement')
    }
    
    setOptimizationSuggestions(suggestions)
  }

  const handleOptimization = (action: string) => {
    switch (action) {
      case 'clear_memory':
        // Clear unused components
        const unusedComponents = document.querySelectorAll('[data-component][data-unused="true"]')
        unusedComponents.forEach(component => component.remove())
        onOptimizationAction('memory_cleared')
        break
        
      case 'enable_lazy_loading':
        onOptimizationAction('lazy_loading_enabled')
        break
        
      case 'auto_adjust_speed':
        onOptimizationAction('auto_speed_enabled')
        break
        
      case 'increase_ai_assistance':
        onOptimizationAction('ai_assistance_increased')
        break
        
      default:
        onOptimizationAction(action)
    }
  }

  const renderMetricCard = (title: string, value: number | string, unit: string, color: string) => {
    return (
      <motion.div
        className={`metric-card ${color}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="metric-header">
          <h4>{title}</h4>
        </div>
        <div className="metric-value">
          <span className="value">{value}</span>
          <span className="unit">{unit}</span>
        </div>
      </motion.div>
    )
  }

  const renderOptimizationSuggestion = (suggestion: string, index: number) => {
    const actionMap: Record<string, string> = {
      'Consider clearing unused components to reduce memory usage': 'clear_memory',
      'Enable lazy loading for better performance': 'enable_lazy_loading',
      'Consider auto-adjusting speed based on performance': 'auto_adjust_speed',
      'Increase AI assistance for struggling areas': 'increase_ai_assistance',
      'Add more interactive elements to improve engagement': 'add_interactivity'
    }
    
    const action = actionMap[suggestion]
    
    return (
      <motion.div
        key={index}
        className="optimization-suggestion"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="suggestion-content">
          <p>{suggestion}</p>
          {action && (
            <button 
              className="apply-btn"
              onClick={() => handleOptimization(action)}
            >
              Apply
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`analytics-dashboard speed-${userSpeed}`}>
      <div className="dashboard-header">
        <h2>Performance Analytics</h2>
        <div className="header-controls">
          <button 
            className={`detail-toggle ${showDetailedMetrics ? 'active' : ''}`}
            onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
          >
            {showDetailedMetrics ? '📊 Simple' : '📈 Detailed'}
          </button>
          <button 
            className="refresh-btn"
            onClick={updateMetrics}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="performance-section">
          <h3>System Performance</h3>
          <div className="metrics-row">
            {renderMetricCard('Load Time', metrics.loadTime, 'ms', 'blue')}
            {renderMetricCard('Memory Usage', metrics.memoryUsage, 'MB', 'green')}
            {renderMetricCard('Components', metrics.componentCount, '', 'purple')}
            {renderMetricCard('Interactions', metrics.interactionCount, '', 'orange')}
          </div>
        </div>

        <div className="user-section">
          <h3>User Analytics</h3>
          <div className="metrics-row">
            {renderMetricCard('Session Time', userAnalytics.sessionDuration, 'min', 'teal')}
            {renderMetricCard('Topics Done', userAnalytics.topicsCompleted, '', 'green')}
            {renderMetricCard('Speed Changes', userAnalytics.speedChanges, '', 'yellow')}
            {renderMetricCard('Engagement', metrics.userEngagement, '%', 'red')}
          </div>
        </div>

        {showDetailedMetrics && (
          <div className="detailed-section">
            <h3>Detailed Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Preferred Interaction</h4>
                <p className="insight-value">{userAnalytics.preferredInteractionType}</p>
              </div>
              <div className="insight-card">
                <h4>Struggling Areas</h4>
                <ul className="insight-list">
                  {userAnalytics.strugglingAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
              <div className="insight-card">
                <h4>Strengths</h4>
                <ul className="insight-list">
                  {userAnalytics.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {optimizationSuggestions.length > 0 && (
        <div className="optimization-section">
          <h3>Optimization Suggestions</h3>
          <div className="suggestions-list">
            {optimizationSuggestions.map(renderOptimizationSuggestion)}
          </div>
        </div>
      )}

      {userSpeed >= 4 && (
        <div className="debug-section">
          <h3>Debug Information</h3>
          <button 
            className="debug-btn"
            onClick={() => {
              const analysis = analyzeBundleSize()
              console.log('Bundle Analysis:', analysis)
            }}
          >
            🔍 Analyze Bundle
          </button>
          <div className="debug-info">
            <div className="debug-item">
              <strong>User Speed:</strong> {userSpeed}
            </div>
            <div className="debug-item">
              <strong>Session ID:</strong> {currentUser?.id || 'Anonymous'}
            </div>
            <div className="debug-item">
              <strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard 