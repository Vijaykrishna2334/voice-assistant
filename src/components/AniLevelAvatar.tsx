import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { VRM } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { useConversationStore } from '../store/conversationStore'
import { animationController } from '../services/animationController'
import { advancedLipSyncService, type LipSyncData } from '../services/advancedLipSyncService'
import { continuousGestureService } from '../services/continuousGestureService'
import { layeredAnimationManager } from '../services/layeredAnimationManager'

/**
 * Ani-Level Avatar Component
 * Features always-alive animations with layered blending
 */
export default function AniLevelAvatar() {
  const group = useRef<THREE.Group>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarType, setAvatarType] = useState<'vrm' | 'glb'>('vrm')
  const [vrm, setVRM] = useState<VRM | null>(null)

  const { currentEmotion, currentGesture, isSpeaking, messages } = useConversationStore()

  // Animation state
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const headRef = useRef<THREE.Object3D | null>(null)
  const leftArmRef = useRef<THREE.Object3D | null>(null)
  const rightArmRef = useRef<THREE.Object3D | null>(null)
  const spineRef = useRef<THREE.Object3D | null>(null)
  const leftHandRef = useRef<THREE.Object3D | null>(null)
  const rightHandRef = useRef<THREE.Object3D | null>(null)

  // Animation timers
  const idleTimer = useRef(0)
  const lastBlinkTime = useRef(0)
  const speechStartTime = useRef(0)
  const currentLipSyncData = useRef<LipSyncData | null>(null)

  // Micro-movement seeds for natural variation
  const headSeed = useRef(Math.random() * 100)
  const bodySeed = useRef(Math.random() * 100)

  // Load avatar
  useEffect(() => {
    const stored = localStorage.getItem('avatar_url')
    if (stored) {
      const fileType = stored.toLowerCase().endsWith('.vrm') ? 'vrm' : 'glb'
      setAvatarType(fileType)
      setAvatarUrl(stored)
    } else {
      setAvatarType('vrm')
      setAvatarUrl('https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm')
    }
  }, [])

  // Load VRM model
  useEffect(() => {
    if (!avatarUrl || avatarType !== 'vrm') return

    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      avatarUrl,
      (gltf) => {
        const vrmModel = gltf.userData.vrm as VRM
        if (vrmModel) {
          VRMUtils.rotateVRM0(vrmModel)
          setVRM(vrmModel)

          // Get bones for animation
          headRef.current = vrmModel.humanoid.getRawBoneNode('head')
          leftArmRef.current = vrmModel.humanoid.getRawBoneNode('leftUpperArm')
          rightArmRef.current = vrmModel.humanoid.getRawBoneNode('rightUpperArm')
          spineRef.current = vrmModel.humanoid.getRawBoneNode('spine')
          leftHandRef.current = vrmModel.humanoid.getRawBoneNode('leftHand')
          rightHandRef.current = vrmModel.humanoid.getRawBoneNode('rightHand')

          console.log('VRM loaded - Ani-level animations ready!')
        }
      },
      undefined,
      (error) => console.error('Error loading VRM:', error)
    )

    return () => {
      if (vrm) {
        VRMUtils.deepDispose(vrm.scene)
      }
    }
  }, [avatarUrl, avatarType])

  // Subscribe to animation controller
  useEffect(() => {
    const unsubscribe = animationController.subscribe((state) => {
      setCurrentAnimation(state.current)
    })
    return unsubscribe
  }, [])

  // Handle conversation state
  useEffect(() => {
    if (isSpeaking) {
      animationController.onSpeaking()
      layeredAnimationManager.activateLayer('speaking', 1.0)

      // Generate lip sync data from last message
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        const lipSyncData = advancedLipSyncService.generateFromText(lastMessage.content, 5.0)
        currentLipSyncData.current = lipSyncData
        speechStartTime.current = Date.now() / 1000

        // Start gesture based on emotion
        const gestureStyle = lastMessage.gestureStyle || 'normal'
        continuousGestureService.startGesture(gestureStyle)
      }
    } else {
      animationController.onIdle()
      layeredAnimationManager.deactivateLayer('speaking')
      currentLipSyncData.current = null
      continuousGestureService.stopGesture()
    }
  }, [isSpeaking, messages])

  // Handle gesture changes
  useEffect(() => {
    if (currentGesture && currentGesture !== 'none') {
      animationController.playGesture(currentGesture)
      layeredAnimationManager.activateLayer('action', 1.0)
    } else {
      layeredAnimationManager.deactivateLayer('action')
    }
  }, [currentGesture])

  // Handle emotion changes
  useEffect(() => {
    if (currentEmotion && vrm?.expressionManager) {
      const expressionMap: { [key: string]: string } = {
        happy: 'happy',
        sad: 'sad',
        excited: 'happy',
        thoughtful: 'neutral',
        loving: 'happy',
        neutral: 'neutral'
      }

      const expression = expressionMap[currentEmotion] || 'neutral'
      const lastMessage = messages[messages.length - 1]
      const intensity = lastMessage?.emotionIntensity || 0.8

      // Reset all expressions
      Object.keys(vrm.expressionManager.expressionMap).forEach(key => {
        vrm.expressionManager?.setValue(key, 0)
      })

      // Set new expression with intensity
      vrm.expressionManager.setValue(expression, Math.min(intensity, 1.0))
      layeredAnimationManager.activateLayer('expression', intensity)
    }
  }, [currentEmotion, vrm, messages])

  // MAIN ANIMATION LOOP - This is where the magic happens!
  useFrame((state, delta) => {
    if (!group.current) return

    idleTimer.current += delta

    // Update VRM
    if (vrm) {
      vrm.update(delta)

      // ========== ALWAYS-ALIVE LAYER 1: BREATHING ==========
      const breathingValue = layeredAnimationManager.getBreathingValue(idleTimer.current)
      group.current.position.y = breathingValue

      // ========== ALWAYS-ALIVE LAYER 2: BODY SWAY ==========
      const swayValue = layeredAnimationManager.getSwayValue(idleTimer.current)
      if (spineRef.current) {
        spineRef.current.rotation.z = swayValue
        spineRef.current.rotation.y = swayValue * 0.5
      }

      // ========== ALWAYS-ALIVE LAYER 3: MICRO-MOVEMENTS ==========
      const headMicroX = layeredAnimationManager.getMicroMovement(idleTimer.current, headSeed.current)
      const headMicroY = layeredAnimationManager.getMicroMovement(idleTimer.current, headSeed.current + 50)
      const bodyMicro = layeredAnimationManager.getMicroMovement(idleTimer.current, bodySeed.current)

      // ========== ALWAYS-ALIVE LAYER 4: AUTOMATIC BLINKING ==========
      if (vrm.expressionManager && layeredAnimationManager.shouldBlink(idleTimer.current, lastBlinkTime.current)) {
        vrm.expressionManager.setValue('blink', 1.0)
        setTimeout(() => {
          vrm.expressionManager?.setValue('blink', 0)
        }, 150)
        lastBlinkTime.current = idleTimer.current
      }

      // ========== LAYER 5: ADVANCED LIP-SYNC ==========
      if (currentLipSyncData.current && isSpeaking && vrm.expressionManager) {
        const speechTime = Date.now() / 1000 - speechStartTime.current
        const { viseme, weight } = advancedLipSyncService.getVisemeAtTime(currentLipSyncData.current, speechTime)
        const expressions = advancedLipSyncService.getVRMExpressionValues(viseme, weight)

        // Apply lip-sync expressions
        Object.entries(expressions).forEach(([key, value]) => {
          vrm.expressionManager?.setValue(key, value)
        })
      } else if (vrm.expressionManager) {
        // Close mouth when not speaking
        vrm.expressionManager.setValue('aa', 0)
      }

      // ========== LAYER 6: EYE TRACKING ==========
      if (vrm.lookAt) {
        const targetPosition = new THREE.Vector3(
          Math.sin(idleTimer.current * 0.5) * 0.4 + headMicroX * 10,
          1.5 + Math.sin(idleTimer.current * 0.3) * 0.2 + headMicroY * 10,
          5
        )
        const targetObject = new THREE.Object3D()
        targetObject.position.copy(targetPosition)
        vrm.lookAt.target = targetObject
      }

      // ========== LAYER 7: CONTINUOUS HAND GESTURES ==========
      const handPose = continuousGestureService.getCurrentPose(idleTimer.current)
      if (handPose && leftArmRef.current && rightArmRef.current) {
        // Apply with natural variation
        const variedPose = continuousGestureService.addNaturalVariation(handPose, idleTimer.current)

        leftArmRef.current.rotation.x = variedPose.leftArm.shoulder.x
        leftArmRef.current.rotation.y = variedPose.leftArm.shoulder.y
        leftArmRef.current.rotation.z = variedPose.leftArm.shoulder.z

        rightArmRef.current.rotation.x = variedPose.rightArm.shoulder.x
        rightArmRef.current.rotation.y = variedPose.rightArm.shoulder.y
        rightArmRef.current.rotation.z = variedPose.rightArm.shoulder.z
      }

      // ========== LAYER 8: HEAD MOVEMENT ==========
      if (headRef.current) {
        switch (currentAnimation) {
          case 'nod':
            headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.4
            break
          case 'shake':
            headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.4
            break
          case 'think':
            headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
            headRef.current.rotation.x = -0.15
            break
          default:
            // Subtle idle + micro-movements
            if (!vrm?.lookAt) {
              headRef.current.rotation.y = Math.sin(idleTimer.current * 0.5) * 0.08 + headMicroX
              headRef.current.rotation.x = Math.sin(idleTimer.current * 0.3) * 0.05 + headMicroY
              headRef.current.rotation.z = bodyMicro * 0.5
            }
        }
      }

      // ========== LAYER 9: SPECIAL GESTURES ==========
      if (leftArmRef.current && rightArmRef.current && !handPose) {
        switch (currentAnimation) {
          case 'wave':
            rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.8 - 0.3
            rightArmRef.current.rotation.x = -1.0
            break
          case 'heart':
            leftArmRef.current.rotation.z = 0.8
            leftArmRef.current.rotation.x = -0.8
            rightArmRef.current.rotation.z = -0.8
            rightArmRef.current.rotation.x = -0.8
            break
          case 'jump':
            const jumpOffset = Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.6
            group.current.position.y = jumpOffset + breathingValue
            leftArmRef.current.rotation.x = -jumpOffset
            rightArmRef.current.rotation.x = -jumpOffset
            break
          case 'dance':
            const danceTime = state.clock.elapsedTime * 2
            leftArmRef.current.rotation.z = Math.sin(danceTime) * 1.0 + 0.5
            leftArmRef.current.rotation.x = Math.cos(danceTime * 1.5) * 0.5
            rightArmRef.current.rotation.z = Math.sin(danceTime + Math.PI) * 1.0 - 0.5
            rightArmRef.current.rotation.x = Math.cos(danceTime * 1.5 + Math.PI) * 0.5

            if (spineRef.current) {
              spineRef.current.rotation.z = Math.sin(danceTime) * 0.15 + swayValue
              spineRef.current.rotation.y = Math.sin(danceTime * 0.5) * 0.2
            }
            break
        }
      }

      // Update idle variations
      layeredAnimationManager.updateIdleVariation(delta)
    }
  })

  // Fallback
  if (!avatarUrl) {
    return (
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
    )
  }

  // Render VRM
  if (avatarType === 'vrm' && vrm) {
    return (
      <group ref={group} position={[0, 0, 0]}>
        <primitive object={vrm.scene} />
      </group>
    )
  }

  // Fallback to GLB
  if (avatarType === 'glb') {
    const { scene } = useGLTF(avatarUrl)
    return (
      <group ref={group} position={[0, 0, 0]}>
        <primitive object={scene} />
      </group>
    )
  }

  return null
}
