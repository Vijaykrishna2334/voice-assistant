import { useState } from 'react'
import { useConversationStore } from '../store/conversationStore'
import './ConfigPanel.css'

interface ConfigPanelProps {
  onConfigured: () => void
}

export default function ConfigPanel({ onConfigured }: ConfigPanelProps) {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '')
  const [googleApiKey, setGoogleApiKey] = useState(localStorage.getItem('google_cloud_api_key') || '')
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

      // Store API keys
      localStorage.setItem('gemini_api_key', apiKey)

      if (googleApiKey.trim()) {
        localStorage.setItem('google_cloud_api_key', googleApiKey.trim())
      } else {
        localStorage.removeItem('google_cloud_api_key')
      }

      // Store avatar URL if provided
      if (avatarUrl.trim()) {
        localStorage.setItem('avatar_url', avatarUrl)
      } else {
        // Use default Aria VRM avatar with custom poses
        localStorage.setItem('avatar_url', '/Aria.vrm')
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
            <label htmlFor="apiKey">Gemini API Key (Required)</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="config-input"
            />
            <small className="help-text">
              Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="googleApiKey">Google Cloud API Key (Optional)</label>
            <input
              id="googleApiKey"
              type="password"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              placeholder="Enter Google Cloud API Key for high-quality voice"
              className="config-input"
            />
            <small className="help-text">
              Enables high-quality Neural voices (Cloud Text-to-Speech API)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="avatarUrl">Custom VRM URL (Optional)</label>
            <input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Enter URL for custom VRM model"
              className="config-input"
            />
            <small className="help-text">
              Leave empty to use default Aria avatar
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
            <li>✨ VTuber-style anime avatars (.vrm)</li>
            <li>🎤 Voice conversation support</li>
            <li>💭 Intelligent responses with emotion</li>
            <li>🎭 Facial expressions & gestures</li>
            <li>💕 Warm, caring personality</li>
            <li>🧠 Conversation memory</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
