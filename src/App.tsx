import { useState, useEffect } from 'react'
import Scene from './components/Scene'
import ChatInterface from './components/ChatInterface'
import VoiceControls from './components/VoiceControls'
import ConfigPanel from './components/ConfigPanel'
import AvatarSelector from './components/AvatarSelector'
import { useConversationStore } from './store/conversationStore'
import './App.css'

type AppState = 'avatar-select' | 'config' | 'main'

function App() {
  const [appState, setAppState] = useState<AppState>('avatar-select')
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/Aria.vrm')
  const [avatarName, setAvatarName] = useState<string>('Aria')
  const { initializeGemini } = useConversationStore()

  // Check if returning user (has selected avatar before)
  useEffect(() => {
    const savedAvatar = localStorage.getItem('selected_avatar')
    const savedAvatarName = localStorage.getItem('selected_avatar_name')

    if (savedAvatar) {
      setSelectedAvatar(savedAvatar)
      setAvatarName(savedAvatarName || 'Aria')

      // Check API key
      const localKey = localStorage.getItem('gemini_api_key')
      const envKey = import.meta.env.VITE_GEMINI_API_KEY
      const apiKey = localKey || envKey

      if (apiKey) {
        initializeGemini(apiKey)
        setAppState('main')
      } else {
        setAppState('config')
      }
    }
  }, [initializeGemini])

  // Handle avatar selection
  const handleAvatarSelect = (avatarFile: string, name: string) => {
    setSelectedAvatar(avatarFile)
    setAvatarName(name)
    localStorage.setItem('selected_avatar', avatarFile)
    localStorage.setItem('selected_avatar_name', name)

    // Check if API key is configured
    const localKey = localStorage.getItem('gemini_api_key')
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    const apiKey = localKey || envKey

    if (apiKey) {
      initializeGemini(apiKey)
      setAppState('main')
    } else {
      setAppState('config')
    }
  }

  // Handle config complete
  const handleConfigured = () => {
    setAppState('main')
  }

  // Avatar Selection Screen
  if (appState === 'avatar-select') {
    return <AvatarSelector onSelect={handleAvatarSelect} />
  }

  // Config/API Key Screen
  if (appState === 'config') {
    return (
      <ConfigPanel
        onConfigured={handleConfigured}
      />
    )
  }

  // Main App
  return (
    <div className="app">
      {/* Avatar name badge */}
      <div className="avatar-badge">
        <span className="avatar-status" />
        <span className="avatar-label">{avatarName}</span>
        <button
          className="change-avatar-btn"
          onClick={() => setAppState('avatar-select')}
          title="Change avatar"
        >
          ↻
        </button>
      </div>

      <Scene />
      <ChatInterface />
      <VoiceControls />
    </div>
  )
}

export default App
