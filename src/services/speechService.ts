// Speech Recognition Service using Web Speech API
class SpeechService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis
  private isInitialized: boolean = false
  private googleApiKey: string | null = null
  private lastError: string | null = null

  // Web Audio API for real-time audio analysis
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private volumeCallback: ((volume: number) => void) | null = null
  private isMonitoring: boolean = false

  constructor() {
    this.synthesis = window.speechSynthesis
    this.initializeRecognition()

    // Load API key from storage or env
    const localKey = localStorage.getItem('google_cloud_api_key')
    const envKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
    this.googleApiKey = localKey || envKey

    // Listen for storage changes to update API key dynamically
    window.addEventListener('storage', (e) => {
      if (e.key === 'google_cloud_api_key') {
        this.googleApiKey = e.newValue
      }
    })
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
    this.recognition.interimResults = true // Enable interim results for faster silence detection
    this.recognition.lang = 'en-US'
    this.isInitialized = true
  }

  // Start listening for voice input
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition || !this.isInitialized) {
      console.error('Speech recognition not initialized')
      onError?.('Speech recognition not supported')
      return
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      // Send whatever we have - prefer final, fallback to interim
      // We pass isFinal so the UI knows if it should send immediately
      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript)
        onResult(finalTranscript, true)
      } else if (interimTranscript) {
        console.log('🎤 Interim transcript:', interimTranscript)
        onResult(interimTranscript, false)
      }
    }

    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error)

      // Provide user-friendly error messages
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.lastError = 'Microphone access denied. Please allow microphone permissions.'
      } else if (event.error === 'no-speech') {
        this.lastError = 'No speech detected'
      } else if (event.error === 'audio-capture') {
        this.lastError = 'No microphone found'
      } else if (event.error === 'network') {
        this.lastError = 'Network error with speech recognition'
      } else {
        this.lastError = `Speech error: ${event.error}`
      }

      onError?.(event.error)
    }

    // @ts-ignore
    this.recognition.onstart = () => {
      console.log('🎤 Microphone started')
      this.lastError = null // Clear errors on successful start
    }

    this.recognition.onend = () => {
      console.log('🎤 Microphone stopped')
      onEnd?.()
    }

    try {
      console.log('🎤 Requesting microphone access...')
      this.recognition.start()
    } catch (error) {
      console.error('❌ Error starting recognition:', error)
      this.lastError = 'Failed to start microphone'
      onError?.(error)
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  // Speak using Google Cloud TTS (OPTIMIZED FOR LOW LATENCY + AUDIO ANALYSIS)
  private async speakWithGoogle(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    if (!this.googleApiKey) throw new Error('No Google Cloud API Key')

    try {
      console.time('🎤 TTS API Call')
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-F', // Natural, warm female voice
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 4.0,        // Higher pitch for cute, sexy voice
            speakingRate: 0.9, // Slightly slower for clarity and sensuality
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Google TTS API Error: ${response.statusText}`)
      }

      const data = await response.json()
      console.timeEnd('🎤 TTS API Call')
      const audioContent = data.audioContent

      if (!audioContent) throw new Error('No audio content received')

      // 🎵 CREATE AUDIO ELEMENT
      const audio = new Audio()
      audio.preload = 'auto'
      // this.currentAudio = audio

      // 🎵 INITIALIZE WEB AUDIO API
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // 🎵 CREATE ANALYSER NODE
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256 // Balance between detail and performance
      this.analyser.smoothingTimeConstant = 0.8 // Smooth out rapid changes

      // 🎵 CONNECT AUDIO GRAPH: audio → analyser → speakers
      const source = this.audioContext.createMediaElementSource(audio)
      source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)

      // Set up event handlers
      audio.onplay = () => {
        onStart?.()
        this.startVolumeMonitoring()
      }

      audio.onended = () => {
        this.stopVolumeMonitoring()
        onEnd?.()
      }

      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        this.stopVolumeMonitoring()
        onEnd?.()
      }

      // Set source and play
      audio.src = `data:audio/mp3;base64,${audioContent}`

      console.time('🔊 Audio Playback Start')
      try {
        await audio.play()
        console.timeEnd('🔊 Audio Playback Start')
      } catch (playError: any) {
        console.timeEnd('🔊 Audio Playback Start')
        if (playError.name === 'NotAllowedError') {
          console.warn('⚠️ Autoplay blocked. User interaction required first.')
          this.lastError = 'Click anywhere to enable audio playback'
        }
        throw playError
      }
    } catch (error) {
      console.error('Google TTS failed, falling back to browser:', error)
      this.lastError = error instanceof Error ? error.message : 'Google TTS Failed'
      throw error
    }
  }

  // 🎵 START REAL-TIME VOLUME MONITORING
  private startVolumeMonitoring() {
    if (!this.analyser || this.isMonitoring) return

    this.isMonitoring = true
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    const monitorVolume = () => {
      if (!this.isMonitoring || !this.analyser) return

      // Get frequency data (which frequencies are present)
      this.analyser.getByteFrequencyData(dataArray)

      // Calculate average volume (0 to 1)
      const sum = dataArray.reduce((a, b) => a + b, 0)
      const average = sum / dataArray.length
      const normalizedVolume = average / 255

      // Send to callback (avatar lip sync)
      this.volumeCallback?.(normalizedVolume)

      // Continue monitoring
      requestAnimationFrame(monitorVolume)
    }

    monitorVolume()
  }

  // 🎵 STOP VOLUME MONITORING
  private stopVolumeMonitoring() {
    this.isMonitoring = false
    this.volumeCallback?.(0) // Reset mouth to closed
  }

  // 🎵 PUBLIC: Set volume callback for avatar lip sync
  setVolumeCallback(callback: (volume: number) => void) {
    this.volumeCallback = callback
  }

  // 🎵 PUBLIC: Get current volume (for external use)
  getCurrentVolume(): number {
    if (!this.analyser || !this.isMonitoring) return 0

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(dataArray)

    const sum = dataArray.reduce((a, b) => a + b, 0)
    const average = sum / dataArray.length
    return average / 255
  }

  // Browser TTS fallback (FREE)
  private speakWithBrowser(text: string, onStart?: () => void, onEnd?: () => void): void {
    // Cancel any ongoing speech
    this.synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Try to use a female English voice
    const voices = this.synthesis.getVoices()
    const femaleVoice = voices.find(
      (voice) => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
    ) || voices.find(
      (voice) => voice.lang.startsWith('en') && (
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha')
      )
    )

    if (femaleVoice) {
      utterance.voice = femaleVoice
      console.log('🎤 Using voice:', femaleVoice.name)
    }

    // Voice customization
    utterance.rate = 0.95   // Slightly slower for clarity
    utterance.pitch = 1.2   // Higher pitch for female voice
    utterance.volume = 1.0  // Full volume

    utterance.onstart = () => {
      console.log('🔊 Browser TTS started')
      onStart?.()
    }

    utterance.onend = () => {
      console.log('🔊 Browser TTS finished')
      onEnd?.()
    }

    utterance.onerror = (event) => {
      console.error('Browser TTS error:', event)
      onEnd?.()
    }

    this.synthesis.speak(utterance)
  }

  // Main speak method
  async speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    // Handle empty text gracefully
    if (!text || !text.trim()) {
      console.warn('⚠️ Empty text provided to speak')
      onEnd?.()
      return
    }

    // Update key from storage or env just in case
    const localKey = localStorage.getItem('google_cloud_api_key')
    const envKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
    this.googleApiKey = localKey || envKey

    // Try Google Cloud TTS first if key exists
    if (this.googleApiKey) {
      try {
        console.log('🎤 Attempting Google Cloud TTS (Neural2 Voice)...')
        await this.speakWithGoogle(text, onStart, onEnd)
        return
      } catch (error) {
        console.warn('⚠️ Google TTS failed, falling back to browser TTS:', error)
        this.lastError = error instanceof Error ? error.message : 'Google TTS Failed'
        // FALLBACK TO BROWSER TTS
        this.speakWithBrowser(text, onStart, onEnd)
        return
      }
    }

    // No Google API key - use browser TTS directly
    console.log('🎤 Using Browser TTS (Free)')
    this.speakWithBrowser(text, onStart, onEnd)
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

  // Get last error
  getLastError(): string | null {
    return this.lastError
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
