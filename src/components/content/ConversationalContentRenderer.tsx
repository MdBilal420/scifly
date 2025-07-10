import React, { useState, useEffect, useRef } from 'react'
import { getModesForSpeed } from '../../config/learningModes'

interface ConversationalContentProps {
  content: any
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

interface QuestionPrompt {
  id: string
  question: string
  category: 'understanding' | 'application' | 'analysis' | 'synthesis'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  followUp?: string[]
}

// Main conversational content renderer
export const ConversationalContentRenderer: React.FC<ConversationalContentProps> = ({
  content,
  userSpeed,
  onInteraction
}) => {
  const speedConfig = getModesForSpeed(userSpeed)
  const [activeTab, setActiveTab] = useState<'chat' | 'questions' | 'discussion'>('chat')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Initialize with AI introduction
  useEffect(() => {
    if (content?.conversation?.introduction) {
      const introMessage: ChatMessage = {
        id: 'intro',
        type: 'ai',
        content: content.conversation.introduction,
        timestamp: new Date(),
        metadata: { isIntroduction: true }
      }
      setChatMessages([introMessage])
    }
  }, [content])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsTyping(true)

    onInteraction?.('chat_message_sent', { message, userSpeed })

    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(message, content, userSpeed)
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        metadata: { responseToUser: userMessage.id }
      }
      setChatMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay for realism
  }

  const getInterfaceStyle = () => {
    switch (userSpeed) {
      case 4: return 'reading-focused'
      case 5: return 'advanced-conversational'
      default: return 'standard'
    }
  }

  return (
    <div className={`conversational-content-renderer speed-${userSpeed} ${getInterfaceStyle()}`}>
      <div className="conversation-header">
        <h3>{content?.title || 'Interactive Learning'}</h3>
        <div className="conversation-tabs">
          <button 
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            ❓ Questions
          </button>
          <button 
            className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            🗣️ Discussion
          </button>
        </div>
      </div>

      <div className="conversation-content">
        {activeTab === 'chat' && (
          <ChatInterface
            messages={chatMessages}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            userSpeed={userSpeed}
            chatEndRef={chatEndRef}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionInterface
            questions={content?.questions || []}
            userSpeed={userSpeed}
            onInteraction={onInteraction}
          />
        )}

        {activeTab === 'discussion' && (
          <DiscussionInterface
            topics={content?.discussionTopics || []}
            userSpeed={userSpeed}
            onInteraction={onInteraction}
          />
        )}
      </div>
    </div>
  )
}

// Chat interface component
export const ChatInterface: React.FC<{
  messages: ChatMessage[]
  currentInput: string
  setCurrentInput: (input: string) => void
  onSendMessage: (message: string) => void
  isTyping: boolean
  userSpeed: number
  chatEndRef: React.RefObject<HTMLDivElement>
}> = ({ messages, currentInput, setCurrentInput, onSendMessage, isTyping, userSpeed, chatEndRef }) => {
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Can you explain this further?",
    "What's an example?",
    "How does this relate to...?",
    "What would happen if...?"
  ])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage(currentInput)
    }
  }

  const handleQuickReply = (reply: string) => {
    onSendMessage(reply)
  }

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`message ${message.type} ${message.metadata?.isIntroduction ? 'introduction' : ''}`}
          >
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message ai typing">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {userSpeed >= 4 && quickReplies.length > 0 && (
        <div className="quick-replies">
          <span className="quick-replies-label">Quick replies:</span>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-button"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input">
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Press Enter to send)"
          rows={userSpeed === 5 ? 3 : 2}
          disabled={isTyping}
        />
        <button
          onClick={() => onSendMessage(currentInput)}
          disabled={!currentInput.trim() || isTyping}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  )
}

