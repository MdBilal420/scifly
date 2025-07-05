import React from 'react'
import { SPEED_MODE_MAPPINGS } from '../../config/learningModes'

interface SpeedBasedLayoutProps {
  speed: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
  className?: string
}

interface LayoutSectionProps {
  children: React.ReactNode
  className?: string
  priority?: 'primary' | 'secondary' | 'tertiary'
}

const LayoutSection: React.FC<LayoutSectionProps> = ({ 
  children, 
  className = '', 
  priority = 'primary' 
}) => (
  <div className={`layout-section ${priority} ${className}`}>
    {children}
  </div>
)

export const SpeedBasedLayout: React.FC<SpeedBasedLayoutProps> = ({ 
  speed, 
  children, 
  className = '' 
}) => {
  const speedConfig = SPEED_MODE_MAPPINGS[speed.toString()]
  const layoutClass = `speed-${speed}-layout`
  
  return (
    <div className={`speed-based-layout ${layoutClass} ${className}`}>
      {children}
    </div>
  )
}

// Speed 1 (🐢): Simplified + Visual Layout
export const Speed1Layout: React.FC<{ 
  children: React.ReactNode
  onPrevious?: () => void
  onNext?: () => void
}> = ({ children, onPrevious, onNext }) => (
  <div className="speed-1-layout simplified-visual">
    {/* Single column, large spacing, minimal distractions */}
    <div className="main-content-column">
      <div className="progress-indicator-top">
        <div className="simple-progress-bar"></div>
      </div>
      <div className="content-focus-area">
        {children}
      </div>
      <div className="navigation-bottom">
        <button 
          className="large-nav-button prev" 
          onClick={onPrevious}
          type="button"
        >
          ← Previous
        </button>
        <button 
          className="large-nav-button next" 
          onClick={onNext}
          type="button"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
)

// Speed 2 (🐨): Visual + Reading Layout  
export const Speed2Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="speed-2-layout visual-reading">
    {/* Two-column layout with visual prominence */}
    <div className="layout-container">
      <div className="visual-column">
        <div className="visual-content-area">
          {/* Visual elements get priority */}
        </div>
      </div>
      <div className="reading-column">
        <div className="structured-content">
          {children}
        </div>
        <div className="reading-aids">
          <div className="key-points-summary"></div>
        </div>
      </div>
    </div>
  </div>
)

// Speed 3 (🦁): Visual + Kinesthetic Layout
export const Speed3Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="speed-3-layout visual-kinesthetic">
    {/* Balanced grid with interactive zones */}
    <div className="balanced-grid">
      <div className="content-main">
        {children}
      </div>
      <div className="interactive-sidebar">
        <div className="interaction-zone">
          <div className="drag-drop-area"></div>
          <div className="slider-controls"></div>
        </div>
      </div>
      <div className="visual-footer">
        <div className="concept-diagram"></div>
      </div>
    </div>
  </div>
)

// Speed 4 (🐎): Reading + Conversational Layout
export const Speed4Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="speed-4-layout reading-conversational">
    {/* Text-focused with chat integration */}
    <div className="text-focused-layout">
      <div className="main-reading-area">
        {children}
      </div>
      <div className="conversational-panel">
        <div className="chat-interface">
          <div className="ai-suggestions"></div>
          <div className="question-prompts"></div>
        </div>
      </div>
    </div>
  </div>
)

// Speed 5 (🚀): Conversational + Kinesthetic Layout
export const Speed5Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="speed-5-layout conversational-kinesthetic">
    {/* Advanced multi-panel layout */}
    <div className="advanced-layout">
      <div className="primary-content">
        {children}
      </div>
      <div className="experimental-zone">
        <div className="hypothesis-testing"></div>
        <div className="advanced-interactions"></div>
      </div>
      <div className="ai-collaboration">
        <div className="smart-chat"></div>
        <div className="concept-exploration"></div>
      </div>
    </div>
  </div>
)

