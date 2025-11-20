// Advanced Phoneme-Based Lip Sync Service
// Maps speech sounds to viseme mouth shapes for realistic lip-sync

export type Viseme =
  | 'silent'    // Mouth closed
  | 'PP'        // P, B, M sounds
  | 'FF'        // F, V sounds
  | 'TH'        // TH sounds
  | 'DD'        // T, D sounds
  | 'kk'        // K, G sounds
  | 'CH'        // CH, J, SH sounds
  | 'SS'        // S, Z sounds
  | 'nn'        // N, L sounds
  | 'RR'        // R sound
  | 'aa'        // A as in "father"
  | 'E'         // E as in "bet"
  | 'I'         // I as in "sit"
  | 'O'         // O as in "note"
  | 'U'         // U as in "boot"

export interface VisemeFrame {
  time: number
  viseme: Viseme
  weight: number
}

export interface LipSyncData {
  frames: VisemeFrame[]
  duration: number
}

class AdvancedLipSyncService {
  // Audio context for future audio analysis features
  // private audioContext: AudioContext | null = null

  constructor() {
    // Future: Initialize audio context for real-time audio analysis
  }

  /**
   * Generate phoneme-based lip sync from text
   * This analyzes text and estimates phoneme timing
   */
  generateFromText(text: string, estimatedDuration: number): LipSyncData {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const frames: VisemeFrame[] = []

    if (words.length === 0) {
      return { frames: [], duration: 0 }
    }

    const wordsPerSecond = 2.5 // Average speaking rate
    const actualDuration = estimatedDuration || (words.length / wordsPerSecond)
    const timePerWord = actualDuration / words.length

    let currentTime = 0

    words.forEach(word => {
      const phonemes = this.textToPhonemes(word)
      const timePerPhoneme = timePerWord / phonemes.length

      phonemes.forEach(phoneme => {
        const viseme = this.phonemeToViseme(phoneme)

        frames.push({
          time: currentTime,
          viseme: viseme,
          weight: 0.8 + Math.random() * 0.2 // Slight variation
        })

        currentTime += timePerPhoneme
      })

      // Add slight pause between words
      frames.push({
        time: currentTime,
        viseme: 'silent',
        weight: 0.3
      })
      currentTime += timePerWord * 0.1
    })

    return {
      frames,
      duration: currentTime
    }
  }

  /**
   * Simple text to phoneme conversion
   * This is a basic approximation - for production, use a proper phoneme library
   */
  private textToPhonemes(word: string): string[] {
    const phonemes: string[] = []
    let i = 0

    while (i < word.length) {
      const char = word[i]
      const nextChar = word[i + 1]

      // Digraphs (two-letter combinations)
      if (nextChar) {
        const pair = char + nextChar
        if (['th', 'ch', 'sh', 'ph'].includes(pair)) {
          phonemes.push(pair)
          i += 2
          continue
        }
      }

      // Vowels
      if ('aeiou'.includes(char)) {
        phonemes.push(char)
      }
      // Consonants
      else if (char !== ' ') {
        phonemes.push(char)
      }

      i++
    }

    return phonemes
  }

  /**
   * Map phoneme to viseme (mouth shape)
   */
  private phonemeToViseme(phoneme: string): Viseme {
    const visemeMap: { [key: string]: Viseme } = {
      // Bilabial
      'p': 'PP', 'b': 'PP', 'm': 'PP',

      // Labiodental
      'f': 'FF', 'v': 'FF',

      // Dental
      'th': 'TH',

      // Alveolar
      't': 'DD', 'd': 'DD',
      'n': 'nn', 'l': 'nn',
      's': 'SS', 'z': 'SS',

      // Post-alveolar
      'sh': 'CH', 'ch': 'CH', 'j': 'CH',

      // Velar
      'k': 'kk', 'g': 'kk',

      // Rhotic
      'r': 'RR',

      // Vowels
      'a': 'aa',
      'e': 'E',
      'i': 'I',
      'o': 'O',
      'u': 'U'
    }

    return visemeMap[phoneme] || 'aa'
  }

  /**
   * Get current viseme at a specific time
   */
  getVisemeAtTime(lipSyncData: LipSyncData, currentTime: number): { viseme: Viseme, weight: number } {
    if (!lipSyncData.frames.length) {
      return { viseme: 'silent', weight: 0 }
    }

    // Find frames around current time
    let prevFrame = lipSyncData.frames[0]
    let nextFrame = lipSyncData.frames[0]

    for (let i = 0; i < lipSyncData.frames.length; i++) {
      if (lipSyncData.frames[i].time <= currentTime) {
        prevFrame = lipSyncData.frames[i]
      }
      if (lipSyncData.frames[i].time > currentTime) {
        nextFrame = lipSyncData.frames[i]
        break
      }
    }

    // Interpolate between frames for smooth transition
    if (prevFrame === nextFrame) {
      return { viseme: prevFrame.viseme, weight: prevFrame.weight }
    }

    const timeDiff = nextFrame.time - prevFrame.time
    const progress = timeDiff > 0 ? (currentTime - prevFrame.time) / timeDiff : 1

    // Use previous viseme, but reduce weight as we approach next
    return {
      viseme: progress < 0.5 ? prevFrame.viseme : nextFrame.viseme,
      weight: prevFrame.weight * (1 - progress) + nextFrame.weight * progress
    }
  }

  /**
   * Map viseme to VRM expression values
   */
  getVRMExpressionValues(viseme: Viseme, weight: number): { [key: string]: number } {
    const expressions: { [key: string]: number } = {
      'aa': 0, 'ih': 0, 'ou': 0, 'ee': 0, 'oh': 0,
      'blink': 0, 'happy': 0, 'angry': 0, 'sad': 0, 'relaxed': 0
    }

    switch (viseme) {
      case 'aa':
        expressions.aa = weight * 0.8
        break
      case 'E':
        expressions.ee = weight * 0.7
        expressions.aa = weight * 0.3
        break
      case 'I':
        expressions.ih = weight * 0.8
        break
      case 'O':
        expressions.oh = weight * 0.8
        break
      case 'U':
        expressions.ou = weight * 0.8
        break
      case 'PP':
        // Closed mouth
        expressions.aa = 0
        break
      case 'FF':
      case 'TH':
        expressions.aa = weight * 0.2
        expressions.ee = weight * 0.3
        break
      case 'SS':
      case 'CH':
        expressions.ih = weight * 0.4
        break
      case 'DD':
      case 'nn':
        expressions.aa = weight * 0.3
        break
      default:
        expressions.aa = weight * 0.3
    }

    return expressions
  }
}

export const advancedLipSyncService = new AdvancedLipSyncService()
