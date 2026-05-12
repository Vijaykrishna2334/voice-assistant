// Animation Controller - Manages avatar animations based on context
export type AnimationType =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'wave'
  | 'nod'
  | 'shake'
  | 'jump'
  | 'dance'
  | 'think'
  | 'heart'

export type EmotionType =
  | 'happy'
  | 'sad'
  | 'excited'
  | 'thoughtful'
  | 'loving'
  | 'neutral'

export interface AnimationState {
  current: AnimationType
  emotion: EmotionType
  intensity: number
  blendDuration: number
}

class AnimationController {
  private currentState: AnimationState = {
    current: 'idle',
    emotion: 'neutral',
    intensity: 1.0,
    blendDuration: 0.3
  }

  private listeners: Set<(state: AnimationState) => void> = new Set()

  /**
   * Subscribe to animation state changes
   */
  subscribe(listener: (state: AnimationState) => void) {
    this.listeners.add(listener)
    // Immediately call with current state
    listener(this.currentState)

    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.currentState))
  }

  /**
   * Set current animation
   */
  setAnimation(animation: AnimationType, intensity: number = 1.0) {
    this.currentState = {
      ...this.currentState,
      current: animation,
      intensity
    }
    this.notify()
  }

  /**
   * Set emotion (affects facial expressions)
   */
  setEmotion(emotion: EmotionType) {
    this.currentState = {
      ...this.currentState,
      emotion
    }
    this.notify()
  }

  /**
   * Play a gesture animation
   */
  playGesture(gesture: string) {
    const gestureMap: { [key: string]: AnimationType } = {
      'wave': 'wave',
      'nod': 'nod',
      'shake': 'shake',
      'jump': 'jump',
      'dance': 'dance',
      'think': 'think',
      'heart': 'heart',
      'none': 'idle'
    }

    const animation = gestureMap[gesture] || 'idle'
    this.setAnimation(animation)

    // Return to idle after gesture (except for continuous ones)
    if (!['idle', 'speaking', 'listening'].includes(animation)) {
      setTimeout(() => {
        this.setAnimation('idle')
      }, 2000)
    }
  }

  /**
   * Get current state
   */
  getState(): AnimationState {
    return { ...this.currentState }
  }

  /**
   * Handle conversation state changes
   */
  onSpeaking() {
    this.setAnimation('speaking')
  }

  onListening() {
    this.setAnimation('listening')
  }

  onIdle() {
    this.setAnimation('idle')
  }

  /**
   * Get morph target values for emotions
   * These values would be applied to facial morphs on the 3D model
   */
  getEmotionMorphs(emotion: EmotionType): { [key: string]: number } {
    const morphs: { [key: string]: { [key: string]: number } } = {
      happy: {
        mouthSmile: 0.8,
        eyesSmile: 0.6,
        browUp: 0.3
      },
      sad: {
        mouthFrown: 0.6,
        browDown: 0.5,
        eyesClosed: 0.2
      },
      excited: {
        mouthOpen: 0.7,
        mouthSmile: 1.0,
        eyesWide: 0.8,
        browUp: 0.6
      },
      thoughtful: {
        eyesSquint: 0.3,
        browDown: 0.2,
        mouthPucker: 0.2
      },
      loving: {
        mouthSmile: 0.7,
        eyesSmile: 0.8,
        browUp: 0.2
      },
      neutral: {
        // All at 0 - neutral expression
      }
    }

    return morphs[emotion] || {}
  }

  /**
   * Get suggested animation based on text content
   */
  suggestAnimation(text: string): AnimationType {
    const lower = text.toLowerCase()

    if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
      return 'wave'
    }
    if (lower.includes('yes') || lower.includes('agree') || lower.includes('right')) {
      return 'nod'
    }
    if (lower.includes('no') || lower.includes('disagree') || lower.includes('don\'t')) {
      return 'shake'
    }
    if (lower.includes('excited') || lower.includes('yay') || lower.includes('awesome')) {
      return 'jump'
    }
    if (lower.includes('dance') || lower.includes('celebrate')) {
      return 'dance'
    }
    if (lower.includes('think') || lower.includes('hmm') || lower.includes('wonder')) {
      return 'think'
    }
    if (lower.includes('love') || lower.includes('heart') || lower.includes('adore')) {
      return 'heart'
    }

    return 'idle'
  }
}

export const animationController = new AnimationController()
