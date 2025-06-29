import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import HomeScreen from './pages/HomeScreen'
import LessonScreen from './pages/LessonScreen'
import QuizScreen from './pages/QuizScreen'
import ChatScreen from './pages/ChatScreen'
import AchievementsScreen from './pages/AchievementsScreen'

type Screen = 'home' | 'lesson' | 'quiz' | 'chat' | 'achievements'

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />
      case 'lesson':
        return <LessonScreen onNavigate={handleNavigate} />
      case 'quiz':
        return <QuizScreen onNavigate={handleNavigate} />
      case 'chat':
        return <ChatScreen onNavigate={handleNavigate} />
      case 'achievements':
        return <AchievementsScreen onNavigate={handleNavigate} />
      default:
        return <HomeScreen onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="App">
      {renderScreen()}
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