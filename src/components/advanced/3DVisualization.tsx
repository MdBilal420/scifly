import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../styles/adaptiveComponents.css'

interface ThreeDVisualizationProps {
  concept: string
  userSpeed: number
  onInteraction: (type: string, data?: any) => void
}

interface VisualizationData {
  id: string
  name: string
  description: string
  complexity: number
  interactionType: 'rotate' | 'zoom' | 'layer' | 'explode'
  elements: Array<{
    id: string
    type: 'sphere' | 'cube' | 'cylinder' | 'complex'
    position: { x: number; y: number; z: number }
    color: string
    label: string
    size: number
  }>
}

const visualizations: Record<string, VisualizationData> = {
  'solar-system': {
    id: 'solar-system',
    name: 'Solar System',
    description: 'Explore the planets and their orbits around the sun',
    complexity: 3,
    interactionType: 'rotate',
    elements: [
      { id: 'sun', type: 'sphere', position: { x: 0, y: 0, z: 0 }, color: '#FFD700', label: 'Sun', size: 30 },
      { id: 'mercury', type: 'sphere', position: { x: 50, y: 0, z: 0 }, color: '#8C7853', label: 'Mercury', size: 4 },
      { id: 'venus', type: 'sphere', position: { x: 70, y: 0, z: 0 }, color: '#FFC649', label: 'Venus', size: 6 },
      { id: 'earth', type: 'sphere', position: { x: 90, y: 0, z: 0 }, color: '#4A90E2', label: 'Earth', size: 6 },
      { id: 'mars', type: 'sphere', position: { x: 120, y: 0, z: 0 }, color: '#CD5C5C', label: 'Mars', size: 5 }
    ]
  },
  'atom-structure': {
    id: 'atom-structure',
    name: 'Atomic Structure',
    description: 'Discover the components of an atom',
    complexity: 4,
    interactionType: 'layer',
    elements: [
      { id: 'nucleus', type: 'sphere', position: { x: 0, y: 0, z: 0 }, color: '#FF6B6B', label: 'Nucleus', size: 20 },
      { id: 'electron1', type: 'sphere', position: { x: 40, y: 0, z: 0 }, color: '#4ECDC4', label: 'Electron', size: 3 },
      { id: 'electron2', type: 'sphere', position: { x: -40, y: 0, z: 0 }, color: '#4ECDC4', label: 'Electron', size: 3 },
      { id: 'electron3', type: 'sphere', position: { x: 0, y: 40, z: 0 }, color: '#4ECDC4', label: 'Electron', size: 3 }
    ]
  },
  'cell-structure': {
    id: 'cell-structure',
    name: 'Cell Structure',
    description: 'Explore the parts of a plant cell',
    complexity: 4,
    interactionType: 'explode',
    elements: [
      { id: 'cell-wall', type: 'cube', position: { x: 0, y: 0, z: 0 }, color: '#8FBC8F', label: 'Cell Wall', size: 100 },
      { id: 'nucleus', type: 'sphere', position: { x: 0, y: 0, z: 0 }, color: '#FF6B6B', label: 'Nucleus', size: 25 },
      { id: 'chloroplast', type: 'cylinder', position: { x: 20, y: 20, z: 0 }, color: '#32CD32', label: 'Chloroplast', size: 15 },
      { id: 'mitochondria', type: 'cylinder', position: { x: -20, y: -20, z: 0 }, color: '#FFD700', label: 'Mitochondria', size: 12 }
    ]
  }
}

