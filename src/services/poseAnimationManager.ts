// Pose Animation Manager
// Maps VRoid poses to animation states (idle, dance, walk, jump, etc.)

import type { VRM } from '@pixiv/three-vrm'
import { vroidPoseLoader } from './vroidPoseLoader'

export type AnimationState =
    | 'idle' | 'walking' | 'dancing' | 'jumping' | 'spinning' | 'wave' | 'heart' | 'sit'
    | 'excited' | 'energetic' | 'celebrate' | 'stretch' | 'relax' | 'modeling' | 'flex' | 'special'
    // Individual poses - activated by numbers only (pose 1, pose 2, etc.)
    | 'pose1' | 'pose2' | 'pose3' | 'pose4' | 'pose5' | 'pose6' | 'pose7' | 'pose8'
    | 'pose9' | 'pose10' | 'pose11' | 'pose12' | 'pose13' | 'pose14' | 'pose15' | 'pose16'

export interface PoseAnimation {
    state: AnimationState
    poses: string[]
    loop: boolean
    duration: number // Duration per pose in seconds
}

class PoseAnimationManager {
    private currentState: AnimationState = 'idle'
    private currentPoseIndex: number = 0
    private elapsedTime: number = 0
    private isPlaying: boolean = false

    // Animation definitions - MAPPED TO YOUR VROIDPOSE FILES
    private animations: Map<AnimationState, PoseAnimation> = new Map([
        ['idle', {
            state: 'idle',
            poses: ['Pose 2', 'Pose 2', 'Pose 3', 'Pose 2', 'Pose 1', 'Pose 2'], // Mostly casual standing (Pose 2)
            loop: true,
            duration: 4.0 // Slow, natural shifts
        }],
        ['walking', {
            state: 'walking',
            // MODEL WALK: Walk -> Strike Pose (16) -> Walk
            poses: ['Pose 4', 'Pose 5', 'Pose 16', 'Pose 4', 'Pose 5'],
            loop: true,
            duration: 0.5 // Faster pace for realism
        }],
        ['dancing', {
            state: 'dancing',
            // COMPLEX DYNAMIC DANCE: Varied poses with energy
            poses: ['Pose 8', 'Pose 16', 'Pose 9', 'Pose 10', 'Pose 12', 'Pose 14', 'Pose 11'],
            loop: true,
            duration: 0.55 // Slightly faster for dynamic feel
        }],
        ['spinning', {
            state: 'spinning',
            poses: ['Pose 9', 'Pose 10', 'Pose 9', 'Pose 10'],
            loop: false,
            duration: 0.60
        }],
        ['jumping', {
            state: 'jumping',
            poses: ['Pose 2'], // Neutral pose - actual jump is procedural in AniLevelAvatar
            loop: false,
            duration: 3.0 // Duration for 2 jumps
        }],
        ['energetic', {
            state: 'energetic',
            // Girly/Pop Star Energy
            poses: ['Pose 11', 'Pose 8', 'Pose 14', 'Pose 16', 'Pose 11'],
            loop: true,
            duration: 0.5
        }],
        ['celebrate', {
            state: 'celebrate',
            poses: ['Pose 12', 'Pose 14', 'Pose 16', 'Pose 14', 'Pose 12'],
            loop: false,
            duration: 0.4
        }],
        ['stretch', {
            state: 'stretch',
            poses: ['Pose 7', 'Pose 3', 'Pose 7', 'Pose 2'],
            loop: false,
            duration: 1.5
        }],
        ['relax', {
            state: 'relax',
            // Feminine Relax: Casual -> Lean -> Casual
            poses: ['Pose 3', 'Pose 6', 'Pose 3', 'Pose 2'],
            loop: true,
            duration: 2.5
        }],
        ['modeling', {
            state: 'modeling',
            poses: ['Pose 16', 'Pose 8', 'Pose 6', 'Pose 16', 'Pose 5'],
            loop: true,
            duration: 1.8 // Hold poses longer
        }],
        ['flex', {
            state: 'flex',
            poses: ['Pose 11', 'Pose 16', 'Pose 8'],
            loop: true,
            duration: 1.0
        }],
        ['wave', {
            state: 'wave',
            // WAVE & KISS: Wave -> Blow Kiss (Pose 15) -> Wave
            poses: ['Pose 14', 'Pose 15', 'Pose 14'],
            loop: false,
            duration: 0.8
        }],
        ['heart', {
            state: 'heart',
            poses: ['Pose 2'], // Neutral pose to allow procedural arm override
            loop: false,
            duration: 3.0 // Hold long enough for the gesture
        }],
        ['sit', {
            state: 'sit',
            // Cute Sit
            poses: ['Pose 13'],
            loop: false,
            duration: 1.0
        }],
        ['special', {
            state: 'special',
            poses: ['Pose 16', 'Pose 9', 'Pose 16'],
            loop: false,
            duration: 0.8
        }],

        // ========== INDIVIDUAL POSES (Numbers Only) ==========
        ['pose1', { state: 'pose1', poses: ['Pose 1'], loop: false, duration: 3.0 }],
        ['pose2', { state: 'pose2', poses: ['Pose 2'], loop: false, duration: 3.0 }],
        ['pose3', { state: 'pose3', poses: ['Pose 3'], loop: false, duration: 3.0 }],
        ['pose4', { state: 'pose4', poses: ['Pose 4'], loop: false, duration: 3.0 }],
        ['pose5', { state: 'pose5', poses: ['Pose 5'], loop: false, duration: 3.0 }],
        ['pose6', { state: 'pose6', poses: ['Pose 6'], loop: false, duration: 3.0 }],
        ['pose7', { state: 'pose7', poses: ['Pose 7'], loop: false, duration: 3.0 }],
        ['pose8', { state: 'pose8', poses: ['Pose 8'], loop: false, duration: 3.0 }],
        ['pose9', { state: 'pose9', poses: ['Pose 9'], loop: false, duration: 3.0 }],
        ['pose10', { state: 'pose10', poses: ['Pose 10'], loop: false, duration: 3.0 }],
        ['pose11', { state: 'pose11', poses: ['Pose 11'], loop: false, duration: 3.0 }],
        ['pose12', { state: 'pose12', poses: ['Pose 12'], loop: false, duration: 3.0 }],
        ['pose13', { state: 'pose13', poses: ['Pose 13'], loop: false, duration: 3.0 }],
        ['pose14', { state: 'pose14', poses: ['Pose 14'], loop: false, duration: 3.0 }],
        ['pose15', { state: 'pose15', poses: ['Pose 15'], loop: false, duration: 3.0 }],
        ['pose16', { state: 'pose16', poses: ['Pose 16'], loop: false, duration: 3.0 }]
    ])

