import React, { useState, useRef, useCallback, useEffect } from 'react'
import { getModesForSpeed } from '../../config/learningModes'

interface InteractiveContentProps {
  content: any
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}

interface DragDropProps {
  items: any[]
  targets: any[]
  onComplete?: (matches: any[]) => void
  difficulty: 'easy' | 'medium' | 'hard'
}

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  label: string
  unit?: string
}

interface KinestheticActivityProps {
  activity: any
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}

// Main interactive content renderer
export const InteractiveContentRenderer: React.FC<InteractiveContentProps> = ({
  content,
  userSpeed,
  onInteraction
}) => {
  const speedConfig = getModesForSpeed(userSpeed)
  const [currentActivity, setCurrentActivity] = useState(0)
  const [completedActivities, setCompletedActivities] = useState<number[]>([])

  const activities = content?.interactive || []

  const handleActivityComplete = (activityIndex: number, result: any) => {
    setCompletedActivities(prev => [...prev, activityIndex])
    onInteraction?.('activity_complete', { activityIndex, result, userSpeed })
    
    // Auto-advance for faster learners
    if (userSpeed >= 4 && activityIndex < activities.length - 1) {
      setTimeout(() => setCurrentActivity(activityIndex + 1), 1000)
    }
  }

  return (
    <div className={`interactive-content-renderer speed-${userSpeed}`}>
      <div className="activity-container">
        {activities.map((activity: any, index: number) => (
          <div 
            key={`activity-${index}`}
            className={`activity ${currentActivity === index ? 'active' : ''} ${completedActivities.includes(index) ? 'completed' : ''}`}
          >
            {activity.type === 'drag-drop' && (
              <DragDropActivity
                activity={activity}
                userSpeed={userSpeed}
                onComplete={(result) => handleActivityComplete(index, result)}
                onInteraction={onInteraction}
              />
            )}
            
            {activity.type === 'slider' && (
              <SliderActivity
                activity={activity}
                userSpeed={userSpeed}
                onComplete={(result) => handleActivityComplete(index, result)}
                onInteraction={onInteraction}
              />
            )}
            
            {activity.type === 'build' && (
              <BuildingActivity
                activity={activity}
                userSpeed={userSpeed}
                onComplete={(result) => handleActivityComplete(index, result)}
                onInteraction={onInteraction}
              />
            )}
            
            {activity.type === 'experiment' && (
              <ExperimentActivity
                activity={activity}
                userSpeed={userSpeed}
                onComplete={(result) => handleActivityComplete(index, result)}
                onInteraction={onInteraction}
              />
            )}
          </div>
        ))}
      </div>
      
      {activities.length > 1 && (
        <ActivityNavigation
          total={activities.length}
          current={currentActivity}
          completed={completedActivities}
          onChange={setCurrentActivity}
          userSpeed={userSpeed}
        />
      )}
    </div>
  )
}

