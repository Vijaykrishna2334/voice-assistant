// Lip Sync Service - Maps phonemes to visemes (mouth shapes)
export type Viseme = 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'F' | 'TH' | 'S' | 'R' | 'L' | 'neutral'

export interface LipSyncFrame {
  time: number
  viseme: Viseme
  intensity: number
}

class LipSyncService {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Analyze text and generate lip sync data
   * This is a simplified version that maps letters to visemes
   * For production, you'd use phoneme analysis
   */
  generateLipSyncData(text: string, duration: number): LipSyncFrame[] {
    const frames: LipSyncFrame[] = []
    const words = text.toLowerCase().split(' ')
    const totalWords = words.length
    const timePerWord = duration / totalWords

    let currentTime = 0

    words.forEach((word) => {
      const letters = word.split('')
      const timePerLetter = timePerWord / letters.length

      letters.forEach((letter) => {
        const viseme = this.letterToViseme(letter)
        frames.push({
          time: currentTime,
          viseme,
          intensity: 0.8
        })

        currentTime += timePerLetter
      })

      // Add neutral between words
      frames.push({
        time: currentTime,
        viseme: 'neutral',
        intensity: 0.3
      })
    })

    return frames
  }

  /**
   * Simple letter to viseme mapping
   */
  private letterToViseme(letter: string): Viseme {
    const vowels: { [key: string]: Viseme } = {
      'a': 'A',
      'e': 'E',
      'i': 'I',
      'o': 'O',
      'u': 'U'
    }

    const consonants: { [key: string]: Viseme } = {
      'm': 'M',
      'b': 'M',
      'p': 'M',
      'f': 'F',
      'v': 'F',
      's': 'S',
      'z': 'S',
      'th': 'TH',
      'r': 'R',
      'l': 'L'
    }

    if (vowels[letter]) return vowels[letter]
    if (consonants[letter]) return consonants[letter]

    return 'neutral'
  }

  /**
   * Enhanced lip sync from audio analysis
   * Uses audio amplitude to drive mouth movement
   */
  async analyzeSpeech(audioData: ArrayBuffer): Promise<LipSyncFrame[]> {
    if (!this.audioContext) {
      return []
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData)
      const channelData = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate

      const frames: LipSyncFrame[] = []
      const frameRate = 30 // 30 fps
      const samplesPerFrame = Math.floor(sampleRate / frameRate)

      for (let i = 0; i < channelData.length; i += samplesPerFrame) {
        const chunk = channelData.slice(i, i + samplesPerFrame)
        const amplitude = this.getAmplitude(chunk)
        const time = i / sampleRate

        // Map amplitude to mouth opening
        const viseme = amplitude > 0.3 ? 'A' : amplitude > 0.1 ? 'E' : 'neutral'

        frames.push({
          time,
          viseme,
          intensity: amplitude
        })
      }

      return frames
    } catch (error) {
      console.error('Error analyzing speech:', error)
      return []
    }
  }

  /**
   * Calculate RMS amplitude of audio chunk
   */
  private getAmplitude(chunk: Float32Array): number {
    let sum = 0
    for (let i = 0; i < chunk.length; i++) {
      sum += chunk[i] * chunk[i]
    }
    return Math.sqrt(sum / chunk.length)
  }

  /**
   * Real-time lip sync from microphone
   */
  async startRealtimeLipSync(onFrame: (viseme: Viseme, intensity: number) => void): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (!this.audioContext) {
        return null
      }

      const source = this.audioContext.createMediaStreamSource(stream)
      const analyzer = this.audioContext.createAnalyser()
      analyzer.fftSize = 256

      source.connect(analyzer)

      const bufferLength = analyzer.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const update = () => {
        analyzer.getByteFrequencyData(dataArray)

        // Calculate average amplitude
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength / 255

        // Map to viseme based on amplitude
        let viseme: Viseme = 'neutral'
        if (average > 0.3) viseme = 'A'
        else if (average > 0.2) viseme = 'O'
        else if (average > 0.1) viseme = 'E'

        onFrame(viseme, average)

        requestAnimationFrame(update)
      }

      update()

      return stream
    } catch (error) {
      console.error('Error starting realtime lip sync:', error)
      return null
    }
  }
}

export const lipSyncService = new LipSyncService()