    /**
     * Start an animation
     */
    startAnimation(state: AnimationState): void {
        if (this.currentState === state && this.isPlaying) return

        this.currentState = state
        this.currentPoseIndex = 0
        this.elapsedTime = 0
        this.isPlaying = true

        const animation = this.animations.get(state)
        console.log(`🎬 Starting animation: ${state} - ${animation?.poses.length} poses - Loop: ${animation?.loop}`)
    }

    /**
     * Stop current animation
     */
    stopAnimation(): void {
        this.isPlaying = false
    }

    /**
     * Update animation (call every frame)
     */
    update(vrm: VRM, deltaTime: number): void {
        if (!this.isPlaying || !vroidPoseLoader.isLoaded()) return

        const animation = this.animations.get(this.currentState)
        if (!animation) return

        this.elapsedTime += deltaTime

        // Check if we should advance to next pose
        if (this.elapsedTime >= animation.duration) {
            this.elapsedTime = 0
            this.currentPoseIndex++

            // Handle loop or end
            if (this.currentPoseIndex >= animation.poses.length) {
                if (animation.loop) {
                    this.currentPoseIndex = 0
                } else {
                    // Animation finished, return to idle
                    this.isPlaying = false
                    this.startAnimation('idle')
                    return
                }
            }
        }

        // Calculate interpolation between current and next pose
        const currentPose = animation.poses[this.currentPoseIndex]
        const nextPoseIndex = (this.currentPoseIndex + 1) % animation.poses.length
        const nextPose = animation.poses[nextPoseIndex]

        // Interpolation factor (0 to 1)
        const t = this.elapsedTime / animation.duration

        // Apply interpolated pose
        if (animation.loop || nextPoseIndex > this.currentPoseIndex) {
            vroidPoseLoader.interpolatePoses(vrm, currentPose, nextPose, t)
        } else {
            // Last pose in non-looping animation, just hold it
            vroidPoseLoader.applyPose(vrm, currentPose, 1.0)
        }
    }

    /**
     * Get current animation state
     */
    getCurrentState(): AnimationState {
        return this.currentState
    }

    /**
     * Check if animation is playing
     */
    isAnimationPlaying(): boolean {
        return this.isPlaying
    }