// Layout selector component
export const AdaptiveLayoutSelector: React.FC<{
  speed: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
  className?: string
  onPrevious?: () => void
  onNext?: () => void
  onMenu?: () => void
}> = ({ speed, children, className = '', onPrevious, onNext, onMenu }) => {
  const renderLayout = () => {
    switch (speed) {
      case 1:
        return (
          <Speed1Layout onPrevious={onPrevious} onNext={onNext}>
            {children}
          </Speed1Layout>
        )
      case 2:
        return <Speed2Layout>{children}</Speed2Layout>
      case 3:
        return <Speed3Layout>{children}</Speed3Layout>
      case 4:
        return <Speed4Layout>{children}</Speed4Layout>
      case 5:
        return <Speed5Layout>{children}</Speed5Layout>
      default:
        return <Speed3Layout>{children}</Speed3Layout>
    }
  }
  
  return (
    <div className={`adaptive-layout-wrapper ${className}`}>
      {renderLayout()}
    </div>
  )
}

// Responsive grid system for different speeds
export const SpeedResponsiveGrid: React.FC<{
  speed: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
  columns?: number
}> = ({ speed, children, columns }) => {
  const getGridColumns = () => {
    if (columns) return columns
    
    switch (speed) {
      case 1: return 1 // Single column for focus
      case 2: return 2 // Two columns for visual + text
      case 3: return 3 // Three columns for balanced interaction
      case 4: return 2 // Two columns for text + conversation
      case 5: return 4 // Four columns for advanced layout
      default: return 2
    }
  }
  
  const gridColumns = getGridColumns()
  
  return (
    <div 
      className={`speed-responsive-grid speed-${speed}-grid`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: speed === 1 ? '2rem' : speed === 5 ? '1rem' : '1.5rem'
      }}
    >
      {children}
    </div>
  )
}

// Navigation patterns for different speeds
export const SpeedNavigation: React.FC<{
  speed: 1 | 2 | 3 | 4 | 5
  onPrevious?: () => void
  onNext?: () => void
  onMenu?: () => void
}> = ({ speed, onPrevious, onNext, onMenu }) => {
  const getNavigationStyle = () => {
    switch (speed) {
      case 1:
        return 'simple-large-buttons'
      case 2:
        return 'visual-navigation'
      case 3:
        return 'balanced-navigation'
      case 4:
        return 'text-focused-navigation'
      case 5:
        return 'advanced-navigation'
      default:
        return 'balanced-navigation'
    }
  }
  
  const navigationClass = `speed-navigation ${getNavigationStyle()}`
  
  return (
    <nav className={navigationClass}>
      <div className="nav-container">
        {speed === 1 && (
          // Simple, large buttons for Speed 1
          <div className="simple-nav">
            <button className="nav-button large" onClick={onPrevious}>
              ← Back
            </button>
            <button className="nav-button large primary" onClick={onNext}>
              Continue →
            </button>
          </div>
        )}
        
        {speed === 2 && (
          // Visual navigation with icons
          <div className="visual-nav">
            <button className="nav-button icon" onClick={onPrevious}>
              <span className="icon">⬅️</span>
              <span className="label">Previous</span>
            </button>
            <button className="nav-button icon" onClick={onMenu}>
              <span className="icon">📚</span>
              <span className="label">Menu</span>
            </button>
            <button className="nav-button icon primary" onClick={onNext}>
              <span className="label">Next</span>
              <span className="icon">➡️</span>
            </button>
          </div>
        )}
        
        {speed === 3 && (
          // Balanced navigation with interaction hints
          <div className="balanced-nav">
            <button className="nav-button interactive" onClick={onPrevious}>
              Previous
            </button>
            <div className="progress-indicator">
              <div className="progress-dots"></div>
            </div>
            <button className="nav-button interactive primary" onClick={onNext}>
              Next
            </button>
          </div>
        )}
        
        {speed === 4 && (
          // Text-focused navigation
          <div className="text-nav">
            <button className="nav-button text" onClick={onPrevious}>
              ← Previous Section
            </button>
            <button className="nav-button text" onClick={onMenu}>
              Table of Contents
            </button>
            <button className="nav-button text primary" onClick={onNext}>
              Next Section →
            </button>
          </div>
        )}
        
        {speed === 5 && (
          // Advanced navigation with shortcuts
          <div className="advanced-nav">
            <button className="nav-button compact" onClick={onPrevious}>
              ← Prev
            </button>
            <div className="nav-shortcuts">
              <button className="shortcut" onClick={onMenu}>Menu</button>
              <button className="shortcut">Search</button>
              <button className="shortcut">Notes</button>
            </div>
            <button className="nav-button compact primary" onClick={onNext}>
              Next →
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default SpeedBasedLayout 