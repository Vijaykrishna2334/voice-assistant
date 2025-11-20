import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import AniLevelAvatar from './AniLevelAvatar'
import './Scene.css'

export default function Scene() {
  return (
    <div className="scene-container">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 1.6, 3]} fov={50} />

        {/* Lighting optimized for anime/VRM characters */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {/* Fill light for softer shadows */}
        <pointLight position={[-3, 3, -2]} intensity={0.4} color="#ffffff" />
        {/* Rim light for depth */}
        <pointLight position={[0, 2, -3]} intensity={0.3} color="#aaccff" />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Ani-Level Avatar - Always Alive! */}
        <AniLevelAvatar />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#8b7d6b"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Camera Controls */}
        <OrbitControls
          target={[0, 1.5, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={6}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
