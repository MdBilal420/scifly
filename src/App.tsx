import React, { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { loadCurrentUser, setupAuthListener } from './features/user/userSlice'
import { useClarity, clarityEvents } from './hooks/useClarity'
import HomeScreen from './pages/HomeScreen'
import TopicSelectionScreen from './pages/TopicSelectionScreen'
import LessonScreen from './pages/LessonScreen'
import QuizScreen from './pages/QuizScreen'
import ChatScreen from './pages/ChatScreen'
import AchievementsScreen from './pages/AchievementsScreen'
import ActivitySelectionScreen from './pages/ActivitySelectionScreen'
import FlashcardScreen from './pages/FlashcardScreen'
import SimulationScreen from './pages/SimulationScreen'
import StorybookScreen from './pages/StorybookScreen'
import LandingPage from './pages/LandingPage'
import UserOnboardingDialog from './components/UserOnboardingDialog'
import PlayGameScreen from './pages/PlayGameScreen'

type Screen = 'home' | 'topics' | 'lesson' | 'quiz' | 'chat' | 'achievements' | 'activity' | 'flashcards' | 'simulation' | 'storybook' | 'playgame'

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('topics')
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, currentUser } = useAppSelector((state) => state.user)
  const { trackEvent, setUserId, setUserProperties } = useClarity()

  // Load user data and setup auth listener on app initialization
  useEffect(() => {
    
    // Try to load current user on app start
    dispatch(loadCurrentUser())
    
    // Setup auth state listener - call the thunk action directly
    const authListenerThunk = setupAuthListener()
    const unsubscribe = authListenerThunk(dispatch)

    return () => {
      // Cleanup auth listener if it returns an unsubscribe function
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [dispatch])

  // Reset screen to topics when user logs out
  useEffect(() => {
    console.log('App: Auth state changed - isAuthenticated:', isAuthenticated, 'currentUser:', !!currentUser)
    if (!isAuthenticated && !currentUser) {
      console.log('App: User logged out, resetting screen to topics')
      setCurrentScreen('topics')
    }
  }, [isAuthenticated, currentUser])

  // Track user authentication events with Clarity
  useEffect(() => {
    if (currentUser) {
      // Set user ID for Clarity tracking
      setUserId(currentUser.id)
      
      // Set user properties
      setUserProperties({
        name: currentUser.name,
        learningSpeed: currentUser.learningSpeed,
        joinedAt: currentUser.joinedAt,
        avatar: currentUser.avatar
      })
      
      // Track sign in event
      trackEvent(clarityEvents.USER_SIGNED_IN, {
        userId: currentUser.id,
        learningSpeed: currentUser.learningSpeed
      })
    }
  }, [currentUser, setUserId, setUserProperties, trackEvent])

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'topics':
        return <TopicSelectionScreen onNavigate={handleNavigate} />
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />
      case 'activity':
        return <ActivitySelectionScreen onNavigate={handleNavigate} />
      case 'lesson':
        return <LessonScreen onNavigate={handleNavigate} />
      case 'quiz':
        return <QuizScreen onNavigate={handleNavigate} />
      case 'flashcards':
        return <FlashcardScreen onNavigate={handleNavigate} />
      case 'chat':
        return <ChatScreen onNavigate={handleNavigate} />
      case 'achievements':
        return <AchievementsScreen onNavigate={handleNavigate} />
      case 'simulation':
        return <SimulationScreen onNavigate={handleNavigate} />
     case 'storybook':
       return <StorybookScreen onNavigate={handleNavigate} />
      case 'playgame':
        return <PlayGameScreen onNavigate={handleNavigate} />
      default:
        return <TopicSelectionScreen onNavigate={handleNavigate} />
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen space-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <div className="text-white text-xl font-comic">Loading SciFly...</div>
        </div>
      </div>
    )
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage />
  }

  // Show main app if authenticated
  return (
    <div className="App">
      {renderScreen()}
      <UserOnboardingDialog />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App 