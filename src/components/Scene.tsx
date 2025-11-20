import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import Avatar from './Avatar'
import './Scene.css'

export default function Scene() {
  return (
    <div className="scene-container">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.6, 3]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Avatar */}
        <Avatar />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#8b7d6b" />
        </mesh>

        {/* Camera Controls */}
        <OrbitControls
          target={[0, 1.5, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={6}
          enablePan={false}
        />
      </Canvas>
    </div>
  )
}
