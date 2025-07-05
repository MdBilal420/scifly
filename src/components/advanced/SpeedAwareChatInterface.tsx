import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { sendMessage, clearChatHistory } from '../../features/chat/chatSlice'
import SimbaMascot from '../SimbaMascot'
import '../../styles/adaptiveComponents.css'

interface SpeedAwareChatInterfaceProps {
  userSpeed: number
  onInteraction: (type: string, data?: any) => void
}

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'simba'
  timestamp: number
  adaptationLevel: number
  quickReplies?: string[]
  mediaContent?: {
    type: 'image' | 'animation' | 'diagram'
    content: string
  }
}

const speedBasedPrompts = {
  1: [
    "What is your favorite animal? 🐾",
    "Tell me about the weather today ☀️",
    "What did you learn today? 📚"
  ],
  2: [
    "What science topic interests you most?",
    "How do plants grow?",
    "Why is the sky blue?"
  ],
  3: [
    "Explain how photosynthesis works",
    "What makes ecosystems balanced?",
    "How do different animals adapt to their environment?"
  ],
  4: [
    "Analyze the relationship between predators and prey",
    "Compare different renewable energy sources",
    "Discuss the impact of climate change on biodiversity"
  ],
  5: [
    "Evaluate the effectiveness of different conservation strategies",
    "Synthesize information about genetic adaptation in extreme environments",
    "Propose solutions for sustainable ecosystem management"
  ]
}

