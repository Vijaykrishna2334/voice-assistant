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
import { speechService } from '../services/speechService'
import { layeredAnimationManager } from '../services/layeredAnimationManager'
import { poseAnimationManager } from '../services/poseAnimationManager'
import { vroidPoseLoader } from '../services/vroidPoseLoader'


/**
 * Ani-Level Avatar Component
 * Features always-alive animations with layered blending
 */
export default function AniLevelAvatar() {
  const group = useRef<THREE.Group>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarType, setAvatarType] = useState<'vrm' | 'glb'>('vrm')
  const [vrm, setVRM] = useState<VRM | null>(null)

  const { currentEmotion, currentGesture, isSpeaking, isListening, messages } = useConversationStore()

  // Animation state
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const headRef = useRef<THREE.Object3D | null>(null)
  const leftArmRef = useRef<THREE.Object3D | null>(null)
  const rightArmRef = useRef<THREE.Object3D | null>(null)
  const spineRef = useRef<THREE.Object3D | null>(null)
  const leftHandRef = useRef<THREE.Object3D | null>(null)
  const rightHandRef = useRef<THREE.Object3D | null>(null)
  const leftForeArmRef = useRef<THREE.Object3D | null>(null)
  const rightForeArmRef = useRef<THREE.Object3D | null>(null)

  // Animation timers
  const idleTimer = useRef(0)
  const lastBlinkTime = useRef(0)
  const speechStartTime = useRef(0)
  const currentLipSyncData = useRef<LipSyncData | null>(null)
  const jumpStartTime = useRef(0)
  const lastAnimationState = useRef('idle')

  // Micro-movement seeds for natural variation
  const headSeed = useRef(Math.random() * 100)
  const bodySeed = useRef(Math.random() * 100)

  // 🎵 Audio-reactive lip sync state
  const [audioVolume, setAudioVolume] = useState(0)

  // Load avatar - FORCE ARIA.VRM
  useEffect(() => {
    setAvatarType('vrm')
    setAvatarUrl('/Aria.vrm')
  }, [])

  // 🎵 Set up audio volume callback for lip sync
  useEffect(() => {
    speechService.setVolumeCallback((volume: number) => {
      setAudioVolume(volume)
    })
  }, [])

  // Load Poses & Set Default
  useEffect(() => {
    vroidPoseLoader.loadAllPoses().then(() => {
      poseAnimationManager.startAnimation('idle')
    })
  }, [])

  // 🔗 IFRAME COMMUNICATION - Allow external apps to control avatar
  useEffect(() => {
    const { setEmotion, setGesture } = useConversationStore.getState()

    const handleMessage = (event: MessageEvent) => {
      const { type, gesture, emotion, text } = event.data || {}

      if (type === 'gesture' && gesture) {
        console.log('📨 Received gesture command:', gesture)
        setGesture(gesture)
      }
      if (type === 'emotion' && emotion) {
        console.log('📨 Received emotion command:', emotion)
        setEmotion(emotion)
      }
      if (type === 'speak' && text) {
        console.log('📨 Received speak command:', text)
        // Could trigger TTS here if needed
      }
    }

    window.addEventListener('message', handleMessage)

    // Notify parent that avatar is ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'avatar-ready' }, '*')
      console.log('📤 Sent avatar-ready to parent')
    }

    return () => window.removeEventListener('message', handleMessage)
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

          headRef.current = vrmModel.humanoid.getRawBoneNode('head')
          leftArmRef.current = vrmModel.humanoid.getRawBoneNode('leftUpperArm')
          rightArmRef.current = vrmModel.humanoid.getRawBoneNode('rightUpperArm')
          spineRef.current = vrmModel.humanoid.getRawBoneNode('spine')
          leftHandRef.current = vrmModel.humanoid.getRawBoneNode('leftHand')
          rightHandRef.current = vrmModel.humanoid.getRawBoneNode('rightHand')
          leftForeArmRef.current = vrmModel.humanoid.getRawBoneNode('leftLowerArm')
          rightForeArmRef.current = vrmModel.humanoid.getRawBoneNode('rightLowerArm')

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

      if (poseAnimationManager.getCurrentState() !== 'idle' && !poseAnimationManager.getCurrentState().startsWith('pose')) {
        poseAnimationManager.startAnimation('idle')
      }

      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        const lipSyncData = advancedLipSyncService.generateFromText(lastMessage.content, 5.0)
        currentLipSyncData.current = lipSyncData
        speechStartTime.current = Date.now() / 1000

        const gestureStyle = lastMessage.gestureStyle || 'normal'
        continuousGestureService.startGesture(gestureStyle)
      }
    } else if (isListening) {
      if (!currentGesture || currentGesture === 'none') {
        layeredAnimationManager.activateLayer('attention', 1.0)
      }

      animationController.onIdle()
      layeredAnimationManager.deactivateLayer('speaking')
      currentLipSyncData.current = null
      continuousGestureService.stopGesture()

    } else {
      animationController.onIdle()
      layeredAnimationManager.deactivateLayer('speaking')
      layeredAnimationManager.deactivateLayer('attention')
      currentLipSyncData.current = null
      continuousGestureService.stopGesture()
    }
  }, [isSpeaking, isListening, messages])

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

      Object.keys(vrm.expressionManager.expressionMap).forEach(key => {
        vrm.expressionManager?.setValue(key, 0)
      })

      vrm.expressionManager.setValue(expression, Math.min(intensity, 1.0))
      layeredAnimationManager.activateLayer('expression', intensity)
    }
  }, [currentEmotion, vrm, messages])

  // Handle gesture changes
  useEffect(() => {
    if (currentGesture && currentGesture !== 'none') {
      const poseAnimation = poseAnimationManager.mapGestureToAnimation(currentGesture)

      if (poseAnimation) {
        poseAnimationManager.startAnimation(poseAnimation)
        layeredAnimationManager.activateLayer('action', 1.0)

        if (['dancing', 'spinning', 'jumping', 'excited', 'energetic', 'wave', 'heart', 'walking', 'modeling'].includes(poseAnimation)) {
          const timer = setTimeout(() => {
            console.log('🛑 Auto-stopping gesture to return to idle')
            poseAnimationManager.stopAnimation()
            layeredAnimationManager.deactivateLayer('action')
          }, 10000)
          return () => clearTimeout(timer)
        }

      } else {
        animationController.playGesture(currentGesture)
        layeredAnimationManager.activateLayer('action', 1.0)
      }
    } else {
      poseAnimationManager.stopAnimation()
      layeredAnimationManager.deactivateLayer('action')
    }
  }, [currentGesture])

  // ========== HEART VFX COMPONENT ==========
  function HeartEffect({ active }: { active: boolean }) {
    const heartsRef = useRef<THREE.Group>(null)

    const heartShape = new THREE.Shape()
    const x = 0, y = 0
    heartShape.moveTo(x + 0.25, y + 0.25)
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y)
    heartShape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35)
    heartShape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95)
    heartShape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35)
    heartShape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y)
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25)

    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 }
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
    geometry.center()

    useFrame((state) => {
      if (active && heartsRef.current) {
        const time = state.clock.elapsedTime
        const t = (time % 2.0) / 2.0

        const z = THREE.MathUtils.lerp(0.5, 4.0, t)
        const y = THREE.MathUtils.lerp(1.3, 1.5, t) + Math.sin(time * 5) * 0.1
        const scale = THREE.MathUtils.lerp(0.0, 1.0, Math.sin(t * Math.PI))

        heartsRef.current.position.set(0, y, z)
        heartsRef.current.scale.setScalar(scale * 0.5)

        heartsRef.current.rotation.z = Math.sin(time * 3) * 0.2 + Math.PI
        heartsRef.current.rotation.y = time * 2
      }
    })

    if (!active) return null

    return (
      <group ref={heartsRef}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#ff0033"
            emissive="#ff0033"
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      </group>
    )
  }

  // MAIN ANIMATION LOOP
  useFrame((state, delta) => {
    if (!group.current) return

    idleTimer.current += delta

    if (vrm) {
      vrm.update(delta)

      const breathingValue = layeredAnimationManager.getBreathingValue(idleTimer.current)
      group.current.position.y = breathingValue

      const swayValue = layeredAnimationManager.getSwayValue(idleTimer.current)
      if (spineRef.current) {
        spineRef.current.rotation.z = swayValue
        spineRef.current.rotation.y = swayValue * 0.5
      }

      const headMicroX = layeredAnimationManager.getMicroMovement(idleTimer.current, headSeed.current)
      const headMicroY = layeredAnimationManager.getMicroMovement(idleTimer.current, headSeed.current + 50)
      const bodyMicro = layeredAnimationManager.getMicroMovement(idleTimer.current, bodySeed.current)

      if (vrm.expressionManager && layeredAnimationManager.shouldBlink(idleTimer.current, lastBlinkTime.current)) {
        vrm.expressionManager.setValue('blink', 1.0)
        setTimeout(() => {
          vrm.expressionManager?.setValue('blink', 0)
        }, 150)
        lastBlinkTime.current = idleTimer.current
      }

      if (isSpeaking && vrm.expressionManager && audioVolume > 0) {
        const mouthOpen = Math.min(audioVolume * 1.2, 1.0)

        vrm.expressionManager.setValue('aa', mouthOpen * 0.8)
        vrm.expressionManager.setValue('oh', mouthOpen * 0.3)
        vrm.expressionManager.setValue('ih', mouthOpen * 0.2)
      } else if (vrm.expressionManager) {
        vrm.expressionManager.setValue('aa', 0)
        vrm.expressionManager.setValue('oh', 0)
        vrm.expressionManager.setValue('ih', 0)
      }

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

      // Get current pose state FIRST
      const currentPoseState = poseAnimationManager.getCurrentState()

      // SKIP pose application during jump - use procedural physics instead
      if (currentPoseState !== 'jumping') {
        poseAnimationManager.update(vrm, delta)
      }

      const isPosePlaying = poseAnimationManager.isAnimationPlaying()

      const handPose = continuousGestureService.getCurrentPose(idleTimer.current)
      if (!isPosePlaying && handPose && leftArmRef.current && rightArmRef.current) {
        const variedPose = continuousGestureService.addNaturalVariation(handPose, idleTimer.current)

        leftArmRef.current.rotation.x = variedPose.leftArm.shoulder.x
        leftArmRef.current.rotation.y = variedPose.leftArm.shoulder.y
        leftArmRef.current.rotation.z = variedPose.leftArm.shoulder.z

        rightArmRef.current.rotation.x = variedPose.rightArm.shoulder.x
        rightArmRef.current.rotation.y = variedPose.rightArm.shoulder.y
        rightArmRef.current.rotation.z = variedPose.rightArm.shoulder.z
      }

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
            if (!vrm?.lookAt) {
              headRef.current.rotation.y = Math.sin(idleTimer.current * 0.5) * 0.08 + headMicroX
              headRef.current.rotation.x = Math.sin(idleTimer.current * 0.3) * 0.05 + headMicroY
              headRef.current.rotation.z = bodyMicro * 0.5
            }
        }
      }

      if (!isPosePlaying && leftArmRef.current && rightArmRef.current && !handPose) {
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

      layeredAnimationManager.updateIdleVariation(delta)

      if (currentPoseState === 'spinning') {
        group.current.rotation.y += delta * 8.0
      } else {
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 5)
      }

      if (currentPoseState === 'walking') {
        group.current.position.z += delta * 1.5
        console.log('🚶 Walking! Z:', group.current.position.z.toFixed(2))

        group.current.position.y = breathingValue + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05

        if (group.current.position.z > 3.0) {
          console.log('🔄 Loop back')
          group.current.position.z = -2.0
        }
      } else if (currentPoseState !== 'jumping') {
        if (Math.abs(group.current.position.z) > 0.01) {
          group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 0, delta * 2)
        }
      }

      if (currentPoseState === 'heart' && leftArmRef.current && rightArmRef.current && leftForeArmRef.current && rightForeArmRef.current) {
        leftArmRef.current.rotation.z = -1.4
        leftArmRef.current.rotation.y = -0.5
        leftArmRef.current.rotation.x = -0.3

        leftForeArmRef.current.rotation.x = -2.0
        leftForeArmRef.current.rotation.y = 1.0
        leftForeArmRef.current.rotation.z = -0.2

        if (leftHandRef.current) {
          leftHandRef.current.rotation.x = -0.8
          leftHandRef.current.rotation.y = -0.5
          leftHandRef.current.rotation.z = 0.0
        }

        rightArmRef.current.rotation.z = 1.4
        rightArmRef.current.rotation.y = 0.5
        rightArmRef.current.rotation.x = -0.3

        rightForeArmRef.current.rotation.x = -2.0
        rightForeArmRef.current.rotation.y = -1.0
        rightForeArmRef.current.rotation.z = 0.2

        if (rightHandRef.current) {
          rightHandRef.current.rotation.x = -0.8
          rightHandRef.current.rotation.y = 0.5
          rightHandRef.current.rotation.z = 0.0
        }
      }

      // ========== REALISTIC HUMAN GIRL JUMP (NO POSES) ==========
      if (currentPoseState === 'jumping' && lastAnimationState.current !== 'jumping') {
        jumpStartTime.current = state.clock.elapsedTime
      }
      lastAnimationState.current = currentPoseState

      if (currentPoseState === 'jumping') {
        const timeSinceStart = state.clock.elapsedTime - jumpStartTime.current
        const singleJumpDuration = 1.5
        const jumpIndex = Math.floor(timeSinceStart / singleJumpDuration)
        const cycleProgress = (timeSinceStart % singleJumpDuration) / singleJumpDuration

        if (jumpIndex >= 2) {
          poseAnimationManager.stopAnimation()
        } else {
          let jumpY = 0
          let armSwingX = 0  // Forward/back swing
          let armSpreadZ = 0  // Side spread for balance
          let spineForward = 0

          if (cycleProgress < 0.2) {
            // CROUCH - Arms swing back and down
            const t = cycleProgress / 0.2
            jumpY = -0.3 * t
            armSwingX = THREE.MathUtils.lerp(0, 0.8, t) // Arms back
            armSpreadZ = THREE.MathUtils.lerp(0, 0.3, t) // Slight spread
            spineForward = 0.2 * t
          } else if (cycleProgress < 0.25) {
            // EXPLOSIVE PUSH - Arms swing forward and up rapidly
            const t = (cycleProgress - 0.2) / 0.05
            jumpY = THREE.MathUtils.lerp(-0.3, 0.2, t)
            armSwingX = THREE.MathUtils.lerp(0.8, -2.5, t) // Swing up fast!
            armSpreadZ = THREE.MathUtils.lerp(0.3, 0.5, t) // Spread wider
            spineForward = THREE.MathUtils.lerp(0.2, -0.1, t)
          } else if (cycleProgress < 0.5) {
            // RISE - Arms reach peak height, spread for balance
            const t = (cycleProgress - 0.25) / 0.25
            const height = Math.pow(Math.sin(t * Math.PI * 0.5), 0.7) * 1.4
            jumpY = THREE.MathUtils.lerp(0.2, height, t)
            armSwingX = -2.5 // Arms up high
            armSpreadZ = THREE.MathUtils.lerp(0.5, 0.8, t) // Wide spread
            spineForward = -0.1
          } else if (cycleProgress < 0.6) {
            // PEAK - Hold arms up and out
            jumpY = 1.4
            armSwingX = -2.5
            armSpreadZ = 0.8
            spineForward = -0.1
          } else if (cycleProgress < 0.8) {
            // FALL - Arms start coming down, stay spread
            const t = (cycleProgress - 0.6) / 0.2
            const fallCurve = 1.0 - Math.pow(t, 1.5)
            jumpY = 1.4 * fallCurve
            armSwingX = THREE.MathUtils.lerp(-2.5, -0.5, t) // Lower arms
            armSpreadZ = 0.8 // Keep spread for landing
            spineForward = THREE.MathUtils.lerp(-0.1, 0.15, t)
          } else if (cycleProgress < 0.95) {
            // LAND - Arms down and forward for balance
            const t = (cycleProgress - 0.8) / 0.15
            const impactCurve = Math.sin(t * Math.PI)
            jumpY = -0.35 * impactCurve
            armSwingX = THREE.MathUtils.lerp(-0.5, 0.3, t) // Forward for balance
            armSpreadZ = THREE.MathUtils.lerp(0.8, 0.4, t) // Bring in slightly
            spineForward = 0.3 * impactCurve
          } else {
            // RECOVER - Return to neutral
            const t = (cycleProgress - 0.95) / 0.05
            jumpY = THREE.MathUtils.lerp(-0.35, 0, t)
            armSwingX = THREE.MathUtils.lerp(0.3, 0, t)
            armSpreadZ = THREE.MathUtils.lerp(0.4, 0, t)
            spineForward = THREE.MathUtils.lerp(0.3, 0, t)
          }

          group.current.position.y = jumpY + breathingValue

          if (spineRef.current) {
            spineRef.current.rotation.x = spineForward
          }

          // REALISTIC ARM MOVEMENT - Like a real human girl jumping!
          if (leftArmRef.current && rightArmRef.current) {
            // X rotation: forward/back swing
            leftArmRef.current.rotation.x = armSwingX
            rightArmRef.current.rotation.x = armSwingX

            // Z rotation: spread arms out to sides for balance
            leftArmRef.current.rotation.z = armSpreadZ
            rightArmRef.current.rotation.z = -armSpreadZ

            // Add slight asymmetry for natural look
            const asymmetry = Math.sin(cycleProgress * Math.PI * 2) * 0.15
            leftArmRef.current.rotation.y = asymmetry
            rightArmRef.current.rotation.y = -asymmetry
          }
        }

      } else {
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, breathingValue, delta * 10)

        if (spineRef.current) {
          spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, 0, delta * 5)
        }

        // Reset arms smoothly
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5)
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5)
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 5)
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, delta * 5)
          leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, 0, delta * 5)
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, 0, delta * 5)
        }
      }
    }
  })

  if (avatarType === 'vrm' && vrm) {
    return (
      <group ref={group} position={[0, 0, 0]}>
        <primitive object={vrm.scene} />
        <HeartEffect active={poseAnimationManager.getCurrentState() === 'heart'} />
      </group>
    )
  }

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
