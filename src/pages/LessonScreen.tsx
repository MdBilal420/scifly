import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateTopicProgress } from '../features/progress/progressSlice'
import { generateLessonContent, clearErrors } from '../features/topics/topicsSlice'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import ProgressBar from '../components/ProgressBar'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import AdaptiveLessonContainer from '../components/AdaptiveLessonContainer'
import MasterContentRenderer from '../components/content/MasterContentRenderer'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
// Import adaptive styles to ensure they're loaded
import '../styles/adaptiveComponents.css'

interface LessonScreenProps {
  onNavigate: (screen: string) => void
}

const LessonScreen: React.FC<LessonScreenProps> = ({ onNavigate }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const dispatch = useAppDispatch()
  
  const { currentTopic, lessonContent: reduxLessonContent, isGeneratingContent, contentError } = useAppSelector((state) => state.topics)
  const { currentUser } = useAppSelector((state) => state.user)

  // Mock lesson content for testing progress bar
  const mockLessonContent = [
    { title: 'Introduction to the Solar System', content: 'Let\'s explore the amazing world of space and planets!', tip: 'Remember, there are 8 planets in our solar system!', image: '🌟' },
    { title: 'The Sun - Our Star', content: 'The Sun is the center of our solar system and gives us light and heat.', tip: 'The Sun is about 100 times bigger than Earth!', image: '☀️' },
    { title: 'Inner Planets', content: 'Mercury, Venus, Earth, and Mars are the inner planets closest to the Sun.', tip: 'Earth is the only planet we know that has life!', image: '🌍' },
    { title: 'Outer Planets', content: 'Jupiter, Saturn, Uranus, and Neptune are the outer planets, far from the Sun.', tip: 'Jupiter is the biggest planet in our solar system!', image: '🪐' }
  ]

  // Use mock content if Redux content is empty (for testing)
  const lessonContent = reduxLessonContent.length > 0 ? reduxLessonContent : mockLessonContent

  useEffect(() => {
    if (currentTopic && lessonContent.length === 0 && !isGeneratingContent && !contentError) {
      dispatch(generateLessonContent(currentTopic))
    }
  }, [currentTopic?.id, isGeneratingContent, contentError, dispatch]) // More specific dependencies

  // Show loading or redirect if no topic selected
  if (!currentTopic) {
    onNavigate('topics')
    return null
  }

  // Show loading state while generating content
  if (isGeneratingContent || !lessonContent || lessonContent.length === 0) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <SimbaMascot size="lg" animate={true} />
            <motion.div
              className="mt-4 text-white text-xl font-comic"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparing your {currentTopic.title} lesson... 🦁
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  // Show error state if content generation failed
  if (contentError) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-6 max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">I couldn't generate the lesson content. Let's try again!</p>
            <PrimaryButton
              onClick={() => {
                // Clear error first, then retry
                dispatch(clearErrors())
                dispatch(generateLessonContent(currentTopic))
              }}
              className="w-full mb-2"
            >
              Try Again
            </PrimaryButton>
            <button
              onClick={() => onNavigate('topics')}
              className="text-gray-500 text-sm underline"
            >
              Choose Different Topic
            </button>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  const currentContent = lessonContent[currentSection]

  // Safety check - if no current content, show loading
  if (!currentContent) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <SimbaMascot size="lg" animate={true} />
            <motion.div
              className="mt-4 text-white text-xl font-comic"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading lesson content... 🦁
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    )
  }

  const handleNext = () => {
    if (!currentUser || !lessonContent) return

    if (currentSection < lessonContent.length - 1) {
      setCurrentSection(currentSection + 1)
      // Track progress at topic level (sections within a topic)
      dispatch(updateTopicProgress({ 
        userId: currentUser.id, 
        topicId: currentTopic.id, 
        progressData: { 
          progress_percentage: currentProgress 
        } 
      }))
    } else {
      // Complete the entire topic
      dispatch(updateTopicProgress({ 
        userId: currentUser.id, 
        topicId: currentTopic.id, 
        progressData: { 
          progress_percentage: 100,
          completed: true 
        } 
      }))
      onNavigate('home')
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    } else {
      onNavigate('home')
    }
  }

  // Get user speed to determine layout
  const userSpeed = currentUser?.learningSpeed || 3

  // Calculate progress based on current section
  const currentProgress = lessonContent.length > 0 ? ((currentSection + 1) / lessonContent.length) * 100 : 0

  // Topic-based background styles
  const getTopicBackground = (theme: string) => {
    const backgroundStyles = {
      space: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
      forest: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
      ocean: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0891b2 100%)',
      weather: 'linear-gradient(135deg, #374151 0%, #2563eb 50%, #06b6d4 100%)',
      laboratory: 'linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #2563eb 100%)',
      'human-body': 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)',
      earth: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #f59e0b 100%)'
    }
    return backgroundStyles[theme as keyof typeof backgroundStyles] || backgroundStyles.space
  }

  // Force Speed 1 layout for testing - render directly with ENERGY!
  if (userSpeed === 1) {
    return (
      <div className="speed-1-layout simplified-visual" style={{
        background: getTopicBackground(currentTopic.backgroundTheme),
        height: '100vh',
        padding: '0.5rem',
        fontSize: '1rem',
        lineHeight: '1.4',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ANIMATED BACKGROUND ELEMENTS */}
        {currentTopic.backgroundTheme === 'space' && (
          <>
            {/* Floating Stars */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  background: '#fff',
                  borderRadius: '50%',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
            {/* Floating Planets */}
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              fontSize: '3rem',
              animation: 'float 6s ease-in-out infinite',
              opacity: 0.3
            }}>🪐</div>
            <div style={{
              position: 'absolute',
              bottom: '15%',
              left: '5%',
              fontSize: '2rem',
              animation: 'float 8s ease-in-out infinite reverse',
              opacity: 0.4
            }}>🌍</div>
            <div style={{
              position: 'absolute',
              top: '60%',
              right: '20%',
              fontSize: '1.5rem',
              animation: 'float 5s ease-in-out infinite',
              opacity: 0.3
            }}>🌙</div>
          </>
        )}
        
        {currentTopic.backgroundTheme === 'forest' && (
          <>
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '8%',
              fontSize: '2.5rem',
              animation: 'float 4s ease-in-out infinite',
              opacity: 0.3
            }}>🌳</div>
            <div style={{
              position: 'absolute',
              top: '70%',
              right: '12%',
              fontSize: '2rem',
              animation: 'float 6s ease-in-out infinite reverse',
              opacity: 0.4
            }}>🍃</div>
            <div style={{
              position: 'absolute',
              bottom: '30%',
              left: '15%',
              fontSize: '1.5rem',
              animation: 'bounce 3s infinite',
              opacity: 0.3
            }}>🦋</div>
            <div style={{
              position: 'absolute',
              top: '40%',
              right: '25%',
              fontSize: '1.8rem',
              animation: 'float 5s ease-in-out infinite',
              opacity: 0.35
            }}>🌺</div>
          </>
        )}
        
        {currentTopic.backgroundTheme === 'ocean' && (
          <>
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              fontSize: '2rem',
              animation: 'float 7s ease-in-out infinite',
              opacity: 0.3
            }}>🌊</div>
            <div style={{
              position: 'absolute',
              bottom: '25%',
              right: '15%',
              fontSize: '1.5rem',
              animation: 'float 4s ease-in-out infinite reverse',
              opacity: 0.4
            }}>🐠</div>
            <div style={{
              position: 'absolute',
              top: '60%',
              left: '20%',
              fontSize: '1.8rem',
              animation: 'bounce 5s infinite',
              opacity: 0.35
            }}>🐚</div>
          </>
        )}
        
        {currentTopic.backgroundTheme === 'laboratory' && (
          <>
            <div style={{
              position: 'absolute',
              top: '12%',
              right: '8%',
              fontSize: '2rem',
              animation: 'bounce 3s infinite',
              opacity: 0.3
            }}>⚗️</div>
            <div style={{
              position: 'absolute',
              bottom: '20%',
              left: '10%',
              fontSize: '1.5rem',
              animation: 'float 6s ease-in-out infinite',
              opacity: 0.4
            }}>🔬</div>
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '25%',
              fontSize: '1.8rem',
              animation: 'pulse 4s infinite',
              opacity: 0.35
            }}>🧪</div>
          </>
        )}
        
        {currentTopic.backgroundTheme === 'human-body' && (
          <>
            <div style={{
              position: 'absolute',
              top: '18%',
              left: '12%',
              fontSize: '2rem',
              animation: 'pulse 2s infinite',
              opacity: 0.3
            }}>❤️</div>
            <div style={{
              position: 'absolute',
              bottom: '22%',
              right: '18%',
              fontSize: '1.5rem',
              animation: 'float 5s ease-in-out infinite',
              opacity: 0.4
            }}>🦴</div>
            <div style={{
              position: 'absolute',
              top: '55%',
              left: '25%',
              fontSize: '1.8rem',
              animation: 'bounce 4s infinite',
              opacity: 0.35
            }}>🧠</div>
          </>
        )}
        
        {currentTopic.backgroundTheme === 'earth' && (
          <>
            <div style={{
              position: 'absolute',
              top: '15%',
              right: '12%',
              fontSize: '2.5rem',
              animation: 'float 6s ease-in-out infinite',
              opacity: 0.3
            }}>🏔️</div>
            <div style={{
              position: 'absolute',
              bottom: '28%',
              left: '8%',
              fontSize: '1.8rem',
              animation: 'bounce 4s infinite',
              opacity: 0.4
            }}>🌋</div>
            <div style={{
              position: 'absolute',
              top: '45%',
              right: '30%',
              fontSize: '1.5rem',
              animation: 'float 5s ease-in-out infinite reverse',
              opacity: 0.35
            }}>⛰️</div>
          </>
        )}
        
        {currentTopic.backgroundTheme === 'weather' && (
          <>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              fontSize: '2rem',
              animation: 'float 4s ease-in-out infinite',
              opacity: 0.3
            }}>☁️</div>
            <div style={{
              position: 'absolute',
              bottom: '30%',
              right: '20%',
              fontSize: '1.5rem',
              animation: 'bounce 3s infinite',
              opacity: 0.4
            }}>🌧️</div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              fontSize: '2.5rem',
              animation: 'pulse 5s infinite',
              opacity: 0.35
            }}>⛈️</div>
          </>
        )}
        
        {/* CSS Animation Keyframes */}
        <style>{`
          @keyframes twinkle {
            0% { opacity: 0.2; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.5); }
            50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.8), 0 0 40px rgba(76, 175, 80, 0.3); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>

        <div className="main-content-column" style={{
          maxWidth: '700px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          zIndex: 10,
          justifyContent: 'space-between'
        }}>
          <div className="header-section" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '0.5rem',
            flexShrink: 0
          }}>
            <button 
              onClick={() => onNavigate('/home')}
              type="button"
              style={{
                padding: '0.5rem',
                fontSize: '1.2rem',
                border: 'none',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                minWidth: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              ← 
            </button>
                          <div className="progress-indicator-top" style={{ flex: 1 }}>
                <div className="simple-progress-bar" style={{
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #4CAF50, #8BC34A, #CDDC39)',
                    width: `${currentProgress}%`,
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                    animation: 'glow 2s infinite'
                  }} />
                </div>
                <div style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '0.9rem',
                  marginTop: '0.25rem',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                }}>
                  📚 {currentSection + 1} of {lessonContent.length} 
                </div>
              </div>
          </div>
          
          <div className="content-focus-area" style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 0
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  maxWidth: '450px',
                  margin: '0 auto',
                  textAlign: 'center',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'pulse 4s ease-in-out infinite'
                }}>
                  {/* Animated Border Glow */}
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    right: '-2px',
                    bottom: '-2px',
                    background: 'linear-gradient(45deg, #4CAF50, #8BC34A, #CDDC39, #FFC107, #FF9800, #4CAF50)',
                    borderRadius: '20px',
                    zIndex: -1,
                    animation: 'rotate 6s linear infinite',
                    opacity: 0.3
                  }} />
                  
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    borderRadius: '50%',
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 4px 10px rgba(255, 255, 255, 0.5)',
                    border: '3px solid rgba(255, 255, 255, 0.5)',
                    animation: 'float 3s ease-in-out infinite',
                    position: 'relative'
                  }}>
                    <span style={{ 
                      fontSize: '2.2rem', 
                      lineHeight: '1',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                    }}>
                      {currentContent?.image || '🔬'}
                    </span>
                    {/* Sparkle effects */}
                    <div style={{
                      position: 'absolute',
                      top: '10%',
                      right: '10%',
                      fontSize: '0.8rem',
                      animation: 'twinkle 1.5s infinite alternate'
                    }}>✨</div>
                    <div style={{
                      position: 'absolute',
                      bottom: '15%',
                      left: '15%',
                      fontSize: '0.7rem',
                      animation: 'twinkle 2s infinite alternate reverse'
                    }}>⭐</div>
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #2c3e50, #3498db, #9b59b6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem',
                    fontFamily: '"Comic Sans MS", cursive',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}>
                    {currentContent?.title || 'Learning Time'}
                  </h3>
                  
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.4',
                    color: '#34495e',
                    marginBottom: '0.75rem',
                    fontWeight: '500',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    animation: 'fadeIn 1s ease-in'
                  }}>
                    {currentContent?.content || 'Loading content...'}
                  </p>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(139, 195, 74, 0.15))',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '2px solid rgba(76, 175, 80, 0.6)',
                    maxWidth: '300px',
                    margin: '0 auto',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)',
                    position: 'relative',
                    animation: 'glow 3s ease-in-out infinite'
                  }}>
                    <span style={{ 
                      fontSize: '1.2rem', 
                      flexShrink: 0,
                      animation: 'pulse 2s infinite'
                    }}>💡</span>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#1b5e20',
                      fontWeight: '600',
                      textAlign: 'left',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                      {currentContent?.tip || 'You\'re doing great! Keep learning!'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="navigation-bottom" style={{ 
            textAlign: 'center',
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <button 
              onClick={handlePrevious}
              type="button"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '12px',
                background: currentSection === 0 
                  ? 'rgba(108, 117, 125, 0.5)' 
                  : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white',
                cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                margin: '0.25rem',
                fontWeight: 'bold',
                boxShadow: currentSection === 0 
                  ? 'none' 
                  : '0 4px 15px rgba(255, 107, 107, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={currentSection === 0}
              onMouseEnter={(e) => {
                if (currentSection !== 0) {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentSection !== 0) {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)'
                }
              }}
            >
              <span>Previous</span>
            </button>
            
            <button 
              onClick={handleNext}
              type="button"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '12px',
                background: currentSection === lessonContent.length - 1 
                  ? 'linear-gradient(45deg, #FFD700, #FF8C00, #FF6347)'
                  : 'linear-gradient(45deg, #4CAF50, #8BC34A, #CDDC39)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                margin: '0.25rem',
                fontWeight: 'bold',
                boxShadow: currentSection === lessonContent.length - 1 
                  ? '0 4px 15px rgba(255, 215, 0, 0.5)' 
                  : '0 4px 15px rgba(76, 175, 80, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                animation: currentSection === lessonContent.length - 1 ? 'pulse 2s infinite' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                e.currentTarget.style.boxShadow = currentSection === lessonContent.length - 1 
                  ? '0 6px 20px rgba(255, 215, 0, 0.7)' 
                  : '0 6px 20px rgba(76, 175, 80, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)'
                e.currentTarget.style.boxShadow = currentSection === lessonContent.length - 1 
                  ? '0 4px 15px rgba(255, 215, 0, 0.5)' 
                  : '0 4px 15px rgba(76, 175, 80, 0.4)'
              }}
            >
              {currentSection === lessonContent.length - 1 ? '🎉 Complete! ' : 
                 <span>Next</span> 
              }
            </button>
            
            {/* Floating celebration emojis for completion */}
            {currentSection === lessonContent.length - 1 && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '20%',
                  fontSize: '1.2rem',
                  animation: 'float 3s ease-in-out infinite',
                  opacity: 0.8
                }}>🎊</div>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20%',
                  fontSize: '1rem',
                  animation: 'float 2.5s ease-in-out infinite reverse',
                  opacity: 0.7
                }}>✨</div>
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '30%',
                  fontSize: '0.9rem',
                  animation: 'bounce 2s infinite',
                  opacity: 0.6
                }}>🌟</div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For other speeds, use the complex adaptive system
  return (
    <div className="lesson-screen-wrapper">
      {/* Main Content - Using Adaptive System */}
      <AdaptiveLessonContainer 
        topicId={currentTopic.id}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <MasterContentRenderer 
              topicId={currentTopic.id}
              content={{
                title: currentContent?.title || 'Loading...',
                description: currentContent?.content || 'Loading content...',
                tip: currentContent?.tip || 'Keep exploring and learning!',
                image: currentContent?.image || '🔬',
                sections: [
                  {
                    type: 'visual',
                    content: {
                      type: 'concept-animation',
                      title: currentContent?.title || 'Concept',
                      description: currentContent?.content || 'Loading content...',
                      animation: 'photosynthesis',
                      controls: ['play', 'pause', 'reset'],
                      frames: [
                        {
                          id: 'step1',
                          title: 'Step 1',
                          description: 'Understanding the basics',
                          visual: currentContent?.image || '🔬'
                        }
                      ]
                    }
                  }
                ]
              }}
              onLessonComplete={(results) => {
                console.log('Lesson completed:', results)
                handleNext()
              }}
              onSpeedChange={(newSpeed) => {
                console.log('Speed changed to:', newSpeed)
              }}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </motion.div>
        </AnimatePresence>
      </AdaptiveLessonContainer>
    </div>
  )
}

export default LessonScreen 