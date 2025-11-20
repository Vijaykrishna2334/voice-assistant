import { useState } from 'react'
import { useConversationStore } from '../store/conversationStore'
import './ConfigPanel.css'

interface ConfigPanelProps {
  onConfigured: () => void
}

export default function ConfigPanel({ onConfigured }: ConfigPanelProps) {
  const [apiKey, setApiKey] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState('')
  const { initializeGemini } = useConversationStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key')
      return
    }

    try {
      // Initialize Gemini
      initializeGemini(apiKey)

      // Store API key
      localStorage.setItem('gemini_api_key', apiKey)

      // Store avatar URL if provided
      if (avatarUrl.trim()) {
        localStorage.setItem('avatar_url', avatarUrl)
      } else {
        // Use default avatar
        localStorage.setItem('avatar_url', 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb')
      }

      onConfigured()
    } catch (err) {
      setError('Failed to initialize. Please check your API key.')
    }
  }

  return (
    <div className="config-panel">
      <div className="config-container">
        <div className="config-header">
          <h1>🌟 Welcome to AI Companion</h1>
          <p>Meet Aria, your intelligent virtual companion</p>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key *</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="config-input"
            />
            <small className="help-text">
              Don't have a key?{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get one free from Google AI Studio
              </a>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="avatarUrl">Avatar URL (Optional)</label>
            <input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Ready Player Me avatar URL"
              className="config-input"
            />
            <small className="help-text">
              Create a custom avatar at{' '}
              <a
                href="https://readyplayer.me"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ready Player Me
              </a>{' '}
              (Leave empty for default avatar)
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="config-submit-btn">
            Start Chatting 💬
          </button>
        </form>

        <div className="features-list">
          <h3>Features:</h3>
          <ul>
            <li>✨ Fully animated 3D avatar</li>
            <li>🎤 Voice conversation support</li>
            <li>💭 Intelligent responses with emotion</li>
            <li>🎭 Dynamic gestures and expressions</li>
            <li>💕 Warm, caring personality</li>
            <li>🧠 Conversation memory</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
