import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { 
  setAIEnabled, 
  setPersonalizationLevel, 
  generateAIContent,
  updatePersonalizationProfile 
} from '../features/aiContent/aiContentSlice'
import AIContentRenderer from './ai/AIContentRenderer'

// Demo content for Phase 3 AI features
const PHASE3_DEMO_CONTENT = {
  title: 'Phase 3 Demo: AI-Driven Learning Experience',
  sections: [
    {
      type: 'adaptive-content',
      content: {
        title: 'Ecosystem Interactions',
        text: `In nature, living things depend on each other and their environment for survival. 
               This interconnected web of relationships is called an ecosystem. Every organism 
               plays a vital role, from the smallest bacteria to the largest predators.`,
        concepts: ['ecosystem', 'food chain', 'interdependence', 'habitat'],
        difficulty: 0.6,
        learningObjectives: [
          'Understand ecosystem components',
          'Identify food chain relationships',
          'Explain species interdependence'
        ]
      }
    },
    {
      type: 'ai-generated',
      content: {
        title: 'Personalized Learning Path',
        adaptiveElements: [
          {
            type: 'concept-explanation',
            content: 'Ecosystem explanation adapted to user learning style'
          },
          {
            type: 'interactive-simulation',
            content: 'Food web builder with difficulty based on user performance'
          },
          {
            type: 'assessment',
            content: 'Adaptive questions that adjust to comprehension level'
          }
        ]
      }
    }
  ]
}

