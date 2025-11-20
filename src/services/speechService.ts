// Speech Recognition Service using Web Speech API
class SpeechService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis
  private isInitialized: boolean = false

  constructor() {
    this.synthesis = window.speechSynthesis
    this.initializeRecognition()
  }

  private initializeRecognition() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-US'
    this.isInitialized = true
  }

  // Start listening for voice input
  startListening(onResult: (transcript: string) => void, onError?: (error: any) => void) {
    if (!this.recognition || !this.isInitialized) {
      console.error('Speech recognition not initialized')
      onError?.('Speech recognition not supported')
      return
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      onError?.(event.error)
    }

    this.recognition.onend = () => {
      // Auto-restart if needed
    }

    try {
      this.recognition.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      onError?.(error)
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  // Text to speech using Web Speech API
  speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Get a female voice if available
      const voices = this.synthesis.getVoices()
      const femaleVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('zira')
      ) || voices.find(voice => voice.lang.startsWith('en'))

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      // Configure utterance
      utterance.rate = 1.0
      utterance.pitch = 1.1
      utterance.volume = 1.0

      utterance.onstart = () => {
        onStart?.()
      }

      utterance.onend = () => {
        onEnd?.()
        resolve()
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        onEnd?.()
        reject(event)
      }

      this.synthesis.speak(utterance)
    })
  }

  // Stop speaking
  stopSpeaking() {
    this.synthesis.cancel()
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices()
  }
}

// Singleton instance
export const speechService = new SpeechService()

// Load voices when available
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices()
    console.log('Available voices:', voices.map(v => v.name))
  }
}
