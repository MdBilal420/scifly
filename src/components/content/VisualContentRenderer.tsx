import React, { useState, useEffect, useMemo } from 'react'
import { getModesForSpeed } from '../../config/learningModes'

interface VisualContentProps {
  content: any
  userSpeed: number
  topic?: string
  onInteraction?: (type: string, data?: any) => void
}

interface DiagramProps {
  data: any
  size: 'small' | 'medium' | 'large'
  interactive?: boolean
  style?: 'simple' | 'detailed' | 'complex'
}

interface AnimationProps {
  concept: string
  speed: 'slow' | 'medium' | 'fast'
  loops?: number
  autoPlay?: boolean
}

// Main visual content renderer
export const VisualContentRenderer: React.FC<VisualContentProps> = ({
  content,
  userSpeed,
  topic,
  onInteraction
}) => {
  const speedConfig = getModesForSpeed(userSpeed)
  const [currentVisual, setCurrentVisual] = useState(0)
  
  const visualElements = useMemo(() => {
    if (!content?.visual) return []
    
    return content.visual.map((item: any, index: number) => ({
      ...item,
      id: `visual-${index}`,
      size: speedConfig.characteristics.visualSupport === 'extensive' ? 'large' : 
            speedConfig.characteristics.visualSupport === 'moderate' ? 'medium' : 'small',
      style: speedConfig.characteristics.complexity === 'single' ? 'simple' :
             speedConfig.characteristics.complexity === 'moderate' ? 'detailed' : 'complex'
    }))
  }, [content, speedConfig])

  // Handle simple-display type for Speed 1 users
  if (content.type === 'simple-display') {
    return (
      <div className={`visual-content-renderer speed-${userSpeed} simple-display`}>
        <div className="simple-content-container">
          <div className="simple-visual-element">
            <div className="simple-image">
              <span className="emoji-icon">{content.image}</span>
            </div>
            <div className="simple-text-content">
              <h3 className="simple-title">{content.title}</h3>
              <p className="simple-description">{content.description}</p>
              <div className="simple-tip">
                <span className="tip-icon">💡</span>
                <span className="tip-text">{content.tip}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`visual-content-renderer speed-${userSpeed}`}>
      <div className="visual-content-container">
        {visualElements.map((visual: any, index: number) => (
          <div 
            key={visual.id}
            className={`visual-element ${visual.type} ${currentVisual === index ? 'active' : ''}`}
          >
            {visual.type === 'diagram' && (
              <ConceptDiagram
                data={visual.data}
                size={visual.size}
                interactive={userSpeed >= 3}
                style={visual.style}
                onInteraction={onInteraction}
              />
            )}
            
            {visual.type === 'animation' && (
              <ConceptAnimation
                concept={visual.concept}
                speed={speedConfig.uiElements.animations === 'standard' ? 'medium' : 
                       speedConfig.uiElements.animations === 'quick' ? 'fast' : 'slow'}
                autoPlay={userSpeed <= 2}
                onInteraction={onInteraction}
              />
            )}
            
            {visual.type === 'chart' && (
              <InteractiveChart
                data={visual.data}
                type={visual.chartType}
                userSpeed={userSpeed}
                onInteraction={onInteraction}
              />
            )}
            
            {visual.type === 'infographic' && (
              <Infographic
                data={visual.data}
                userSpeed={userSpeed}
                onInteraction={onInteraction}
              />
            )}
          </div>
        ))}
      </div>
      
      {visualElements.length > 1 && (
        <VisualNavigation
          total={visualElements.length}
          current={currentVisual}
          onChange={setCurrentVisual}
          userSpeed={userSpeed}
        />
      )}
    </div>
  )
}