// Drag and Drop Activity
export const DragDropActivity: React.FC<KinestheticActivityProps & { onComplete?: (result: any) => void }> = ({
  activity,
  userSpeed,
  onComplete,
  onInteraction
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [attempts, setAttempts] = useState(0)

  const difficulty = userSpeed <= 2 ? 'easy' : userSpeed === 3 ? 'medium' : 'hard'
  const showHints = userSpeed <= 2

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
    onInteraction?.('drag_start', { itemId, userSpeed })
  }

  const handleDrop = (targetId: string) => {
    if (!draggedItem) return

    const isCorrect = activity.correctMatches[draggedItem] === targetId
    const newMatch = { item: draggedItem, target: targetId, correct: isCorrect }
    
    setMatches(prev => [...prev, newMatch])
    setAttempts(prev => prev + 1)
    setDraggedItem(null)

    onInteraction?.('drop_attempt', { 
      itemId: draggedItem, 
      targetId, 
      correct: isCorrect,
      attempts: attempts + 1 
    })

    // Check if all items are matched correctly
    const totalItems = Object.keys(activity.correctMatches).length
    const correctMatches = [...matches, newMatch].filter(m => m.correct).length
    
    if (correctMatches === totalItems) {
      onComplete?.({ matches: [...matches, newMatch], attempts: attempts + 1 })
    }
  }

  return (
    <div className={`drag-drop-activity ${difficulty}`}>
      <h3 className="activity-title">{activity.title}</h3>
      <p className="activity-instructions">{activity.instructions}</p>
      
      <div className="drag-drop-container">
        <div className="draggable-items">
          <h4>Items to Match:</h4>
          {activity.items.map((item: any) => {
            const isMatched = matches.some(m => m.item === item.id && m.correct)
            return (
              <div
                key={item.id}
                className={`draggable-item ${isMatched ? 'matched' : ''} ${draggedItem === item.id ? 'dragging' : ''}`}
                draggable={!isMatched}
                onDragStart={() => handleDragStart(item.id)}
              >
                <div className="item-content">
                  {item.icon && <span className="item-icon">{item.icon}</span>}
                  <span className="item-label">{item.label}</span>
                </div>
                {showHints && item.hint && (
                  <div className="item-hint">{item.hint}</div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="drop-targets">
          <h4>Drop Zones:</h4>
          {activity.targets.map((target: any) => {
            const match = matches.find(m => m.target === target.id)
            return (
              <div
                key={target.id}
                className={`drop-target ${match ? (match.correct ? 'correct' : 'incorrect') : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(target.id)}
              >
                <div className="target-content">
                  {target.icon && <span className="target-icon">{target.icon}</span>}
                  <span className="target-label">{target.label}</span>
                </div>
                {match && (
                  <div className="matched-item">
                    {activity.items.find((item: any) => item.id === match.item)?.label}
                    {match.correct ? ' ✅' : ' ❌'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="activity-progress">
        <span>Attempts: {attempts}</span>
        <span>Correct: {matches.filter(m => m.correct).length} / {Object.keys(activity.correctMatches).length}</span>
      </div>
    </div>
  )
}

// Slider Activity (for experiments, adjustments)
export const SliderActivity: React.FC<KinestheticActivityProps & { onComplete?: (result: any) => void }> = ({
  activity,
  userSpeed,
  onComplete,
  onInteraction
}) => {
  const [values, setValues] = useState<Record<string, number>>(
    activity.sliders.reduce((acc: any, slider: any) => {
      acc[slider.id] = slider.defaultValue || slider.min
      return acc
    }, {})
  )
  const [result, setResult] = useState<any>(null)

  const handleSliderChange = (sliderId: string, value: number) => {
    const newValues = { ...values, [sliderId]: value }
    setValues(newValues)
    
    // Calculate result based on slider values
    const calculatedResult = activity.calculateResult(newValues)
    setResult(calculatedResult)
    
    onInteraction?.('slider_change', { sliderId, value, result: calculatedResult })
    
    // Check if target achieved
    if (activity.targetCheck && activity.targetCheck(calculatedResult)) {
      onComplete?.({ values: newValues, result: calculatedResult })
    }
  }

  return (
    <div className={`slider-activity speed-${userSpeed}`}>
      <h3 className="activity-title">{activity.title}</h3>
      <p className="activity-instructions">{activity.instructions}</p>
      
      <div className="sliders-container">
        {activity.sliders.map((slider: any) => (
          <div key={slider.id} className="slider-control">
            <label className="slider-label">
              {slider.label}: {values[slider.id]} {slider.unit || ''}
            </label>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step || 1}
              value={values[slider.id]}
              onChange={(e) => handleSliderChange(slider.id, Number(e.target.value))}
              className="slider-input"
            />
            <div className="slider-range">
              <span>{slider.min}</span>
              <span>{slider.max}</span>
            </div>
          </div>
        ))}
      </div>
      
      {result && (
        <div className="result-display">
          <h4>Result:</h4>
          <div className="result-content">
            {activity.renderResult ? activity.renderResult(result) : (
              <pre>{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
      
      {activity.target && (
        <div className="target-display">
          <h4>Target: {activity.target.description}</h4>
          <div className={`target-status ${result && activity.targetCheck && activity.targetCheck(result) ? 'achieved' : 'not-achieved'}`}>
            {result && activity.targetCheck && activity.targetCheck(result) ? '✅ Target Achieved!' : '🎯 Keep Adjusting'}
          </div>
        </div>
      )}
    </div>
  )
}

// Building Activity (construct models, arrange elements)
export const BuildingActivity: React.FC<KinestheticActivityProps & { onComplete?: (result: any) => void }> = ({
  activity,
  userSpeed,
  onComplete,
  onInteraction
}) => {
  const [builderState, setBuilderState] = useState({
    placed: [] as any[],
    available: [...activity.components]
  })
  const [isValidBuild, setIsValidBuild] = useState(false)

  const handleComponentPlace = (component: any, position: { x: number, y: number }) => {
    const newPlaced = [...builderState.placed, { ...component, position }]
    const newAvailable = builderState.available.filter(c => c.id !== component.id)
    
    const newState = { placed: newPlaced, available: newAvailable }
    setBuilderState(newState)
    
    // Validate the build
    const valid = activity.validateBuild ? activity.validateBuild(newPlaced) : true
    setIsValidBuild(valid)
    
    onInteraction?.('component_place', { component, position, isValid: valid })
    
    if (valid && newAvailable.length === 0) {
      onComplete?.({ build: newPlaced, isValid: valid })
    }
  }

  const handleComponentRemove = (componentId: string) => {
    const component = builderState.placed.find(c => c.id === componentId)
    if (!component) return

    const newPlaced = builderState.placed.filter(c => c.id !== componentId)
    const newAvailable = [...builderState.available, { ...component, position: undefined }]
    
    setBuilderState({ placed: newPlaced, available: newAvailable })
    onInteraction?.('component_remove', { componentId })
  }

  return (
    <div className={`building-activity speed-${userSpeed}`}>
      <h3 className="activity-title">{activity.title}</h3>
      <p className="activity-instructions">{activity.instructions}</p>
      
      <div className="building-container">
        <div className="component-palette">
          <h4>Available Components:</h4>
          {builderState.available.map((component: any) => (
            <div
              key={component.id}
              className="component-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('component', JSON.stringify(component))
              }}
            >
              <div className="component-icon">{component.icon}</div>
              <div className="component-label">{component.label}</div>
            </div>
          ))}
        </div>
        
        <div 
          className="build-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const componentData = e.dataTransfer.getData('component')
            if (componentData) {
              const component = JSON.parse(componentData)
              const rect = e.currentTarget.getBoundingClientRect()
              const position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              }
              handleComponentPlace(component, position)
            }
          }}
        >
          <h4>Build Area:</h4>
          {builderState.placed.map((component: any) => (
            <div
              key={`placed-${component.id}`}
              className="placed-component"
              style={{
                position: 'absolute',
                left: component.position.x,
                top: component.position.y
              }}
              onClick={() => handleComponentRemove(component.id)}
            >
              <div className="component-icon">{component.icon}</div>
              <div className="component-label">{component.label}</div>
            </div>
          ))}
          
          {builderState.placed.length === 0 && (
            <div className="build-placeholder">
              Drag components here to build your model
            </div>
          )}
        </div>
      </div>
      
      <div className="build-status">
        <div className={`validation-status ${isValidBuild ? 'valid' : 'invalid'}`}>
          {isValidBuild ? '✅ Valid Build' : '⚠️ Check Your Build'}
        </div>
        <div className="progress">
          {builderState.placed.length} / {activity.components.length} components placed
        </div>
      </div>
    </div>
  )
}

// Experiment Activity (hypothesis testing, variable manipulation)
export const ExperimentActivity: React.FC<KinestheticActivityProps & { onComplete?: (result: any) => void }> = ({
  activity,
  userSpeed,
  onComplete,
  onInteraction
}) => {
  const [experimentState, setExperimentState] = useState({
    hypothesis: '',
    variables: activity.defaultVariables || {},
    results: [] as any[],
    currentTrial: 0
  })

  const runExperiment = () => {
    const result = activity.runSimulation(experimentState.variables)
    const newResults = [...experimentState.results, {
      trial: experimentState.currentTrial + 1,
      variables: { ...experimentState.variables },
      result
    }]
    
    const newState = {
      ...experimentState,
      results: newResults,
      currentTrial: experimentState.currentTrial + 1
    }
    
    setExperimentState(newState)
    onInteraction?.('experiment_run', { trial: newState.currentTrial, result })
    
    // Check if enough trials completed
    if (newResults.length >= activity.minTrials) {
      onComplete?.({ 
        hypothesis: experimentState.hypothesis,
        results: newResults,
        conclusion: activity.analyzeResults ? activity.analyzeResults(newResults) : null
      })
    }
  }

  const updateVariable = (variableId: string, value: any) => {
    setExperimentState(prev => ({
      ...prev,
      variables: { ...prev.variables, [variableId]: value }
    }))
  }

  return (
    <div className={`experiment-activity speed-${userSpeed}`}>
      <h3 className="activity-title">{activity.title}</h3>
      <p className="activity-instructions">{activity.instructions}</p>
      
      <div className="experiment-setup">
        <div className="hypothesis-section">
          <label>Your Hypothesis:</label>
          <textarea
            value={experimentState.hypothesis}
            onChange={(e) => setExperimentState(prev => ({ ...prev, hypothesis: e.target.value }))}
            placeholder="What do you think will happen?"
            rows={3}
          />
        </div>
        
        <div className="variables-section">
          <h4>Experiment Variables:</h4>
          {activity.variables.map((variable: any) => (
            <div key={variable.id} className="variable-control">
              <label>{variable.label}:</label>
              {variable.type === 'slider' && (
                <input
                  type="range"
                  min={variable.min}
                  max={variable.max}
                  step={variable.step || 1}
                  value={experimentState.variables[variable.id] || variable.default}
                  onChange={(e) => updateVariable(variable.id, Number(e.target.value))}
                />
              )}
              {variable.type === 'select' && (
                <select
                  value={experimentState.variables[variable.id] || variable.default}
                  onChange={(e) => updateVariable(variable.id, e.target.value)}
                >
                  {variable.options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
        
        <button 
          className="run-experiment-button"
          onClick={runExperiment}
          disabled={!experimentState.hypothesis.trim()}
        >
          Run Experiment (Trial {experimentState.currentTrial + 1})
        </button>
      </div>
      
      {experimentState.results.length > 0 && (
        <div className="experiment-results">
          <h4>Results:</h4>
          <div className="results-table">
            {experimentState.results.map((result: any, index: number) => (
              <div key={index} className="result-row">
                <span>Trial {result.trial}:</span>
                <span>{JSON.stringify(result.result)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Activity Navigation
export const ActivityNavigation: React.FC<{
  total: number
  current: number
  completed: number[]
  onChange: (index: number) => void
  userSpeed: number
}> = ({ total, current, completed, onChange, userSpeed }) => {
  return (
    <div className={`activity-navigation speed-${userSpeed}`}>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          className={`nav-button ${current === index ? 'active' : ''} ${completed.includes(index) ? 'completed' : ''}`}
          onClick={() => onChange(index)}
        >
          {completed.includes(index) ? '✅' : index + 1}
        </button>
      ))}
    </div>
  )
}

export default InteractiveContentRenderer 