export const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({
  concept,
  userSpeed,
  onInteraction
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [viewMode, setViewMode] = useState<'3d' | 'exploded' | 'layered'>('3d')
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const visualization = visualizations[concept] || visualizations['solar-system']

  useEffect(() => {
    // Adjust animation speed based on user speed
    const speedMultiplier = userSpeed <= 2 ? 0.5 : userSpeed >= 4 ? 1.5 : 1
    setAnimationSpeed(speedMultiplier)
  }, [userSpeed])

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId)
    onInteraction('element_selected', { 
      concept, 
      elementId, 
      userSpeed,
      viewMode 
    })
  }

  const toggleRotation = () => {
    setIsRotating(!isRotating)
    onInteraction('rotation_toggled', { 
      concept, 
      isRotating: !isRotating,
      userSpeed 
    })
  }

  const changeViewMode = (mode: '3d' | 'exploded' | 'layered') => {
    setViewMode(mode)
    onInteraction('view_mode_changed', { 
      concept, 
      viewMode: mode,
      userSpeed 
    })
  }

  const getElementPosition = (element: any, index: number) => {
    const basePosition = element.position
    
    switch (viewMode) {
      case 'exploded':
        return {
          x: basePosition.x * 1.5,
          y: basePosition.y * 1.5,
          z: basePosition.z * 1.5
        }
      case 'layered':
        return {
          x: basePosition.x,
          y: basePosition.y + (index * 20),
          z: basePosition.z
        }
      default:
        return basePosition
    }
  }

  const getSpeedBasedControls = () => {
    if (userSpeed <= 2) {
      return (
        <div className="simple-controls">
          <motion.button
            className="control-btn large"
            onClick={toggleRotation}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRotating ? '⏸️ Pause' : '▶️ Play'}
          </motion.button>
        </div>
      )
    } else if (userSpeed >= 4) {
      return (
        <div className="advanced-controls">
          <div className="control-group">
            <label className="control-label">View Mode:</label>
            <div className="button-group">
              <button 
                className={`control-btn ${viewMode === '3d' ? 'active' : ''}`}
                onClick={() => changeViewMode('3d')}
              >
                3D
              </button>
              <button 
                className={`control-btn ${viewMode === 'exploded' ? 'active' : ''}`}
                onClick={() => changeViewMode('exploded')}
              >
                Exploded
              </button>
              <button 
                className={`control-btn ${viewMode === 'layered' ? 'active' : ''}`}
                onClick={() => changeViewMode('layered')}
              >
                Layered
              </button>
            </div>
          </div>
          <div className="control-group">
            <label className="control-label">Animation:</label>
            <button 
              className="control-btn"
              onClick={toggleRotation}
            >
              {isRotating ? '⏸️ Pause' : '▶️ Rotate'}
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="balanced-controls">
          <button 
            className="control-btn"
            onClick={toggleRotation}
          >
            {isRotating ? '⏸️ Stop' : '🔄 Rotate'}
          </button>
          <select 
            className="control-select"
            value={viewMode}
            onChange={(e) => changeViewMode(e.target.value as any)}
          >
            <option value="3d">3D View</option>
            <option value="exploded">Exploded View</option>
            <option value="layered">Layer View</option>
          </select>
        </div>
      )
    }
  }

  return (
    <div className={`threed-visualization speed-${userSpeed}`}>
      <div className="visualization-header">
        <h3 className="visualization-title">{visualization.name}</h3>
        <p className="visualization-description">{visualization.description}</p>
      </div>

      <div 
        ref={containerRef}
        className="visualization-container"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <motion.div
          className="visualization-scene"
          animate={{
            rotateY: isRotating ? 360 : 0,
            rotateX: userSpeed >= 4 ? -15 : 0
          }}
          transition={{
            duration: 8 / animationSpeed,
            repeat: isRotating ? Infinity : 0,
            ease: "linear"
          }}
        >
          {visualization.elements.map((element, index) => {
            const position = getElementPosition(element, index)
            const isSelected = selectedElement === element.id
            
            return (
              <motion.div
                key={element.id}
                className={`visualization-element ${element.type} ${isSelected ? 'selected' : ''}`}
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`,
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  backgroundColor: element.color,
                  borderRadius: element.type === 'sphere' ? '50%' : element.type === 'cylinder' ? '50%' : '8px'
                }}
                onClick={() => handleElementClick(element.id)}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                animate={isSelected ? {
                  boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 10px rgba(255,255,255,0)'],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  boxShadow: { duration: 1.5, repeat: Infinity },
                  scale: { duration: 0.5 }
                }}
              >
                {userSpeed <= 2 && (
                  <div className="element-label-simple">
                    {element.label}
                  </div>
                )}
                {userSpeed >= 3 && (
                  <motion.div
                    className="element-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 1 : 0.7 }}
                  >
                    {element.label}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <div className="visualization-controls">
        {getSpeedBasedControls()}
      </div>

      <AnimatePresence>
        {selectedElement && (
          <motion.div
            className="element-info-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="info-content">
              <h4>{visualization.elements.find(e => e.id === selectedElement)?.label}</h4>
              <p>Learn more about this component of the {visualization.name.toLowerCase()}.</p>
              <button 
                className="close-btn"
                onClick={() => setSelectedElement(null)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThreeDVisualization 