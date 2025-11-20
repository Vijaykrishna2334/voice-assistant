import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useConversationStore } from '../store/conversationStore'
import { animationController } from '../services/animationController'

export default function Avatar() {
  const group = useRef<THREE.Group>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const { currentEmotion, currentGesture, isSpeaking } = useConversationStore()

  // Animation state
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const headRef = useRef<THREE.Bone | null>(null)
  const leftArmRef = useRef<THREE.Bone | null>(null)
  const rightArmRef = useRef<THREE.Bone | null>(null)

  // Idle animation timer
  const idleTimer = useRef(0)

  // Get stored avatar URL or use default
  useEffect(() => {
    const stored = localStorage.getItem('avatar_url')
    if (stored) {
      setAvatarUrl(stored)
    } else {
      // Default Ready Player Me avatar (female)
      setAvatarUrl('https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb')
    }
  }, [])

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

  // Handle emotion changes
  useEffect(() => {
    if (currentEmotion) {
      animationController.setEmotion(currentEmotion as any)
    }
  }, [currentEmotion])

  // Animation loop
  useFrame((state, delta) => {
    if (!group.current) return

    idleTimer.current += delta

    // Idle breathing animation
    const breathIntensity = Math.sin(idleTimer.current * 2) * 0.01
    group.current.position.y = breathIntensity

    // Head movement based on animation
    if (headRef.current) {
      switch (currentAnimation) {
        case 'nod':
          headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.3
          break
        case 'shake':
          headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.3
          break
        case 'think':
          headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
          headRef.current.rotation.x = -0.2
          break
        default:
          // Subtle idle head movement
          headRef.current.rotation.y = Math.sin(idleTimer.current * 0.5) * 0.05
          headRef.current.rotation.x = Math.sin(idleTimer.current * 0.3) * 0.03
      }
    }

    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      switch (currentAnimation) {
        case 'wave':
          rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.5 - 1.5
          rightArmRef.current.rotation.x = 0.3
          break
        case 'heart':
          // Arms forming heart shape
          leftArmRef.current.rotation.z = 1.2
          leftArmRef.current.rotation.x = -0.5
          rightArmRef.current.rotation.z = -1.2
          rightArmRef.current.rotation.x = -0.5
          break
        case 'jump':
          const jumpOffset = Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.5
          group.current.position.y = jumpOffset
          break
        case 'dance':
          // Dancing motion
          leftArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.8
          rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.8
          if (headRef.current) {
            headRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3
          }
          break
        default:
          // Natural arm position
          leftArmRef.current.rotation.z = 0.1
          leftArmRef.current.rotation.x = 0
          rightArmRef.current.rotation.z = -0.1
          rightArmRef.current.rotation.x = 0
      }
    }

    // Speaking animation (mouth movement simulation via head bobbing)
    if (currentAnimation === 'speaking' && headRef.current) {
      headRef.current.rotation.x += Math.sin(state.clock.elapsedTime * 8) * 0.005
    }
  })

  // Find skeleton bones when model loads
  const onLoad = (gltf: any) => {
    const bones = gltf.scene.children[0]?.skeleton?.bones
    if (bones) {
      headRef.current = bones.find((bone: THREE.Bone) => bone.name.includes('Head'))
      leftArmRef.current = bones.find((bone: THREE.Bone) => bone.name.includes('LeftArm'))
      rightArmRef.current = bones.find((bone: THREE.Bone) => bone.name.includes('RightArm'))
    }
  }

  if (!avatarUrl) {
    return (
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
    )
  }

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={useGLTF(avatarUrl).scene} onLoad={onLoad} />
    </group>
  )
}

// Preload the model
useGLTF.preload('https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb')
