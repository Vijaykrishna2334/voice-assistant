import { useState, useEffect, useRef } from 'react'
import { useConversationStore } from '../store/conversationStore'
import { speechService } from '../services/speechService'
import { whisperService } from '../services/whisperService'
import './VoiceControls.css'

export default function VoiceControls() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [continuousMode, setContinuousMode] = useState(true) // Default to ON for Siri-like behavior
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [whisperStatus, setWhisperStatus] = useState('Loading Whisper...')
  const [isWhisperReady, setIsWhisperReady] = useState(false)
  const { sendMessage, setSpeaking, isSpeaking, messages, triggerPendingGesture } = useConversationStore()

  // Initialize Whisper model on mount
  useEffect(() => {
    whisperService.setStatusCallback((status) => {
      setWhisperStatus(status)
      if (status === 'Whisper ready') {
        setIsWhisperReady(true)
      }
    })

    // Start loading Whisper in the background
    whisperService.initialize().catch((error) => {
      console.error('Failed to initialize Whisper:', error)
      setWhisperStatus('Whisper failed to load')
    })
  }, [])

  // Unlock audio on first user interaction (fix autoplay policy)
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioUnlocked) {
        // Create and play silent audio to unlock autoplay
        const audio = new Audio()
        audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUHAAAAAAAAAOGAXRjVxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZBIP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='
        audio.volume = 0
        audio.play().then(() => {
          console.log('✅ Audio unlocked for autoplay')
          setAudioUnlocked(true)
        }).catch(() => {
          // Silent fail, will retry on next interaction
        })
      }
    }

    // Listen for first click/touch anywhere
    document.addEventListener('click', unlockAudio, { once: true })
    document.addEventListener('touchstart', unlockAudio, { once: true })

    return () => {
      document.removeEventListener('click', unlockAudio)
      document.removeEventListener('touchstart', unlockAudio)
    }
  }, [audioUnlocked])

  // Auto-speak assistant messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    if (lastMessage && lastMessage.role === 'assistant' && !isSpeaking) {
      // Stop listening while AI is speaking
      if (isListening) {
        whisperService.stopListening()
        setIsListening(false)
      }
      handleSpeak(lastMessage.content)
    }
  }, [messages])

  // Auto-restart listening in continuous mode AFTER speaking finishes or listening ends
  useEffect(() => {
    if (continuousMode && !isListening && !isSpeaking && isWhisperReady) {
      // Minimal delay before restarting (OPTIMIZED for speed)
      const timer = setTimeout(() => {
        startListening()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [continuousMode, isSpeaking, isListening, isWhisperReady])

  const handleSpeak = async (text: string) => {
    try {
      setSpeaking(true)
      await speechService.speak(
        text,
        () => {
          // On start - ensure mic is off
          if (isListening) {
            whisperService.stopListening()
            setIsListening(false)
          }
          console.log('Started speaking')
        },
        () => {
          // On end - mic will auto-restart via useEffect if continuous mode is on
          setSpeaking(false)
          console.log('Finished speaking')
          triggerPendingGesture() // 🎭 Trigger any queued action (dance, jump, etc.)
        }
      )
    } catch (error) {
      console.error('Error speaking:', error)
      setSpeaking(false)
    }
  }

  const startListening = () => {
    if (!isWhisperReady) {
      console.warn('Whisper not ready yet')
      return
    }

    setIsListening(true)
    setTranscript('')

    whisperService.startListening(
      (text, isFinal) => {
        setTranscript(text)

        if (isFinal && text.trim()) {
          setIsListening(false)
          sendMessage(text)
          setTranscript('')
        }
      },
      (error) => {
        console.error('Whisper error:', error)
        setIsListening(false)
        setTranscript('')

        if (error === 'Microphone access denied') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.')
        }
      },
      () => {
        // On end
        setIsListening(false)
      }
    )
  }

  const toggleListening = () => {
    if (isListening) {
      whisperService.stopListening()
      setIsListening(false)
      setTranscript('')
    } else {
      startListening()
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
          disabled={isSpeaking || !isWhisperReady}
          title={isListening ? 'Stop listening' : isWhisperReady ? 'Start voice input (Whisper)' : 'Loading Whisper...'}
        >
          {isListening ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="white" />
              <path d="M19 10V11C19 14.31 16.69 17.1 13.5 17.83V20H16V22H8V20H10.5V17.83C7.31 17.1 5 14.31 5 11V10H7V11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11V10H19Z" fill="white" />
            </svg>
          )}
        </button>

        <button
          className={`continuous-btn ${continuousMode ? 'active' : ''}`}
          onClick={() => setContinuousMode(!continuousMode)}
          title={continuousMode ? 'Disable auto-listen (Siri mode)' : 'Enable auto-listen (Siri mode)'}
        >
          {continuousMode ? '🔄 Auto' : '🔄 Manual'}
        </button>

        {isListening && (
          <div className="listening-indicator">
            <div className="pulse-ring"></div>
            <p>Recording...</p>
          </div>
        )}

        {transcript && (
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

        {/* Whisper Status Display */}
        {!isWhisperReady && (
          <div className="whisper-status" style={{ color: '#ffaa00', fontSize: '0.8rem', marginTop: '5px' }}>
            🤖 {whisperStatus}
          </div>
        )}

        {/* Error Display */}
        {speechService.getLastError() && (
          <div className="error-message" style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '5px' }}>
            ⚠️ {speechService.getLastError()}
          </div>
        )}

        <div className="voice-info">
          <p>
            {!isWhisperReady
              ? whisperStatus
              : isListening
                ? 'Recording with Whisper...'
                : isSpeaking
                  ? 'Aria is speaking...'
                  : continuousMode
                    ? 'Auto-listen active (Whisper STT)'
                    : 'Manual mode - click mic to speak'}
          </p>
        </div>
      </div>
    </div>
  )
}
