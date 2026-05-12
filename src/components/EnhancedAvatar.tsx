import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { VRM } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { useConversationStore } from '../store/conversationStore'
import { animationController } from '../services/animationController'

export default function EnhancedAvatar() {
  const group = useRef<THREE.Group>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarType, setAvatarType] = useState<'vrm' | 'glb'>('vrm')
  const [vrm, setVRM] = useState<VRM | null>(null)
  const { currentEmotion, currentGesture, isSpeaking } = useConversationStore()

  // Animation state
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const headRef = useRef<THREE.Object3D | null>(null)
  const leftArmRef = useRef<THREE.Object3D | null>(null)
  const rightArmRef = useRef<THREE.Object3D | null>(null)
  const spineRef = useRef<THREE.Object3D | null>(null)

  // Animation timers
  const idleTimer = useRef(0)
  const blinkTimer = useRef(0)
  const mouthTimer = useRef(0)

  // Load avatar on mount
  useEffect(() => {
    const stored = localStorage.getItem('avatar_url')
    if (stored) {
      const fileType = stored.toLowerCase().endsWith('.vrm') ? 'vrm' : 'glb'
      setAvatarType(fileType)
      setAvatarUrl(stored)
    } else {
      // Default to anime-style VRM avatar
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
          // Rotate to face camera
          VRMUtils.rotateVRM0(vrmModel)
          setVRM(vrmModel)

          // Get bones for animation
          headRef.current = vrmModel.humanoid.getRawBoneNode('head')
          leftArmRef.current = vrmModel.humanoid.getRawBoneNode('leftUpperArm')
          rightArmRef.current = vrmModel.humanoid.getRawBoneNode('rightUpperArm')
          spineRef.current = vrmModel.humanoid.getRawBoneNode('spine')

          console.log('VRM model loaded successfully')
        }
      },
      (progress) => {
        console.log('Loading VRM:', (progress.loaded / progress.total) * 100 + '%')
      },
      (error) => {
        console.error('Error loading VRM:', error)
      }
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

  // Update animation based on conversation state
  useEffect(() => {
    if (isSpeaking) {
      animationController.onSpeaking()
    } else {
      animationController.onIdle()
    }
  }, [isSpeaking])

  // Handle gesture changes
  useEffect(() => {
    if (currentGesture && currentGesture !== 'none') {
      animationController.playGesture(currentGesture)
    }
  }, [currentGesture])

  // Handle emotion changes with VRM expressions
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

      // Reset all expressions
      Object.keys(vrm.expressionManager.expressionMap).forEach(key => {
        vrm.expressionManager?.setValue(key, 0)
      })

      // Set new expression
      vrm.expressionManager.setValue(expression, 1.0)
    }
  }, [currentEmotion, vrm])

  // Main animation loop
  useFrame((state, delta) => {
    if (!group.current) return

    idleTimer.current += delta
    blinkTimer.current += delta
    mouthTimer.current += delta

    // Update VRM
    if (vrm) {
      vrm.update(delta)

      // Automatic blinking
      if (blinkTimer.current > 3) {
        blinkTimer.current = 0
        if (vrm.expressionManager) {
          vrm.expressionManager.setValue('blink', 1.0)
          setTimeout(() => {
            vrm.expressionManager?.setValue('blink', 0)
          }, 150)
        }
      }

      // Lip sync when speaking
      if (currentAnimation === 'speaking' && vrm.expressionManager) {
        const mouthValue = Math.abs(Math.sin(mouthTimer.current * 8)) * 0.7
        vrm.expressionManager.setValue('aa', mouthValue)
      } else if (vrm.expressionManager) {
        vrm.expressionManager.setValue('aa', 0)
      }

      // Look at camera
      if (vrm.lookAt) {
        const targetPosition = new THREE.Vector3(
          Math.sin(idleTimer.current * 0.5) * 0.3,
          1.5 + Math.sin(idleTimer.current * 0.3) * 0.2,
          5
        )
        const targetObject = new THREE.Object3D()
        targetObject.position.copy(targetPosition)
        vrm.lookAt.target = targetObject
      }
    }

    // Idle breathing animation
    const breathIntensity = Math.sin(idleTimer.current * 2) * 0.015
    group.current.position.y = breathIntensity

    // Body sway
    if (spineRef.current) {
      spineRef.current.rotation.z = Math.sin(idleTimer.current * 0.8) * 0.02
    }

    // Head movement
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
          // Subtle idle movement
          if (!vrm?.lookAt) {
            headRef.current.rotation.y = Math.sin(idleTimer.current * 0.5) * 0.08
            headRef.current.rotation.x = Math.sin(idleTimer.current * 0.3) * 0.05
          }
      }
    }

    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
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
          group.current.position.y = jumpOffset + breathIntensity
          // Raise arms while jumping
          leftArmRef.current.rotation.x = -jumpOffset
          rightArmRef.current.rotation.x = -jumpOffset
          break
        case 'dance':
          // Dancing with arm movements
          const danceTime = state.clock.elapsedTime * 2
          leftArmRef.current.rotation.z = Math.sin(danceTime) * 1.0 + 0.5
          leftArmRef.current.rotation.x = Math.cos(danceTime * 1.5) * 0.5
          rightArmRef.current.rotation.z = Math.sin(danceTime + Math.PI) * 1.0 - 0.5
          rightArmRef.current.rotation.x = Math.cos(danceTime * 1.5 + Math.PI) * 0.5

          // Body movement
          if (spineRef.current) {
            spineRef.current.rotation.z = Math.sin(danceTime) * 0.15
            spineRef.current.rotation.y = Math.sin(danceTime * 0.5) * 0.2
          }
          break
        default:
          // Natural arm position
          leftArmRef.current.rotation.z = 0.05
          leftArmRef.current.rotation.x = 0.1
          rightArmRef.current.rotation.z = -0.05
          rightArmRef.current.rotation.x = 0.1
      }
    }
  })

  // Fallback to simple cube if no model
  if (!avatarUrl) {
    return (
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
    )
  }

  // Render VRM model
  if (avatarType === 'vrm' && vrm) {
    return (
      <group ref={group} position={[0, 0, 0]}>
        <primitive object={vrm.scene} />
      </group>
    )
  }

  // Fallback to GLB (Ready Player Me)
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