export const Phase3Demo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { 
    aiEnabled, 
    personalizationLevel, 
    generatedContent,
    contentMetrics 
  } = useSelector((state: RootState) => state.aiContent)
  
  const [selectedDemo, setSelectedDemo] = useState<'overview' | 'ai-content' | 'smart-tutor' | 'analytics'>('overview')
  const [aiSettings, setAISettings] = useState({
    enabled: true,
    personalization: 75,
    adaptationSpeed: 'medium' as 'slow' | 'medium' | 'fast',
    tutorStyle: 'encouraging' as 'gentle' | 'direct' | 'encouraging' | 'detailed'
  })
  
  useEffect(() => {
    // Enable AI for demo
    dispatch(setAIEnabled(aiSettings.enabled))
    dispatch(setPersonalizationLevel(aiSettings.personalization))
  }, [aiSettings, dispatch])
  
  const handleAISettingChange = (setting: string, value: any) => {
    setAISettings(prev => ({ ...prev, [setting]: value }))
  }
  
  const handlePersonalizationUpdate = () => {
    if (currentUser) {
      dispatch(updatePersonalizationProfile({
        userId: currentUser.id,
        learningStyle: 'visual' as const,
        interests: ['animals', 'environment', 'nature'],
        strengths: ['pattern recognition', 'visual processing'],
        challenges: ['abstract concepts', 'complex relationships'],
        preferredComplexity: aiSettings.personalization,
        culturalContext: 'diverse classroom',
        accessibilityNeeds: [],
        lastUpdated: Date.now()
      }))
    }
  }
  
  const renderOverview = () => (
    <div className="phase3-overview">
      <div className="demo-hero">
        <h1>🤖 Phase 3: AI-Driven Learning Experience</h1>
        <p>Experience the future of personalized education with AI-powered content adaptation, 
           intelligent tutoring, and predictive learning analytics.</p>
      </div>
      
      <div className="ai-features-grid">
        <div className="feature-card" onClick={() => setSelectedDemo('ai-content')}>
          <div className="feature-icon">🧠</div>
          <h3>AI Content Generation</h3>
          <p>Real-time content adaptation based on learning patterns and preferences</p>
          <div className="feature-metrics">
            <span>Generated: {contentMetrics.totalGenerated}</span>
            <span>Effectiveness: {Math.round(contentMetrics.effectivenessScore * 100)}%</span>
          </div>
        </div>
        
        <div className="feature-card" onClick={() => setSelectedDemo('smart-tutor')}>
          <div className="feature-icon">🎓</div>
          <h3>Smart Tutoring System</h3>
          <p>Contextual hints, adaptive questioning, and personalized feedback</p>
          <div className="feature-metrics">
            <span>Hints: Available</span>
            <span>Questions: Adaptive</span>
          </div>
        </div>
        
        <div className="feature-card" onClick={() => setSelectedDemo('analytics')}>
          <div className="feature-icon">📊</div>
          <h3>Predictive Analytics</h3>
          <p>Learning pattern analysis and performance forecasting</p>
          <div className="feature-metrics">
            <span>Engagement: Real-time</span>
            <span>Predictions: Active</span>
          </div>
        </div>
      </div>
      
      <div className="ai-settings-panel">
        <h3>AI System Configuration</h3>
        <div className="settings-grid">
          <div className="setting-group">
            <label>AI Enhancement</label>
            <button 
              className={`toggle-btn ${aiSettings.enabled ? 'active' : ''}`}
              onClick={() => handleAISettingChange('enabled', !aiSettings.enabled)}
            >
              {aiSettings.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="setting-group">
            <label>Personalization Level: {aiSettings.personalization}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={aiSettings.personalization}
              onChange={(e) => handleAISettingChange('personalization', parseInt(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="setting-group">
            <label>Adaptation Speed</label>
            <select 
              value={aiSettings.adaptationSpeed}
              onChange={(e) => handleAISettingChange('adaptationSpeed', e.target.value)}
            >
              <option value="slow">Slow & Deliberate</option>
              <option value="medium">Balanced</option>
              <option value="fast">Quick Response</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Tutor Style</label>
            <select 
              value={aiSettings.tutorStyle}
              onChange={(e) => handleAISettingChange('tutorStyle', e.target.value)}
            >
              <option value="gentle">Gentle & Patient</option>
              <option value="direct">Direct & Clear</option>
              <option value="encouraging">Encouraging & Supportive</option>
              <option value="detailed">Detailed & Thorough</option>
            </select>
          </div>
        </div>
        
        <button 
          className="update-personalization-btn"
          onClick={handlePersonalizationUpdate}
        >
          Update Personalization Profile
        </button>
      </div>
    </div>
  )
  
  const renderAIContent = () => (
    <div className="ai-content-demo">
      <div className="demo-header">
        <h2>🧠 AI Content Generation</h2>
        <p>Watch how AI adapts content in real-time based on your learning patterns</p>
        <button 
          className="back-btn"
          onClick={() => setSelectedDemo('overview')}
        >
          ← Back to Overview
        </button>
      </div>
      
      <div className="ai-status">
        <div className="status-indicator">
          <span className={`status-dot ${aiEnabled ? 'active' : 'inactive'}`}></span>
          AI Status: {aiEnabled ? 'Active' : 'Inactive'}
        </div>
        <div className="personalization-level">
          Personalization: {personalizationLevel}%
        </div>
        <div className="content-generation">
          Generated Content: {Object.keys(generatedContent).length}
        </div>
      </div>
      
      <AIContentRenderer
        lessonId="phase3-demo-ecosystem"
        topicId="ecosystem-interactions"
        originalContent={PHASE3_DEMO_CONTENT}
        onLessonComplete={(results) => {
          console.log('Phase 3 Demo completed:', results)
        }}
        onContentAdapted={(content) => {
          console.log('Content adapted by AI:', content)
        }}
      />
    </div>
  )
  
  const renderSmartTutor = () => (
    <div className="smart-tutor-demo">
      <div className="demo-header">
        <h2>🎓 Smart Tutoring System</h2>
        <p>Experience personalized guidance, hints, and adaptive questioning</p>
        <button 
          className="back-btn"
          onClick={() => setSelectedDemo('overview')}
        >
          ← Back to Overview
        </button>
      </div>
      
      <div className="tutor-features">
        <div className="feature-section">
          <h3>💡 Smart Hints</h3>
          <p>Contextual hints that adapt to your learning style and current struggles</p>
          <div className="demo-hint">
            <div className="hint-example">
              &quot;Try thinking about how plants and animals depend on each other...&quot;
            </div>
            <div className="hint-type">Conceptual Hint</div>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>🤔 Adaptive Questions</h3>
          <p>Questions that adjust difficulty based on your comprehension level</p>
          <div className="demo-question">
            <div className="question-example">
              &quot;Which organism would be most affected if plants disappeared from this ecosystem?&quot;
            </div>
            <div className="question-difficulty">Difficulty: Adaptive (Medium)</div>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>📝 Personalized Feedback</h3>
          <p>Encouragement and guidance tailored to your learning preferences</p>
          <div className="demo-feedback">
            <div className="feedback-example">
              &quot;Great job identifying the food chain! Try to think about what happens to energy as it moves through the chain.&quot;
            </div>
            <div className="feedback-type">Encouraging Feedback</div>
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderAnalytics = () => (
    <div className="analytics-demo">
      <div className="demo-header">
        <h2>📊 Predictive Analytics</h2>
        <p>See how AI analyzes learning patterns and predicts optimal pathways</p>
        <button 
          className="back-btn"
          onClick={() => setSelectedDemo('overview')}
        >
          ← Back to Overview
        </button>
      </div>
      
      <div className="analytics-dashboard">
        <div className="metric-card">
          <h4>Learning Efficiency</h4>
          <div className="metric-value">87%</div>
          <div className="metric-trend">↗ +12% this week</div>
        </div>
        
        <div className="metric-card">
          <h4>Engagement Score</h4>
          <div className="metric-value">92%</div>
          <div className="metric-trend">↗ +8% this session</div>
        </div>
        
        <div className="metric-card">
          <h4>Concept Mastery</h4>
          <div className="metric-value">78%</div>
          <div className="metric-trend">→ Steady progress</div>
        </div>
        
        <div className="metric-card">
          <h4>Time to Mastery</h4>
          <div className="metric-value">23 min</div>
          <div className="metric-trend">↘ -5 min predicted</div>
        </div>
      </div>
      
      <div className="prediction-panel">
        <h3>AI Predictions</h3>
        <div className="predictions">
          <div className="prediction-item">
            <span className="prediction-icon">🎯</span>
            <span className="prediction-text">
              Optimal next topic: &quot;Food Webs&quot; (85% success probability)
            </span>
          </div>
          <div className="prediction-item">
            <span className="prediction-icon">⚡</span>
            <span className="prediction-text">
              Recommended difficulty increase: +1 level in 3 activities
            </span>
          </div>
          <div className="prediction-item">
            <span className="prediction-icon">💡</span>
            <span className="prediction-text">
              Suggested learning mode: Visual + Kinesthetic (best fit)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="phase3-demo">
      <div className="demo-container">
        {selectedDemo === 'overview' && renderOverview()}
        {selectedDemo === 'ai-content' && renderAIContent()}
        {selectedDemo === 'smart-tutor' && renderSmartTutor()}
        {selectedDemo === 'analytics' && renderAnalytics()}
      </div>
      
      {/* AI Enhancement Indicator */}
      <div className="ai-system-status">
        <div className="status-badge">
          <span className="ai-icon">🤖</span>
          <span className="status-text">
            Phase 3 AI: {aiSettings.enabled ? 'Active' : 'Inactive'}
          </span>
          <div className="status-details">
            Personalization: {aiSettings.personalization}% | 
            Speed: {aiSettings.adaptationSpeed} | 
            Style: {aiSettings.tutorStyle}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Phase3Demo 