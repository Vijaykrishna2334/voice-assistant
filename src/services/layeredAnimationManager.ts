// Layered Animation Manager
// Manages multiple animation layers that blend together for lifelike movement

export interface AnimationLayer {
  name: string
  weight: number
  priority: number
  active: boolean
}

export interface IdleVariation {
  name: string
  duration: number
  intensity: number
  movements: {
    type: 'breathe' | 'sway' | 'shift' | 'look' | 'blink' | 'micro'
    params: any
  }[]
}

class LayeredAnimationManager {
  private layers: Map<string, AnimationLayer> = new Map()
  private idleVariations: IdleVariation[] = []
  private currentIdleVariation: number = 0
  private idleTimer: number = 0
  private blendSpeed: number = 0.1

  constructor() {
    this.initializeLayers()
    this.initializeIdleVariations()
  }

  /**
   * Initialize animation layers
   */
  private initializeLayers() {
    // Base layer - always active
    this.addLayer('idle', 1.0, 0, true)

    // Expression layer
    this.addLayer('expression', 0.8, 1, false)

    // Gesture layer
    this.addLayer('gesture', 0.9, 2, false)

    // Speaking layer
    this.addLayer('speaking', 1.0, 3, false)

    // Special action layer (highest priority)
    this.addLayer('action', 1.0, 4, false)
  }

  /**
   * Initialize idle variation library
   */
  private initializeIdleVariations() {
    // Standard breathing idle
    this.idleVariations.push({
      name: 'breathe',
      duration: 4.0,
      intensity: 1.0,
      movements: [
        {
          type: 'breathe',
          params: { frequency: 0.3, amplitude: 0.015 }
        },
        {
          type: 'blink',
          params: { interval: 3.0 }
        }
      ]
    })

    // Gentle sway
    this.idleVariations.push({
      name: 'sway',
      duration: 6.0,
      intensity: 0.8,
      movements: [
        {
          type: 'breathe',
          params: { frequency: 0.3, amplitude: 0.015 }
        },
        {
          type: 'sway',
          params: { frequency: 0.2, amplitude: 0.02 }
        },
        {
          type: 'blink',
          params: { interval: 3.5 }
        }
      ]
    })

    // Weight shift
    this.idleVariations.push({
      name: 'shift',
      duration: 5.0,
      intensity: 0.9,
      movements: [
        {
          type: 'breathe',
          params: { frequency: 0.3, amplitude: 0.015 }
        },
        {
          type: 'shift',
          params: { duration: 1.5, amount: 0.03 }
        },
        {
          type: 'blink',
          params: { interval: 3.0 }
        }
      ]
    })

    // Look around
    this.idleVariations.push({
      name: 'look',
      duration: 7.0,
      intensity: 1.0,
      movements: [
        {
          type: 'breathe',
          params: { frequency: 0.3, amplitude: 0.015 }
        },
        {
          type: 'look',
          params: { frequency: 0.15, range: 0.4 }
        },
        {
          type: 'blink',
          params: { interval: 2.8 }
        }
      ]
    })

    // Micro-movements
    this.idleVariations.push({
      name: 'micro',
      duration: 8.0,
      intensity: 0.7,
      movements: [
        {
          type: 'breathe',
          params: { frequency: 0.3, amplitude: 0.015 }
        },
        {
          type: 'micro',
          params: { frequency: 0.8, amplitude: 0.005 }
        },
        {
          type: 'blink',
          params: { interval: 3.2 }
        }
      ]
    })
  }

  /**
   * Add animation layer
   */
  addLayer(name: string, weight: number, priority: number, active: boolean) {
    this.layers.set(name, { name, weight, priority, active })
  }

  /**
   * Activate layer
   */
  activateLayer(name: string, weight: number = 1.0) {
    const layer = this.layers.get(name)
    if (layer) {
      layer.active = true
      layer.weight = weight
    }
  }

  /**
   * Deactivate layer
   */
  deactivateLayer(name: string) {
    const layer = this.layers.get(name)
    if (layer) {
      layer.active = false
    }
  }

  /**
   * Set layer weight
   */
  setLayerWeight(name: string, weight: number) {
    const layer = this.layers.get(name)
    if (layer) {
      layer.weight = weight
    }
  }

  /**
   * Blend layer weights smoothly
   */
  blendLayerWeight(name: string, targetWeight: number, deltaTime: number) {
    const layer = this.layers.get(name)
    if (layer) {
      const diff = targetWeight - layer.weight
      layer.weight += diff * this.blendSpeed * (deltaTime * 60)
    }
  }

  /**
   * Get active layers sorted by priority
   */
  getActiveLayers(): AnimationLayer[] {
    return Array.from(this.layers.values())
      .filter(layer => layer.active)
      .sort((a, b) => a.priority - b.priority)
  }

  /**
   * Update idle variation
   */
  updateIdleVariation(deltaTime: number) {
    this.idleTimer += deltaTime

    const currentVariation = this.idleVariations[this.currentIdleVariation]
    if (this.idleTimer >= currentVariation.duration) {
      // Switch to next variation
      this.currentIdleVariation = (this.currentIdleVariation + 1) % this.idleVariations.length
      this.idleTimer = 0
    }
  }

  /**
   * Get current idle variation
   */
  getCurrentIdleVariation(): IdleVariation {
    return this.idleVariations[this.currentIdleVariation]
  }

  /**
   * Calculate blended animation value
   */
  blendAnimations(values: { value: number, weight: number }[]): number {
    if (values.length === 0) return 0

    let totalWeight = 0
    let blendedValue = 0

    values.forEach(({ value, weight }) => {
      blendedValue += value * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? blendedValue / totalWeight : 0
  }

  /**
   * Get breathing value for current time
   */
  getBreathingValue(time: number, frequency: number = 0.4, amplitude: number = 0.04): number {
    return Math.sin(time * frequency * Math.PI * 2) * amplitude
  }

  /**
   * Get sway value for current time
   */
  getSwayValue(time: number, frequency: number = 0.25, amplitude: number = 0.08): number {
    return Math.sin(time * frequency * Math.PI * 2) * amplitude
  }

  /**
   * Get micro-movement value
   */
  getMicroMovement(time: number, seed: number = 0): number {
    // Use perlin-like noise simulation
    const n1 = Math.sin(time * 0.7 + seed) * 0.5
    const n2 = Math.sin(time * 1.3 + seed * 2) * 0.3
    const n3 = Math.sin(time * 2.1 + seed * 3) * 0.2
    return (n1 + n2 + n3) * 0.02  // Increased from 0.005 to 0.02
  }

  /**
   * Check if should blink
   */
  shouldBlink(time: number, lastBlinkTime: number, interval: number = 2.5): boolean {
    const timeSinceLastBlink = time - lastBlinkTime
    // Add some randomness to blink interval
    const randomInterval = interval + (Math.random() - 0.5) * 1.0
    return timeSinceLastBlink >= randomInterval
  }

  /**
   * Get smooth transition easing
   */
  easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /**
   * Smooth step function for transitions
   */
  smoothStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  }
}

export const layeredAnimationManager = new LayeredAnimationManager()