export const SpeedAwareChatInterface: React.FC<SpeedAwareChatInterfaceProps> = ({
  userSpeed,
  onInteraction
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  const { messages: chatMessages, isLoading } = useAppSelector(state => state.chat)
  const { currentUser } = useAppSelector(state => state.user)

  useEffect(() => {
    // Initialize with speed-appropriate welcome message
    const welcomeMessage = getWelcomeMessage(userSpeed)
    setMessages([welcomeMessage])
  }, [userSpeed])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const getWelcomeMessage = (speed: number): ChatMessage => {
    const welcomeTexts = {
      1: "Hi! I'm Simba! 🦁 Let's learn together! Ask me anything!",
      2: "Hello there! I'm Simba, your science buddy! What would you like to explore today?",
      3: "Greetings! I'm Simba, your AI learning companion. I'm here to help you discover amazing science concepts!",
      4: "Welcome! I'm Simba, your adaptive AI tutor. I can discuss complex scientific topics and help deepen your understanding.",
      5: "Hello! I'm Simba, your advanced AI research partner. Let's explore sophisticated scientific concepts and engage in analytical discussions."
    }

    return {
      id: 'welcome',
      text: welcomeTexts[speed as keyof typeof welcomeTexts] || welcomeTexts[3],
      sender: 'simba',
      timestamp: Date.now(),
      adaptationLevel: speed,
      quickReplies: speedBasedPrompts[speed as keyof typeof speedBasedPrompts]?.slice(0, 3)
    }
  }

  const adaptMessageToSpeed = (originalMessage: string, speed: number): string => {
    // This would integrate with AI service to adapt language complexity
    switch (speed) {
      case 1:
        return originalMessage
          .replace(/photosynthesis/gi, 'how plants make food')
          .replace(/ecosystem/gi, 'nature community')
          .replace(/biodiversity/gi, 'different animals and plants')
      case 2:
        return originalMessage
          .replace(/however/gi, 'but')
          .replace(/furthermore/gi, 'also')
      case 4:
      case 5:
        return originalMessage + ' Consider the underlying mechanisms and broader implications.'
      default:
        return originalMessage
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: Date.now(),
      adaptationLevel: userSpeed
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)
    setShowQuickReplies(false)

    // Track interaction
    onInteraction('message_sent', {
      messageLength: inputText.length,
      userSpeed,
      timestamp: Date.now()
    })

    try {
      // Dispatch to Redux for AI response
      const response = await dispatch(sendMessage({
        message: inputText,
        userId: currentUser.id,
        topicId: undefined
      })).unwrap()

      // Simulate typing delay based on speed
      const typingDelay = userSpeed <= 2 ? 2000 : userSpeed >= 4 ? 800 : 1500
      await new Promise(resolve => setTimeout(resolve, typingDelay))

      const adaptedResponse = adaptMessageToSpeed(response.simbaResponse.text, userSpeed)

      const simbaMessage: ChatMessage = {
        id: `simba_${Date.now()}`,
        text: adaptedResponse,
        sender: 'simba',
        timestamp: Date.now(),
        adaptationLevel: userSpeed,
        quickReplies: generateQuickReplies(adaptedResponse, userSpeed)
      }

      setMessages(prev => [...prev, simbaMessage])
      setShowQuickReplies(true)

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        text: userSpeed <= 2 ? 
          "Oops! I had trouble understanding. Can you try again? 😊" :
          "I encountered an issue processing your message. Please try rephrasing your question.",
        sender: 'simba',
        timestamp: Date.now(),
        adaptationLevel: userSpeed
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateQuickReplies = (message: string, speed: number): string[] => {
    // Generate contextual quick replies based on message content and speed
    const baseReplies = speedBasedPrompts[speed as keyof typeof speedBasedPrompts] || []
    
    if (message.includes('plant')) {
      return speed <= 2 ? 
        ['Tell me more! 🌱', 'What else?', 'Cool! 😊'] :
        ['How does this work?', 'What are the benefits?', 'Tell me more details']
    }
    
    return baseReplies.slice(0, speed <= 2 ? 2 : 3)
  }

  const handleQuickReply = (reply: string) => {
    setInputText(reply)
    onInteraction('quick_reply_used', {
      reply,
      userSpeed,
      timestamp: Date.now()
    })
  }

  const getSpeedBasedInterface = () => {
    if (userSpeed <= 2) {
      return (
        <div className="simple-chat-input">
          <div className="input-row">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="text-input-large"
              maxLength={100}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="send-button-large"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Send! 📤
            </motion.button>
          </div>
        </div>
      )
    } else if (userSpeed >= 4) {
      return (
        <div className="advanced-chat-input">
          <div className="input-container">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder="Compose your question or discussion topic... (Shift+Enter for new line)"
              className="text-area-advanced"
              rows={3}
              maxLength={500}
            />
            <div className="input-footer">
              <span className="character-count">{inputText.length}/500</span>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="send-button-advanced"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Send</span>
                <span className="send-icon">→</span>
              </motion.button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="balanced-chat-input">
          <div className="input-group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Simba a question..."
              className="text-input-standard"
              maxLength={200}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="send-button-standard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send
            </motion.button>
          </div>
        </div>
      )
    }
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user'
    
    return (
      <motion.div
        key={message.id}
        className={`message ${isUser ? 'user-message' : 'simba-message'} speed-${userSpeed}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isUser && (
          <div className="message-avatar">
            <SimbaMascot size="sm" animate={false} />
          </div>
        )}
        
        <div className="message-content">
          <div className="message-bubble">
            <p className="message-text">{message.text}</p>
            {userSpeed >= 3 && (
              <span className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
          
          {!isUser && message.quickReplies && showQuickReplies && (
            <div className="quick-replies">
              <AnimatePresence>
                {message.quickReplies.map((reply, index) => (
                  <motion.button
                    key={reply}
                    className="quick-reply-btn"
                    onClick={() => handleQuickReply(reply)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {reply}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`speed-aware-chat speed-${userSpeed}`}>
      <div className="chat-header">
        <div className="chat-title">
          <SimbaMascot size="md" animate={true} />
          <div className="title-text">
            <h3>Chat with Simba</h3>
            {userSpeed >= 3 && (
              <span className="speed-indicator">
                Learning Speed: {userSpeed} {userSpeed <= 2 ? '🐢' : userSpeed === 3 ? '🦁' : userSpeed === 4 ? '🐎' : '🚀'}
              </span>
            )}
          </div>
        </div>
        
        {userSpeed >= 3 && (
          <motion.button
            onClick={() => {
                             setMessages([getWelcomeMessage(userSpeed)])
               setShowQuickReplies(true)
               if (currentUser) {
                 dispatch(clearChatHistory({ userId: currentUser.id }))
               }
               onInteraction('chat_cleared', { userSpeed })
            }}
            className="clear-chat-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            🗑️ Clear
          </motion.button>
        )}
      </div>

      <div 
        ref={chatContainerRef}
        className="chat-messages"
      >
        <AnimatePresence>
          {messages.map(renderMessage)}
          
          {isTyping && (
            <motion.div
              className="typing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="message simba-message">
                <div className="message-avatar">
                  <SimbaMascot size="sm" animate={true} />
                </div>
                <div className="message-content">
                  <div className="typing-animation">
                    <motion.div
                      className="typing-dots"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span>●</span>
                      <span>●</span>
                      <span>●</span>
                    </motion.div>
                    <span className="typing-text">
                      {userSpeed <= 2 ? 'Simba is thinking...' : 'Simba is composing a response...'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="chat-input-area">
        {getSpeedBasedInterface()}
      </div>
    </div>
  )
}

export default SpeedAwareChatInterface 