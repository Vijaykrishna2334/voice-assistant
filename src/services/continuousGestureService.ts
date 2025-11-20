// Continuous Gesture Service
// Provides natural hand movements DURING speech (not just triggered gestures)

export type GestureStyle =
  | 'calm'      // Minimal, subtle gestures
  | 'normal'    // Regular conversational gestures
  | 'excited'   // Energetic, large gestures
  | 'thoughtful' // Slow, contemplative gestures
  | 'loving'    // Gentle, warm gestures

export interface HandPose {
  leftArm: {
    shoulder: { x: number, y: number, z: number }
    elbow: { x: number, y: number, z: number }
    wrist: { x: number, y: number, z: number }
  }
  rightArm: {
    shoulder: { x: number, y: number, z: number }
    elbow: { x: number, y: number, z: number }
    wrist: { x: number, y: number, z: number }
  }
  weight: number
}

export interface GesturePattern {
  poses: HandPose[]
  duration: number
  loop: boolean
}

class ContinuousGestureService {
  private gestureLibrary: Map<GestureStyle, GesturePattern[]> = new Map()
  private currentPattern: GesturePattern | null = null
  private patternStartTime: number = 0
  // private currentStyle: GestureStyle = 'normal' // Future use

  constructor() {
    this.initializeGestureLibrary()
  }

  /**
   * Initialize library of gesture patterns
   */
  private initializeGestureLibrary() {
    // Calm gestures - minimal movement
    this.gestureLibrary.set('calm', [
      {
        poses: [
          {
            leftArm: { shoulder: { x: 0.1, y: 0, z: 0.05 }, elbow: { x: 0.2, y: 0, z: 0 }, wrist: { x: 0, y: 0, z: 0 } },
            rightArm: { shoulder: { x: 0.1, y: 0, z: -0.05 }, elbow: { x: 0.2, y: 0, z: 0 }, wrist: { x: 0, y: 0, z: 0 } },
            weight: 1.0
          }
        ],
        duration: 2.0,
        loop: true
      }
    ])

    // Normal conversational gestures
    this.gestureLibrary.set('normal', [
      // Gentle hand raise
      {
        poses: [
          {
            leftArm: { shoulder: { x: 0.2, y: 0, z: 0.3 }, elbow: { x: 0.4, y: 0, z: 0.2 }, wrist: { x: 0.1, y: 0.1, z: 0 } },
            rightArm: { shoulder: { x: 0.1, y: 0, z: -0.1 }, elbow: { x: 0.2, y: 0, z: 0 }, wrist: { x: 0, y: 0, z: 0 } },
            weight: 1.0
          },
          {
            leftArm: { shoulder: { x: 0.1, y: 0, z: 0.1 }, elbow: { x: 0.2, y: 0, z: 0 }, wrist: { x: 0, y: 0, z: 0 } },
            rightArm: { shoulder: { x: 0.2, y: 0, z: -0.3 }, elbow: { x: 0.4, y: 0, z: -0.2 }, wrist: { x: 0.1, y: 0.1, z: 0 } },
            weight: 1.0
          }
        ],
        duration: 3.0,
        loop: true
      },
      // Counting/emphasis gesture
      {
        poses: [
          {
            leftArm: { shoulder: { x: 0.3, y: 0, z: 0.4 }, elbow: { x: 0.6, y: 0, z: 0.3 }, wrist: { x: 0.2, y: 0.2, z: 0 } },
            rightArm: { shoulder: { x: 0.1, y: 0, z: -0.1 }, elbow: { x: 0.2, y: 0, z: 0 }, wrist: { x: 0, y: 0, z: 0 } },
            weight: 1.0
          }
        ],
        duration: 1.5,
        loop: false
      }
    ])

    // Excited gestures - large, energetic
    this.gestureLibrary.set('excited', [
      {
        poses: [
          {
            leftArm: { shoulder: { x: 0.5, y: 0, z: 0.6 }, elbow: { x: 0.8, y: 0, z: 0.5 }, wrist: { x: 0.3, y: 0.3, z: 0 } },
            rightArm: { shoulder: { x: 0.5, y: 0, z: -0.6 }, elbow: { x: 0.8, y: 0, z: -0.5 }, wrist: { x: 0.3, y: 0.3, z: 0 } },
            weight: 1.0
          },
          {
            leftArm: { shoulder: { x: 0.3, y: 0, z: 0.4 }, elbow: { x: 0.5, y: 0, z: 0.3 }, wrist: { x: 0.2, y: 0.1, z: 0 } },
            rightArm: { shoulder: { x: 0.3, y: 0, z: -0.4 }, elbow: { x: 0.5, y: 0, z: -0.3 }, wrist: { x: 0.2, y: 0.1, z: 0 } },
            weight: 1.0
          }
        ],
        duration: 1.5,
        loop: true
      }
    ])

    // Thoughtful gestures
    this.gestureLibrary.set('thoughtful', [
      {
        poses: [
          {
            leftArm: { shoulder: { x: 0.2, y: 0, z: 0.2 }, elbow: { x: 0.4, y: 0, z: 0.2 }, wrist: { x: 0.1, y: 0.05, z: 0 } },
            rightArm: { shoulder: { x: 0.1, y: 0, z: -0.1 }, elbow: { x: 0.2, y: 0, z: 0 }, wrist: { x: 0, y: 0, z: 0 } },
            weight: 1.0
          }
        ],
        duration: 3.0,
        loop: true
      }
    ])

    // Loving gestures - gentle, warm
    this.gestureLibrary.set('loving', [
      {
        poses: [
          {
            leftArm: { shoulder: { x: 0.3, y: 0, z: 0.5 }, elbow: { x: 0.5, y: 0, z: 0.4 }, wrist: { x: 0.2, y: 0.2, z: 0.1 } },
            rightArm: { shoulder: { x: 0.3, y: 0, z: -0.5 }, elbow: { x: 0.5, y: 0, z: -0.4 }, wrist: { x: 0.2, y: 0.2, z: -0.1 } },
            weight: 1.0
          }
        ],
        duration: 2.5,
        loop: true
      }
    ])
  }

