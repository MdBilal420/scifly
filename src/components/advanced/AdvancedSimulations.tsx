import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../styles/adaptiveComponents.css'

interface AdvancedSimulationsProps {
  simulation: string
  userSpeed: number
  onInteraction: (type: string, data?: any) => void
}

interface SimulationData {
  id: string
  name: string
  description: string
  complexity: number
  variables: Array<{
    id: string
    name: string
    min: number
    max: number
    default: number
    unit: string
    step: number
  }>
  outcomes: string[]
}

const simulations: Record<string, SimulationData> = {
  'photosynthesis': {
    id: 'photosynthesis',
    name: 'Photosynthesis Lab',
    description: 'Experiment with light, water, and CO2 to see how plants make food',
    complexity: 3,
    variables: [
      { id: 'light', name: 'Light Intensity', min: 0, max: 100, default: 50, unit: '%', step: 10 },
      { id: 'water', name: 'Water Amount', min: 0, max: 100, default: 60, unit: 'ml', step: 5 },
      { id: 'co2', name: 'CO2 Level', min: 0, max: 100, default: 40, unit: 'ppm', step: 5 }
    ],
    outcomes: ['Oxygen Production', 'Glucose Formation', 'Plant Growth']
  },
  'water-cycle': {
    id: 'water-cycle',
    name: 'Water Cycle Chamber',
    description: 'Control temperature and humidity to observe evaporation and condensation',
    complexity: 2,
    variables: [
      { id: 'temperature', name: 'Temperature', min: 0, max: 100, default: 25, unit: '°C', step: 5 },
      { id: 'humidity', name: 'Humidity', min: 0, max: 100, default: 50, unit: '%', step: 10 }
    ],
    outcomes: ['Evaporation Rate', 'Cloud Formation', 'Precipitation']
  },
  'ecosystem': {
    id: 'ecosystem',
    name: 'Ecosystem Balance',
    description: 'Adjust predator and prey populations to study ecosystem balance',
    complexity: 4,
    variables: [
      { id: 'predators', name: 'Predator Count', min: 0, max: 50, default: 10, unit: 'animals', step: 1 },
      { id: 'prey', name: 'Prey Count', min: 0, max: 200, default: 80, unit: 'animals', step: 5 },
      { id: 'food', name: 'Food Supply', min: 0, max: 100, default: 70, unit: 'units', step: 5 }
    ],
    outcomes: ['Population Stability', 'Food Chain Health', 'Biodiversity Index']
  }
}