// Question interface component
export const QuestionInterface: React.FC<{
  questions: QuestionPrompt[]
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}> = ({ questions, userSpeed, onInteraction }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    onInteraction?.('question_answered', { questionId, answer, userSpeed })
  }

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const getQuestionsByDifficulty = () => {
    const difficultyOrder = userSpeed <= 3 ? ['basic', 'intermediate'] : 
                           userSpeed === 4 ? ['basic', 'intermediate', 'advanced'] :
                           ['intermediate', 'advanced']
    
    return questions.filter(q => difficultyOrder.includes(q.difficulty))
  }

  const filteredQuestions = getQuestionsByDifficulty()

  return (
    <div className="question-interface">
      <div className="question-header">
        <h4>Explore These Questions</h4>
        <div className="question-progress">
          {Object.keys(answers).length} / {filteredQuestions.length} answered
        </div>
      </div>

      <div className="questions-list">
        {filteredQuestions.map((question, index) => (
          <div 
            key={question.id}
            className={`question-card ${expandedQuestions.includes(question.id) ? 'expanded' : ''}`}
          >
            <div 
              className="question-header"
              onClick={() => toggleQuestionExpansion(question.id)}
            >
              <h5 className="question-text">{question.question}</h5>
              <div className="question-meta">
                <span className={`difficulty ${question.difficulty}`}>
                  {question.difficulty}
                </span>
                <span className={`category ${question.category}`}>
                  {question.category}
                </span>
              </div>
            </div>

            {expandedQuestions.includes(question.id) && (
              <div className="question-content">
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={userSpeed === 5 ? 4 : 3}
                />
                
                {question.followUp && question.followUp.length > 0 && (
                  <div className="follow-up-questions">
                    <h6>Follow-up questions:</h6>
                    {question.followUp.map((followUp, fIndex) => (
                      <div key={fIndex} className="follow-up-question">
                        {followUp}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Discussion interface component
export const DiscussionInterface: React.FC<{
  topics: any[]
  userSpeed: number
  onInteraction?: (type: string, data?: any) => void
}> = ({ topics, userSpeed, onInteraction }) => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [discussions, setDiscussions] = useState<Record<string, any[]>>({})
  const [newPost, setNewPost] = useState('')

  const handleTopicSelect = (topicId: string) => {
    setActiveTopic(topicId)
    onInteraction?.('discussion_topic_selected', { topicId, userSpeed })
  }

  const handlePostSubmit = (topicId: string) => {
    if (!newPost.trim()) return

    const post = {
      id: `post-${Date.now()}`,
      content: newPost,
      author: 'You',
      timestamp: new Date(),
      likes: 0,
      replies: []
    }

    setDiscussions(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), post]
    }))
    
    setNewPost('')
    onInteraction?.('discussion_post_created', { topicId, post, userSpeed })
  }

  const selectedTopic = topics.find(t => t.id === activeTopic)

  return (
    <div className="discussion-interface">
      {!activeTopic ? (
        <div className="topic-selection">
          <h4>Choose a Discussion Topic</h4>
          <div className="topics-grid">
            {topics.map((topic) => (
              <div 
                key={topic.id}
                className="topic-card"
                onClick={() => handleTopicSelect(topic.id)}
              >
                <div className="topic-icon">{topic.icon}</div>
                <h5 className="topic-title">{topic.title}</h5>
                <p className="topic-description">{topic.description}</p>
                <div className="topic-meta">
                  <span className="post-count">
                    {discussions[topic.id]?.length || 0} posts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="topic-discussion">
          <div className="discussion-header">
            <button 
              className="back-button"
              onClick={() => setActiveTopic(null)}
            >
              ← Back to Topics
            </button>
            <h4>{selectedTopic?.title}</h4>
          </div>

          <div className="discussion-posts">
            {discussions[activeTopic]?.map((post) => (
              <div key={post.id} className="discussion-post">
                <div className="post-header">
                  <span className="post-author">{post.author}</span>
                  <span className="post-timestamp">
                    {post.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-actions">
                  <button className="like-button">
                    👍 {post.likes}
                  </button>
                  <button className="reply-button">
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="new-post">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts on this topic..."
              rows={userSpeed === 5 ? 4 : 3}
            />
            <button 
              onClick={() => handlePostSubmit(activeTopic)}
              disabled={!newPost.trim()}
              className="post-button"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// AI response generation (simplified - in real app would use actual AI)
const generateAIResponse = (userMessage: string, content: any, userSpeed: number): string => {
  const responses = {
    greeting: [
      "Hello! I'm here to help you learn. What would you like to explore?",
      "Hi there! Ready to dive deeper into this topic?",
      "Great to meet you! What questions can I help answer?"
    ],
    explanation: [
      "Let me break that down for you...",
      "That's a great question! Here's how I'd explain it...",
      "I can help clarify that concept..."
    ],
    encouragement: [
      "You're asking excellent questions!",
      "That's really good thinking!",
      "I can see you're engaging deeply with this material!"
    ],
    advanced: [
      "Let's explore the deeper implications...",
      "That connects to several advanced concepts...",
      "From a higher-level perspective..."
    ]
  }

  // Simple keyword matching for demo purposes
  const message = userMessage.toLowerCase()
  
  if (message.includes('hello') || message.includes('hi')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
  }
  
  if (message.includes('explain') || message.includes('what') || message.includes('how')) {
    const base = responses.explanation[Math.floor(Math.random() * responses.explanation.length)]
    return userSpeed >= 5 ? base + " " + responses.advanced[0] : base
  }
  
  if (message.includes('why') || message.includes('because')) {
    return responses.encouragement[Math.floor(Math.random() * responses.encouragement.length)]
  }
  
  // Default response
  return userSpeed >= 5 
    ? "That's a sophisticated question. Let me provide a comprehensive answer..."
    : "I understand what you're asking. Let me help explain..."
}

export default ConversationalContentRenderer 