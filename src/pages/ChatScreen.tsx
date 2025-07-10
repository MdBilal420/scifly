import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { addUserMessage, sendMessage } from '../features/chat/chatSlice'
import { updateAchievementProgress } from '../features/achievements/achievementSlice'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import SpaceDecorations from '../components/SpaceDecorations'
import UserMenu from '../components/UserMenu'

interface ChatScreenProps {
  onNavigate: (screen: string) => void
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch()
  const { messages, isTyping, suggestedQuestions, isLoading } = useAppSelector((state) => state.chat)
  const { currentUser } = useAppSelector((state) => state.user)
  const { currentTopic } = useAppSelector((state) => state.topics)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = (message?: string) => {
    const textToSend = message || inputText.trim()
    if (!textToSend || !currentUser) return

    dispatch(addUserMessage(textToSend))
    dispatch(sendMessage({ 
      userId: currentUser.id, 
      message: textToSend, 
      topicId: currentTopic?.id 
    }))
    dispatch(updateAchievementProgress({ 
      userId: currentUser.id, 
      achievementKey: 'curious_mind', 
      progress: 1 
    }))
    
    setInputText('')
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen space-background flex flex-col relative">
      <SpaceDecorations />
      {/* Header */}
      <motion.header
        className="flex items-center justify-between p-4 bg-white/20 backdrop-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            className="bg-white/20 backdrop-blur rounded-full p-2"
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white text-xl">←</span>
          </motion.button>
          
          <div className="flex items-center gap-3">
            <SimbaMascot size="sm" animate={true} />
            <div>
              <h1 className="font-comic text-xl font-bold text-white">SciFly Chat with Simba 🚀</h1>
              <p className="text-white/80 text-sm">
                {isTyping ? 'Simba is typing...' : 'Ask me anything about science!'}
              </p>
            </div>
          </div>
        </div>
        
        {/* User Menu */}
        <UserMenu />
      </motion.header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-primary-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-md'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-md px-4 py-3">
              <div className="flex space-x-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {!isLoading && messages.length <= 3 && (
        <motion.div
          className="p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/80 text-sm mb-3 text-center">Try asking about:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <motion.button
                key={index}
                className="bg-white/20 backdrop-blur text-white text-xs px-3 py-2 rounded-full border border-white/30"
                onClick={() => handleSuggestedQuestion(question)}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Section */}
      <motion.div
        className="p-4 bg-white/20 backdrop-blur"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Simba about science..."
            disabled={isLoading}
            className="flex-1 bg-white/90 backdrop-blur rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-500 border-none outline-none focus:ring-2 focus:ring-white/50"
          />
          
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-primary-500 text-white rounded-2xl px-6 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            <span className="text-lg">📤</span>
          </motion.button>
        </div>

        {/* Voice Input Button (Mock) */}
        <div className="flex justify-center mt-3">
          <motion.button
            className="bg-white/20 backdrop-blur rounded-full p-3 border border-white/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white text-xl">🎤</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatScreen 