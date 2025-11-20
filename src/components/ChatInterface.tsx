import { useState, useRef, useEffect } from 'react'
import { useConversationStore } from '../store/conversationStore'
import './ChatInterface.css'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isSpeaking, clearHistory } = useConversationStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const message = input.trim()
    setInput('')

    await sendMessage(message)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-title">
          <div className="avatar-icon">💕</div>
          <div>
            <h3>Aria</h3>
            <p className={isSpeaking ? 'status speaking' : 'status'}>
              {isSpeaking ? 'Speaking...' : 'Online'}
            </p>
          </div>
        </div>
        <button className="clear-btn" onClick={clearHistory} title="Clear conversation">
          🗑️
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>👋 Hi! I'm Aria</h2>
            <p>Your AI companion is here! I'm excited to chat with you.</p>
            <p>You can type a message or use voice to talk to me.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              {message.emotion && (
                <span className="emotion-badge">{getEmotionEmoji(message.emotion)}</span>
              )}
            </div>
            <span className="message-time">{formatTime(message.timestamp)}</span>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          disabled={isSpeaking}
        />
        <button type="submit" className="send-btn" disabled={!input.trim() || isSpeaking}>
          ➤
        </button>
      </form>
    </div>
  )
}

function getEmotionEmoji(emotion: string): string {
  const emojis: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    thoughtful: '🤔',
    loving: '🥰',
    neutral: '😌'
  }
  return emojis[emotion] || '😌'
}
