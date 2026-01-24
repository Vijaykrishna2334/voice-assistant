import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import AniLevelAvatar from './AniLevelAvatar'
import './Scene.css'

// Room environment component
function Room() {
  return (
    <group>
      {/* Floor - Wood/Dark texture feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial
          color="#1a1520"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle grid on floor */}
      <gridHelper
        args={[15, 30, '#2a2540', '#1a1830']}
        position={[0, 0.001, 0]}
      />

      {/* Glowing platform ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.9, 1.3, 64]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Inner glow circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <circleGeometry args={[0.9, 64]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Back wall (subtle) */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial
          color="#12101a"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Side walls (ambient occlusion feel) */}
      <mesh position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          color="#0f0d15"
          roughness={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          color="#0f0d15"
          roughness={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Decorative light strips on walls */}
      <mesh position={[0, 0.1, -4.9]}>
        <boxGeometry args={[8, 0.02, 0.1]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.6} />
      </mesh>

      {/* Ambient particles (floating dust) */}
      <FloatingParticles />
    </group>
  )
}

// Floating ambient particles
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 50

  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = Math.random() * 4
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#6366f1"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

export default function Scene() {
  return (
    <div className="scene-container">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        {/* Dark room background */}
        <color attach="background" args={['#0a0812']} />
        <fog attach="fog" args={['#0a0812', 4, 15]} />

        <PerspectiveCamera makeDefault position={[-0.8, 1.4, 2.5]} fov={45} />

        {/* Lighting optimized for room feel */}
        <ambientLight intensity={0.3} />

        {/* Main key light */}
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        {/* Accent lights */}
        <pointLight position={[-3, 3, -2]} intensity={0.4} color="#6366f1" />
        <pointLight position={[3, 2, 2]} intensity={0.3} color="#ec4899" />
        <pointLight position={[0, 0.5, 2]} intensity={0.2} color="#ffffff" />

        {/* Rim light from behind */}
        <spotLight
          position={[0, 3, -3]}
          intensity={0.5}
          color="#4f46e5"
          angle={0.5}
          penumbra={1}
        />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Room environment */}
        <Room />

        {/* Avatar */}
        <AniLevelAvatar />

        {/* Contact shadows for grounding */}
        <ContactShadows
          opacity={0.6}
          scale={10}
          blur={2}
          far={4}
          resolution={512}
          color="#000000"
        />

        {/* Camera Controls */}
        <OrbitControls
          target={[-0.5, 1.2, 0]}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          minDistance={1.5}
          maxDistance={5}
          enablePan={true}
          panSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