export const AdvancedSimulations: React.FC<AdvancedSimulationsProps> = ({
  simulation,
  userSpeed,
  onInteraction
}) => {
  const [variables, setVariables] = useState<Record<string, number>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Record<string, number>>({})
  const [experimentHistory, setExperimentHistory] = useState<Array<{
    variables: Record<string, number>
    results: Record<string, number>
    timestamp: number
  }>>([])

  const simulationData = simulations[simulation] || simulations['photosynthesis']

  useEffect(() => {
    // Initialize variables with default values
    const initialVars: Record<string, number> = {}
    simulationData.variables.forEach(variable => {
      initialVars[variable.id] = variable.default
    })
    setVariables(initialVars)
  }, [simulationData])

  const updateVariable = (variableId: string, value: number) => {
    setVariables(prev => ({
      ...prev,
      [variableId]: value
    }))
    
    onInteraction('variable_changed', {
      simulation,
      variableId,
      value,
      userSpeed
    })
  }

  const runSimulation = async () => {
    setIsRunning(true)
    
    onInteraction('simulation_started', {
      simulation,
      variables,
      userSpeed
    })

    // Simulate processing time based on user speed
    const processingTime = userSpeed <= 2 ? 3000 : userSpeed >= 4 ? 1000 : 2000
    
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Calculate results based on variables
    const newResults = calculateResults(simulationData, variables)
    setResults(newResults)

    // Add to experiment history
    setExperimentHistory(prev => [...prev, {
      variables: { ...variables },
      results: newResults,
      timestamp: Date.now()
    }])

    setIsRunning(false)

    onInteraction('simulation_completed', {
      simulation,
      variables,
      results: newResults,
      userSpeed
    })
  }

  const calculateResults = (simData: SimulationData, vars: Record<string, number>) => {
    const results: Record<string, number> = {}

    switch (simData.id) {
      case 'photosynthesis':
        results['oxygen'] = Math.min(100, (vars.light * 0.4 + vars.water * 0.3 + vars.co2 * 0.3))
        results['glucose'] = Math.min(100, (vars.light * 0.5 + vars.water * 0.2 + vars.co2 * 0.3))
        results['growth'] = Math.min(100, (results.oxygen + results.glucose) / 2)
        break
      case 'water-cycle':
        results['evaporation'] = Math.min(100, vars.temperature * 0.8 + (100 - vars.humidity) * 0.2)
        results['clouds'] = Math.min(100, vars.humidity * 0.7 + vars.temperature * 0.3)
        results['rain'] = Math.min(100, results.clouds > 60 ? results.clouds * 0.8 : 0)
        break
      case 'ecosystem':
        const balance = Math.abs(vars.prey / Math.max(vars.predators, 1) - 8) // Optimal ratio is 8:1
        results['stability'] = Math.max(0, 100 - balance * 10)
        results['health'] = Math.min(100, vars.food * 0.6 + results.stability * 0.4)
        results['biodiversity'] = Math.min(100, (results.stability + results.health) / 2)
        break
      default:
        results['outcome'] = 50
    }

    return results
  }

  const getSpeedBasedInterface = () => {
    if (userSpeed <= 2) {
      return (
        <div className="simple-simulation">
          <div className="simple-controls">
            {simulationData.variables.slice(0, 2).map(variable => (
              <div key={variable.id} className="simple-control">
                <label className="control-label-large">
                  {variable.name}
                </label>
                <div className="slider-container">
                  <input
                    type="range"
                    min={variable.min}
                    max={variable.max}
                    step={variable.step}
                    value={variables[variable.id] || variable.default}
                    onChange={(e) => updateVariable(variable.id, Number(e.target.value))}
                    className="slider-large"
                  />
                  <span className="value-display-large">
                    {variables[variable.id] || variable.default} {variable.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (userSpeed >= 4) {
      return (
        <div className="advanced-simulation">
          <div className="variables-grid">
            {simulationData.variables.map(variable => (
              <div key={variable.id} className="variable-control advanced">
                <label className="control-label">
                  {variable.name}
                  <span className="unit">({variable.unit})</span>
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    min={variable.min}
                    max={variable.max}
                    step={variable.step}
                    value={variables[variable.id] || variable.default}
                    onChange={(e) => updateVariable(variable.id, Number(e.target.value))}
                    className="number-input"
                  />
                  <input
                    type="range"
                    min={variable.min}
                    max={variable.max}
                    step={variable.step}
                    value={variables[variable.id] || variable.default}
                    onChange={(e) => updateVariable(variable.id, Number(e.target.value))}
                    className="range-input"
                  />
                </div>
                <div className="variable-stats">
                  <span>Min: {variable.min}</span>
                  <span>Max: {variable.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    } else {
      return (
        <div className="balanced-simulation">
          <div className="controls-row">
            {simulationData.variables.map(variable => (
              <div key={variable.id} className="variable-control">
                <label className="control-label">
                  {variable.name}
                </label>
                <input
                  type="range"
                  min={variable.min}
                  max={variable.max}
                  step={variable.step}
                  value={variables[variable.id] || variable.default}
                  onChange={(e) => updateVariable(variable.id, Number(e.target.value))}
                  className="range-input"
                />
                <span className="value-display">
                  {variables[variable.id] || variable.default} {variable.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  const getResultsDisplay = () => {
    if (Object.keys(results).length === 0) return null

    if (userSpeed <= 2) {
      return (
        <div className="simple-results">
          <h4>Results:</h4>
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="result-bar">
              <span className="result-label">{key}</span>
              <div className="bar-container">
                <motion.div
                  className="bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1 }}
                />
                <span className="bar-value">{Math.round(value)}%</span>
              </div>
            </div>
          ))}
        </div>
      )
    } else {
      return (
        <div className="detailed-results">
          <h4>Experiment Results</h4>
          <div className="results-grid">
            {Object.entries(results).map(([key, value]) => (
              <motion.div
                key={key}
                className="result-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="result-header">
                  <h5>{key.charAt(0).toUpperCase() + key.slice(1)}</h5>
                </div>
                <div className="result-value">
                  <motion.span
                    className="value-number"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {Math.round(value)}%
                  </motion.span>
                </div>
                <div className="result-interpretation">
                  {value > 80 ? 'Excellent' : value > 60 ? 'Good' : value > 40 ? 'Fair' : 'Poor'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div className={`advanced-simulations speed-${userSpeed}`}>
      <div className="simulation-header">
        <h3 className="simulation-title">{simulationData.name}</h3>
        <p className="simulation-description">{simulationData.description}</p>
      </div>

      <div className="simulation-workspace">
        {getSpeedBasedInterface()}

        <div className="simulation-actions">
          <motion.button
            className={`run-button ${isRunning ? 'running' : ''}`}
            onClick={runSimulation}
            disabled={isRunning}
            whileHover={{ scale: isRunning ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? (
              <>
                <motion.div
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Running...
              </>
            ) : (
              '🧪 Run Experiment'
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {getResultsDisplay()}
        </AnimatePresence>
      </div>

      {userSpeed >= 3 && experimentHistory.length > 0 && (
        <div className="experiment-history">
          <h4>Experiment History</h4>
          <div className="history-list">
            {experimentHistory.slice(-3).map((experiment, index) => (
              <div key={experiment.timestamp} className="history-item">
                <span className="experiment-number">#{experimentHistory.length - 2 + index}</span>
                <div className="experiment-summary">
                  {Object.entries(experiment.variables).map(([key, value]) => (
                    <span key={key} className="variable-summary">
                      {key}: {value}
                    </span>
                  ))}
                </div>
                <div className="experiment-outcome">
                  Avg Result: {Math.round(
                    Object.values(experiment.results).reduce((a, b) => a + b, 0) / 
                    Object.values(experiment.results).length
                  )}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSimulations 