import React, { useState } from 'react'
import { AdaptiveLessonContainer } from './AdaptiveLessonContainer'
import MasterContentRenderer from './content/MasterContentRenderer'

// Demo content for showcasing Phase 2 features
const DEMO_CONTENT = {
  title: 'Phase 2 Demo: Speed-Adaptive Learning System',
  sections: [
    {
      type: 'visual',
      content: {
        title: 'Visual Learning Demonstration',
        visual: [
          {
            type: 'infographic',
            data: {
              title: 'Photosynthesis Process',
              sections: [
                {
                  icon: '☀️',
                  title: 'Sunlight',
                  description: 'Plants capture energy from the sun',
                  stats: [{ value: '6CO₂', label: 'Carbon Dioxide' }]
                },
                {
                  icon: '💧',
                  title: 'Water',
                  description: 'Roots absorb water from soil',
                  stats: [{ value: '6H₂O', label: 'Water molecules' }]
                },
                {
                  icon: '🌱',
                  title: 'Glucose',
                  description: 'Plants create food for energy',
                  stats: [{ value: 'C₆H₁₂O₆', label: 'Glucose formula' }]
                }
              ]
            }
          },
          {
            type: 'animation',
            concept: 'photosynthesis'
          },
          {
            type: 'chart',
            chartType: 'bar',
            data: {
              max: 100,
              values: [
                { label: 'Light Energy', value: 80 },
                { label: 'Water Absorption', value: 65 },
                { label: 'CO₂ Intake', value: 70 },
                { label: 'Glucose Production', value: 85 }
              ]
            }
          }
        ]
      }
    },
    {
      type: 'interactive',
      content: {
        title: 'Interactive Activities',
        interactive: [
          {
            type: 'drag-drop',
            title: 'Photosynthesis Components',
            instructions: 'Drag each component to its role in photosynthesis',
            items: [
              { id: 'sunlight', label: 'Sunlight', icon: '☀️', hint: 'Energy source' },
              { id: 'water', label: 'Water', icon: '💧', hint: 'H₂O molecules' },
              { id: 'co2', label: 'Carbon Dioxide', icon: '🌬️', hint: 'CO₂ from air' },
              { id: 'chlorophyll', label: 'Chlorophyll', icon: '🍃', hint: 'Green pigment' }
            ],
            targets: [
              { id: 'energy', label: 'Energy Input', icon: '⚡' },
              { id: 'raw-materials', label: 'Raw Materials', icon: '🧪' },
              { id: 'catalyst', label: 'Catalyst', icon: '🔬' }
            ],
            correctMatches: {
              'sunlight': 'energy',
              'water': 'raw-materials',
              'co2': 'raw-materials',
              'chlorophyll': 'catalyst'
            }
          },
          {
            type: 'slider',
            title: 'Plant Growth Simulator',
            instructions: 'Adjust environmental factors to optimize plant growth',
            sliders: [
              {
                id: 'light',
                label: 'Light Intensity',
                min: 0,
                max: 100,
                defaultValue: 50,
                unit: '%'
              },
              {
                id: 'water',
                label: 'Water Amount',
                min: 0,
                max: 100,
                defaultValue: 60,
                unit: 'ml'
              },
              {
                id: 'temperature',
                label: 'Temperature',
                min: 10,
                max: 40,
                defaultValue: 25,
                unit: '°C'
              }
            ],
            calculateResult: (values: any) => {
              const optimal = { light: 70, water: 65, temperature: 25 }
              const growth = Math.max(0, 100 - (
                Math.abs(values.light - optimal.light) +
                Math.abs(values.water - optimal.water) +
                Math.abs(values.temperature - optimal.temperature)
              ))
              return {
                growth: Math.round(growth),
                health: growth > 80 ? 'Excellent' : growth > 60 ? 'Good' : growth > 40 ? 'Fair' : 'Poor'
              }
            },
            renderResult: (result: any) => (
              `Plant Growth: ${result.growth}% - Health: ${result.health}`
            ),
            target: {
              description: 'Achieve 80%+ growth rate'
            },
            targetCheck: (result: any) => result.growth >= 80
          },
          {
            type: 'experiment',
            title: 'Light Color Experiment',
            instructions: 'Test how different light colors affect plant growth',
            variables: [
              {
                id: 'lightColor',
                label: 'Light Color',
                type: 'select',
                options: [
                  { value: 'red', label: 'Red Light' },
                  { value: 'blue', label: 'Blue Light' },
                  { value: 'green', label: 'Green Light' },
                  { value: 'white', label: 'White Light' }
                ],
                default: 'white'
              },
              {
                id: 'duration',
                label: 'Exposure Time (hours)',
                type: 'slider',
                min: 1,
                max: 24,
                default: 12
              }
            ],
            defaultVariables: { lightColor: 'white', duration: 12 },
            minTrials: 3,
            runSimulation: (variables: any) => {
              const effectiveness = {
                red: 0.8,
                blue: 0.9,
                green: 0.3,
                white: 0.7
              }
              const base = effectiveness[variables.lightColor as keyof typeof effectiveness] || 0.5
              const timeEffect = Math.min(1, variables.duration / 12)
              return {
                photosynthesisRate: Math.round(base * timeEffect * 100),
                leafHealth: base > 0.7 ? 'Healthy' : base > 0.5 ? 'Moderate' : 'Poor'
              }
            },
            analyzeResults: (results: any[]) => {
              const best = results.reduce((max, curr) => 
                curr.result.photosynthesisRate > max.result.photosynthesisRate ? curr : max
              )
              return `Best result: ${best.variables.lightColor} light with ${best.variables.duration}h exposure`
            }
          }
        ]
      }
    },
    {
      type: 'conversational',
      content: {
        title: 'Discussion & Reflection',
        conversation: {
          introduction: "Great work exploring photosynthesis! I'm here to help you reflect on what you've learned. What questions do you have about this amazing process?"
        },
        questions: [
          {
            id: 'understanding',
            question: 'In your own words, how would you explain photosynthesis to a friend?',
            category: 'understanding',
            difficulty: 'basic',
            followUp: [
              'What would happen if plants couldn\'t photosynthesize?',
              'Can you think of any other organisms that make their own food?'
            ]
          },
          {
            id: 'application',
            question: 'How do you think climate change might affect photosynthesis?',
            category: 'application',
            difficulty: 'intermediate',
            followUp: [
              'What role do forests play in fighting climate change?',
              'How might we help plants photosynthesize more effectively?'
            ]
          },
          {
            id: 'analysis',
            question: 'Why do you think plants evolved to be green rather than black (which would absorb more light)?',
            category: 'analysis',
            difficulty: 'advanced',
            followUp: [
              'What does this tell us about evolutionary trade-offs?',
              'How might this relate to other biological processes?'
            ]
          }
        ],
        discussionTopics: [
          {
            id: 'environmental',
            title: 'Environmental Impact',
            description: 'How does photosynthesis affect our environment and climate?',
            icon: '🌍'
          },
          {
            id: 'applications',
            title: 'Real-World Applications',
            description: 'How can we use our understanding of photosynthesis?',
            icon: '💡'
          },
          {
            id: 'future',
            title: 'Future Research',
            description: 'What questions about photosynthesis remain unanswered?',
            icon: '🔬'
          }
        ]
      }
    }
  ]
}