    /**
     * Map gesture/voice command to animation state
     */
    mapGestureToAnimation(gesture: string): AnimationState | null {
        const mapping: { [key: string]: AnimationState } = {
            // ========== MULTI-POSE ANIMATIONS (Priority) ==========
            // Dance sequence (10 poses total!)
            'dance': 'dancing',
            'dancing': 'dancing',
            'dancer': 'dancing',
            'boogie': 'dancing',
            'party': 'dancing',
            'move': 'dancing', // Fix: Map generic "move" gesture to dance
            'moves': 'dancing',
            'groove': 'dancing', // Fix: Map "groove" to dance

            // Walk cycle (6 poses)
            'walk': 'walking',
            'walking': 'walking',
            'step': 'walking', // Fix: Map "step" to walking

            // Spin/rotate
            'spin': 'spinning',
            'spinning': 'spinning',
            'rotate': 'spinning',
            'twirl': 'spinning',
            'twirling': 'spinning',

            // Jump with realistic physics (6 poses)
            'jump': 'jumping',
            'jumping': 'jumping',
            'bounce': 'jumping',
            'bouncing': 'jumping',
            'hop': 'jumping',

            // Excited (6 poses)
            'excited': 'excited',
            'hyper': 'excited',

            // ENERGETIC - ALL 16 POSES!
            'energetic': 'energetic',
            'energitic': 'energetic', // Fix: Handle common typo
            'energy': 'energetic',
            'crazy': 'energetic',
            'wild': 'energetic',
            'everything': 'energetic',
            'active': 'energetic',
            'dynamic': 'energetic',

            // Celebrate (8 poses including pose 16!)
            'celebrate': 'celebrate',
            'celebration': 'celebrate',
            'victory': 'celebrate',
            'yay': 'celebrate',
            'cheer': 'celebrate',
            'hooray': 'celebrate',
            'win': 'celebrate',

            // Stretch (6 poses)
            'stretch': 'stretch',
            'stretching': 'stretch',
            'yoga': 'stretch',

            // Relax (6 poses including pose 16)
            'relax': 'relax',
            'relaxing': 'relax',
            'calm': 'relax',
            'chill': 'relax',
            'rest': 'relax',

            // Modeling/Photo poses (7 poses including pose 16)
            'pose': 'modeling',
            'poses': 'modeling',
            'model': 'modeling',
            'modeling': 'modeling',
            'photo': 'modeling',
            'picture': 'modeling',
            'strike': 'modeling',

            // Flex/Show off (5 poses including pose 16)
            'flex': 'flex',
            'flexing': 'flex',
            'show': 'flex',
            'showoff': 'flex',
            'strong': 'flex',

            // Sit/kneel
            'sit': 'sit',
            'sitting': 'sit',
            'seat': 'sit',
            'kneel': 'sit',
            'kneeling': 'sit',
            'down': 'sit',

            // Wave gesture
            'wave': 'wave',
            'waving': 'wave',
            'hi': 'wave',
            'hello': 'wave',
            'hey': 'wave',
            'greet': 'wave',

            // Heart gesture
            'heart': 'heart',
            'hearts': 'heart',
            'love': 'heart',

            // Special (pose 16 featured!)
            'special': 'special',

            // ========== INDIVIDUAL POSES (Numbers Only) ==========
            'pose1': 'pose1', 'pose 1': 'pose1', '1': 'pose1',
            'pose2': 'pose2', 'pose 2': 'pose2', '2': 'pose2',
            'pose3': 'pose3', 'pose 3': 'pose3', '3': 'pose3',
            'pose4': 'pose4', 'pose 4': 'pose4', '4': 'pose4',
            'pose5': 'pose5', 'pose 5': 'pose5', '5': 'pose5',
            'pose6': 'pose6', 'pose 6': 'pose6', '6': 'pose6',
            'pose7': 'pose7', 'pose 7': 'pose7', '7': 'pose7',
            'pose8': 'pose8', 'pose 8': 'pose8', '8': 'pose8',
            'pose9': 'pose9', 'pose 9': 'pose9', '9': 'pose9',
            'pose10': 'pose10', 'pose 10': 'pose10', '10': 'pose10',
            'pose11': 'pose11', 'pose 11': 'pose11', '11': 'pose11',
            'pose12': 'pose12', 'pose 12': 'pose12', '12': 'pose12',
            'pose13': 'pose13', 'pose 13': 'pose13', '13': 'pose13',
            'pose14': 'pose14', 'pose 14': 'pose14', '14': 'pose14',
            'pose15': 'pose15', 'pose 15': 'pose15', '15': 'pose15',
            'pose16': 'pose16', 'pose 16': 'pose16', '16': 'pose16'
        }

        return mapping[gesture.toLowerCase()] || null
    }
}

// Export singleton instance
export const poseAnimationManager = new PoseAnimationManager()
