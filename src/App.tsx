import { useState, useEffect } from 'react'
import Scene from './components/Scene'
import ChatInterface from './components/ChatInterface'
import VoiceControls from './components/VoiceControls'
import ConfigPanel from './components/ConfigPanel'
import { useConversationStore } from './store/conversationStore'
import './App.css'

function App() {
  const [isConfigured, setIsConfigured] = useState(false)
  const { initializeGemini } = useConversationStore()

  useEffect(() => {
    // Check if API key is already configured
    const apiKey = localStorage.getItem('gemini_api_key')
    if (apiKey) {
      initializeGemini(apiKey)
      setIsConfigured(true)
    }
  }, [initializeGemini])

  if (!isConfigured) {
    return <ConfigPanel onConfigured={() => setIsConfigured(true)} />
  }

  return (
    <div className="app">
      <Scene />
      <ChatInterface />
      <VoiceControls />
    </div>
  )
}

export default App