export const Phase2Demo: React.FC = () => {
  const [selectedSpeed, setSelectedSpeed] = useState(3)
  const [showInstructions, setShowInstructions] = useState(true)

  const handleSpeedChange = (newSpeed: number) => {
    setSelectedSpeed(newSpeed)
    console.log(`🚀 Speed changed to ${newSpeed}`)
  }

  const handleLessonComplete = (results: any) => {
    console.log('📊 Lesson completed with results:', results)
  }

  return (
    <div className="phase2-demo">
      {showInstructions && (
        <div className="demo-instructions">
          <div className="instructions-content">
            <h2>🎉 Phase 2 Demo: Speed-Adaptive Learning System</h2>
            <div className="speed-selector">
              <p>Choose your learning speed to see how the interface adapts:</p>
              <div className="speed-buttons">
                {[1, 2, 3, 4, 5].map(speed => (
                  <button
                    key={speed}
                    className={`speed-button ${selectedSpeed === speed ? 'active' : ''}`}
                    onClick={() => handleSpeedChange(speed)}
                  >
                    <div className="speed-emoji">
                      {speed === 1 ? '🐢' : 
                       speed === 2 ? '🐨' : 
                       speed === 3 ? '🦁' : 
                       speed === 4 ? '🐎' : '🚀'}
                    </div>
                    <div className="speed-name">
                      Speed {speed}
                    </div>
                    <div className="speed-description">
                      {speed === 1 ? 'Careful & Thorough' :
                       speed === 2 ? 'Visual & Structured' :
                       speed === 3 ? 'Balanced & Interactive' :
                       speed === 4 ? 'Quick & Conversational' :
                       'Advanced & Experimental'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="demo-features">
              <h3>What you&apos;ll experience:</h3>
              <ul>
                <li>🎨 <strong>Speed 1-2:</strong> Visual learning with infographics and animations</li>
                <li>🎯 <strong>Speed 3:</strong> Interactive activities like drag & drop, sliders</li>
                <li>💬 <strong>Speed 4-5:</strong> Conversational learning with AI chat and discussions</li>
                <li>📱 <strong>All Speeds:</strong> Adaptive layouts and content organization</li>
              </ul>
            </div>
            <button 
              className="start-demo-button"
              onClick={() => setShowInstructions(false)}
            >
              Start Demo
            </button>
          </div>
        </div>
      )}

      {!showInstructions && (
        <div className="demo-content">
          <div className="demo-header">
            <button 
              className="back-to-instructions"
              onClick={() => setShowInstructions(true)}
            >
              ← Back to Speed Selection
            </button>
            <div className="current-speed">
              Current Speed: {selectedSpeed} {
                selectedSpeed === 1 ? '🐢' : 
                selectedSpeed === 2 ? '🐨' : 
                selectedSpeed === 3 ? '🦁' : 
                selectedSpeed === 4 ? '🐎' : '🚀'
              }
            </div>
          </div>

          {/* Use the real AdaptiveLessonContainer with MasterContentRenderer */}
          <AdaptiveLessonContainer
            lessonId="phase2-demo"
            topicId="photosynthesis"
            onLessonComplete={handleLessonComplete}
          >
            <MasterContentRenderer
              lessonId="phase2-demo"
              topicId="photosynthesis"
              content={{
                ...DEMO_CONTENT,
                userSpeed: selectedSpeed
              }}
              onLessonComplete={handleLessonComplete}
              onSpeedChange={handleSpeedChange}
            />
          </AdaptiveLessonContainer>
        </div>
      )}


    </div>
  )
}

export default Phase2Demo 