  /**
   * Start a gesture pattern based on emotion/style
   */
  startGesture(style: GestureStyle) {
    // this.currentStyle = style // Future use
    const patterns = this.gestureLibrary.get(style)

    if (patterns && patterns.length > 0) {
      // Pick random pattern from style
      const randomIndex = Math.floor(Math.random() * patterns.length)
      this.currentPattern = patterns[randomIndex]
      this.patternStartTime = Date.now()
    }
  }

  /**
   * Get current hand pose at a specific time
   */
  getCurrentPose(deltaTime: number): HandPose | null {
    if (!this.currentPattern) return null

    const elapsedTime = deltaTime - this.patternStartTime / 1000

    // Check if pattern should loop
    if (elapsedTime > this.currentPattern.duration) {
      if (this.currentPattern.loop) {
        this.patternStartTime = Date.now()
      } else {
        // Pattern finished, return to idle
        this.currentPattern = null
        return null
      }
    }

    const poses = this.currentPattern.poses
    if (poses.length === 0) return null

    // Simple approach: return current pose based on time
    const poseIndex = Math.floor((elapsedTime / this.currentPattern.duration) * poses.length) % poses.length
    return poses[poseIndex]
  }

  /**
   * Add natural variation to gestures
   */
  addNaturalVariation(pose: HandPose, time: number): HandPose {
    const variation = 0.05
    const noise = Math.sin(time * 2) * variation

    return {
      leftArm: {
        shoulder: {
          x: pose.leftArm.shoulder.x + noise,
          y: pose.leftArm.shoulder.y,
          z: pose.leftArm.shoulder.z
        },
        elbow: pose.leftArm.elbow,
        wrist: pose.leftArm.wrist
      },
      rightArm: {
        shoulder: {
          x: pose.rightArm.shoulder.x + noise,
          y: pose.rightArm.shoulder.y,
          z: pose.rightArm.shoulder.z
        },
        elbow: pose.rightArm.elbow,
        wrist: pose.rightArm.wrist
      },
      weight: pose.weight
    }
  }

  /**
   * Stop current gesture
   */
  stopGesture() {
    this.currentPattern = null
  }

  /**
   * Get idle hand pose (neutral position)
   */
  getIdlePose(): HandPose {
    return {
      leftArm: {
        shoulder: { x: 0.1, y: 0, z: 0.05 },
        elbow: { x: 0.2, y: 0, z: 0 },
        wrist: { x: 0, y: 0, z: 0 }
      },
      rightArm: {
        shoulder: { x: 0.1, y: 0, z: -0.05 },
        elbow: { x: 0.2, y: 0, z: 0 },
        wrist: { x: 0, y: 0, z: 0 }
      },
      weight: 1.0
    }
  }
}

export const continuousGestureService = new ContinuousGestureService()
