import { useState, useEffect } from 'react'
import { useConversationStore } from '../store/conversationStore'
import { speechService } from '../services/speechService'
import './VoiceControls.css'

export default function VoiceControls() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const { sendMessage, setSpeaking, isSpeaking, messages } = useConversationStore()

  // Auto-speak assistant messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    if (lastMessage && lastMessage.role === 'assistant' && !isSpeaking) {
      handleSpeak(lastMessage.content)
    }
  }, [messages])

  const handleSpeak = async (text: string) => {
    try {
      setSpeaking(true)
      await speechService.speak(
        text,
        () => {
          // On start
          console.log('Started speaking')
        },
        () => {
          // On end
          setSpeaking(false)
          console.log('Finished speaking')
        }
      )
    } catch (error) {
      console.error('Error speaking:', error)
      setSpeaking(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening()
      setIsListening(false)
      setTranscript('')
    } else {
      setIsListening(true)
      speechService.startListening(
        (text) => {
          setTranscript(text)
          setIsListening(false)

          // Send the transcribed message
          if (text.trim()) {
            sendMessage(text)
          }
        },
        (error) => {
          console.error('Speech recognition error:', error)
          setIsListening(false)
          setTranscript('')
        }
      )
    }
  }

  const stopSpeaking = () => {
    speechService.stopSpeaking()
    setSpeaking(false)
  }

  return (
    <div className="voice-controls">
      <div className="controls-container">
        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          disabled={isSpeaking}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? '🎤' : '🎙️'}
        </button>

        {isListening && (
          <div className="listening-indicator">
            <div className="pulse-ring"></div>
            <p>Listening...</p>
          </div>
        )}

        {transcript && !isListening && (
          <div className="transcript-preview">
            <p>"{transcript}"</p>
          </div>
        )}

        {isSpeaking && (
          <button
            className="stop-btn"
            onClick={stopSpeaking}
            title="Stop speaking"
          >
            ⏹️ Stop
          </button>
        )}

        <div className="voice-info">
          <p>
            {isListening
              ? 'Listening to you...'
              : isSpeaking
              ? 'Aria is speaking...'
              : 'Click microphone to speak'}
          </p>
        </div>
      </div>
    </div>
  )
}