// Concept diagram component
export const ConceptDiagram: React.FC<DiagramProps & { onInteraction?: (type: string, data?: any) => void }> = ({
  data,
  size,
  interactive = false,
  style = 'simple',
  onInteraction
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const handleNodeClick = (nodeId: string) => {
    if (!interactive) return
    
    setSelectedNode(nodeId)
    onInteraction?.('diagram_node_click', { nodeId, nodeData: data.nodes[nodeId] })
  }

  const getNodeSize = () => {
    switch (size) {
      case 'small': return 60
      case 'medium': return 80
      case 'large': return 100
      default: return 80
    }
  }

  return (
    <div className={`concept-diagram ${size} ${style} ${interactive ? 'interactive' : ''}`}>
      <svg viewBox="0 0 800 600" className="diagram-svg">
        {/* Render connections */}
        {data.connections?.map((conn: any, index: number) => (
          <line
            key={`connection-${index}`}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            className={`connection ${conn.type || 'default'}`}
            strokeWidth={style === 'simple' ? 2 : style === 'detailed' ? 3 : 4}
          />
        ))}
        
        {/* Render nodes */}
        {data.nodes?.map((node: any) => (
          <g key={node.id} className="diagram-node">
            <circle
              cx={node.x}
              cy={node.y}
              r={getNodeSize() / 2}
              className={`node ${node.type || 'default'} ${selectedNode === node.id ? 'selected' : ''} ${hoveredNode === node.id ? 'hovered' : ''}`}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={`node-label ${size}`}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      
      {selectedNode && interactive && (
        <div className="node-details">
          <h4>{data.nodes.find((n: any) => n.id === selectedNode)?.label}</h4>
          <p>{data.nodes.find((n: any) => n.id === selectedNode)?.description}</p>
        </div>
      )}
    </div>
  )
}

// Concept animation component
export const ConceptAnimation: React.FC<AnimationProps & { onInteraction?: (type: string, data?: any) => void }> = ({
  concept,
  speed = 'medium',
  loops = 1,
  autoPlay = true,
  onInteraction
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentFrame, setCurrentFrame] = useState(0)

  const getDuration = () => {
    switch (speed) {
      case 'slow': return 3000
      case 'medium': return 2000
      case 'fast': return 1000
      default: return 2000
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    onInteraction?.('animation_toggle', { concept, playing: !isPlaying })
  }

  return (
    <div className={`concept-animation ${speed}`}>
      <div className="animation-container">
        <div className={`animation-content ${concept} ${isPlaying ? 'playing' : 'paused'}`}>
          {/* Animation content based on concept */}
          {concept === 'photosynthesis' && <PhotosynthesisAnimation frame={currentFrame} />}
          {concept === 'water_cycle' && <WaterCycleAnimation frame={currentFrame} />}
          {concept === 'solar_system' && <SolarSystemAnimation frame={currentFrame} />}
          {concept === 'cell_division' && <CellDivisionAnimation frame={currentFrame} />}
        </div>
      </div>
      
      <div className="animation-controls">
        <button 
          className="play-pause-button"
          onClick={handlePlayPause}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <div className="animation-progress">
          <div 
            className="progress-bar"
            style={{ 
              width: `${(currentFrame / 100) * 100}%`,
              animationDuration: `${getDuration()}ms`
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Sample animation components
const PhotosynthesisAnimation: React.FC<{ frame: number }> = ({ frame }) => (
  <div className="photosynthesis-animation">
    <div className={`sun ${frame > 10 ? 'shining' : ''}`}>☀️</div>
    <div className={`plant ${frame > 20 ? 'growing' : ''}`}>🌱</div>
    <div className={`co2 ${frame > 30 ? 'flowing' : ''}`}>CO₂</div>
    <div className={`oxygen ${frame > 40 ? 'releasing' : ''}`}>O₂</div>
  </div>
)

const WaterCycleAnimation: React.FC<{ frame: number }> = ({ frame }) => (
  <div className="water-cycle-animation">
    <div className={`cloud ${frame > 15 ? 'moving' : ''}`}>☁️</div>
    <div className={`rain ${frame > 30 ? 'falling' : ''}`}>🌧️</div>
    <div className={`ocean ${frame > 45 ? 'evaporating' : ''}`}>🌊</div>
  </div>
)

const SolarSystemAnimation: React.FC<{ frame: number }> = ({ frame }) => (
  <div className="solar-system-animation">
    <div className="sun">⭐</div>
    <div className={`planet earth ${frame > 0 ? 'orbiting' : ''}`}>🌍</div>
    <div className={`planet mars ${frame > 20 ? 'orbiting' : ''}`}>🔴</div>
  </div>
)

const CellDivisionAnimation: React.FC<{ frame: number }> = ({ frame }) => (
  <div className="cell-division-animation">
    <div className={`cell ${frame > 25 ? 'dividing' : ''}`}>
      <div className="nucleus"></div>
    </div>
  </div>
)

// Interactive chart component
export const InteractiveChart: React.FC<{
  data: any
  type: 'bar' | 'line' | 'pie' | 'scatter'
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}> = ({ data, type, userSpeed, onInteraction }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)
  
  const handleDataPointClick = (point: any) => {
    setSelectedDataPoint(point)
    onInteraction?.(('chart_data_select'), { point, chartType: type })
  }

  return (
    <div className={`interactive-chart ${type} speed-${userSpeed}`}>
      <div className="chart-container">
        {type === 'bar' && (
          <BarChart 
            data={data} 
            interactive={userSpeed >= 3}
            onDataPointClick={handleDataPointClick}
          />
        )}
        {type === 'line' && (
          <LineChart 
            data={data}
            interactive={userSpeed >= 3}
            onDataPointClick={handleDataPointClick}
          />
        )}
        {type === 'pie' && (
          <PieChart 
            data={data}
            interactive={userSpeed >= 3}
            onDataPointClick={handleDataPointClick}
          />
        )}
      </div>
      
      {selectedDataPoint && (
        <div className="data-point-details">
          <h4>{selectedDataPoint.label}</h4>
          <p>Value: {selectedDataPoint.value}</p>
          {selectedDataPoint.description && (
            <p>{selectedDataPoint.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Simple chart implementations
const BarChart: React.FC<{ data: any; interactive: boolean; onDataPointClick?: (point: any) => void }> = ({ 
  data, 
  interactive, 
  onDataPointClick 
}) => (
  <div className="bar-chart">
    {data.values.map((item: any, index: number) => (
      <div 
        key={index}
        className={`bar ${interactive ? 'interactive' : ''}`}
        style={{ height: `${(item.value / data.max) * 100}%` }}
        onClick={() => interactive && onDataPointClick?.(item)}
      >
        <span className="bar-label">{item.label}</span>
      </div>
    ))}
  </div>
)

const LineChart: React.FC<{ data: any; interactive: boolean; onDataPointClick?: (point: any) => void }> = ({ 
  data, 
  interactive, 
  onDataPointClick 
}) => (
  <svg className="line-chart" viewBox="0 0 400 200">
    <polyline
      points={data.points.map((p: any, i: number) => `${i * 40},${200 - p.value * 2}`).join(' ')}
      fill="none"
      stroke="blue"
      strokeWidth="2"
    />
    {data.points.map((point: any, index: number) => (
      <circle
        key={index}
        cx={index * 40}
        cy={200 - point.value * 2}
        r="4"
        fill="blue"
        className={interactive ? 'interactive' : ''}
        onClick={() => interactive && onDataPointClick?.(point)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      />
    ))}
  </svg>
)

const PieChart: React.FC<{ data: any; interactive: boolean; onDataPointClick?: (point: any) => void }> = ({ 
  data, 
  interactive, 
  onDataPointClick 
}) => {
  let currentAngle = 0
  
  return (
    <svg className="pie-chart" viewBox="0 0 200 200">
      {data.segments.map((segment: any, index: number) => {
        const angle = (segment.value / data.total) * 360
        const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180)
        const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180)
        const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180)
        const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180)
        const largeArc = angle > 180 ? 1 : 0
        
        const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`
        
        currentAngle += angle
        
        return (
          <path
            key={index}
            d={pathData}
            fill={segment.color}
            className={interactive ? 'interactive' : ''}
            onClick={() => interactive && onDataPointClick?.(segment)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        )
      })}
    </svg>
  )
}

// Infographic component
export const Infographic: React.FC<{
  data: any
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}> = ({ data, userSpeed, onInteraction }) => {
  const [activeSection, setActiveSection] = useState(0)
  
  return (
    <div className={`infographic speed-${userSpeed}`}>
      <h3 className="infographic-title">{data.title}</h3>
      
      <div className="infographic-sections">
        {data.sections.map((section: any, index: number) => (
          <div 
            key={index}
            className={`infographic-section ${activeSection === index ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(index)
              onInteraction?.('infographic_section_select', { section: index, sectionData: section })
            }}
          >
            <div className="section-icon">{section.icon}</div>
            <h4 className="section-title">{section.title}</h4>
            <p className="section-description">{section.description}</p>
            {section.stats && (
              <div className="section-stats">
                {section.stats.map((stat: any, statIndex: number) => (
                  <div key={statIndex} className="stat">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Visual navigation for multiple visuals
export const VisualNavigation: React.FC<{
  total: number
  current: number
  onChange: (index: number) => void
  userSpeed: number
}> = ({ total, current, onChange, userSpeed }) => {
  const getNavigationStyle = () => {
    if (userSpeed <= 2) return 'simple-dots'
    if (userSpeed === 3) return 'interactive-dots'
    return 'compact-tabs'
  }

  return (
    <div className={`visual-navigation ${getNavigationStyle()}`}>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          className={`nav-item ${current === index ? 'active' : ''}`}
          onClick={() => onChange(index)}
        >
          {userSpeed <= 2 ? '●' : userSpeed === 3 ? `${index + 1}` : `Tab ${index + 1}`}
        </button>
      ))}
    </div>
  )
}

export default VisualContentRenderer 