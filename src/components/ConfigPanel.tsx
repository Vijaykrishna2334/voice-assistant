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
        // Use default VRM avatar (anime style)
        localStorage.setItem('avatar_url', 'https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm')
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
              placeholder="VRM or GLB avatar URL (.vrm for anime style)"
              className="config-input"
            />
            <small className="help-text">
              <strong>Anime/VTuber style:</strong> Use{' '}
              <a
                href="https://vroid.com/en/studio"
                target="_blank"
                rel="noopener noreferrer"
              >
                VRoid Studio
              </a>{' '}
              to create .vrm avatars
              <br />
              <strong>Realistic style:</strong> Use{' '}
              <a
                href="https://readyplayer.me"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ready Player Me
              </a>{' '}
              for .glb avatars
              <br />
              (Leave empty for default VRM avatar)
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
          <small style={{ marginTop: '12px', display: 'block', opacity: 0.8 }}>
            📚 See AVATAR_GUIDE.md for creating custom characters
          </small>
        </div>
      </div>
    </div>
  )
}
