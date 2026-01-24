import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { VRM } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import './AvatarSelector.css'

// Available avatars configuration
const AVATARS = [
    {
        id: 'aria',
        name: 'Aria',
        file: '/Aria.vrm',
        description: 'Your AI companion with charm and intelligence',
        color: '#6366f1'
    },
    {
        id: 'ani',
        name: 'Ani',
        file: '/ani_.vrm',
        description: 'Energetic and expressive assistant',
        color: '#ec4899'
    },
    {
        id: 'sample',
        name: 'Sample Avatar',
        file: '/AvatarSample_E.vrm',
        description: 'Classic VRM demonstration avatar',
        color: '#22c55e'
    }
]

interface AvatarSelectorProps {
    onSelect: (avatarFile: string, avatarName: string) => void
}

// 3D Avatar Preview with rotation
function AvatarPreview({ avatarUrl, isActive }: { avatarUrl: string; isActive: boolean }) {
    const group = useRef<THREE.Group>(null)
    const [vrm, setVRM] = useState<VRM | null>(null)
    const rotationSpeed = useRef(0)

    useEffect(() => {
        const loader = new GLTFLoader()
        loader.register((parser) => new VRMLoaderPlugin(parser))

        loader.load(
            avatarUrl,
            (gltf) => {
                const vrmModel = gltf.userData.vrm as VRM
                if (vrmModel) {
                    VRMUtils.rotateVRM0(vrmModel)
                    setVRM(vrmModel)
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
    }, [avatarUrl])

    // Smooth 360° rotation when active
    useFrame((state, delta) => {
        if (!group.current) return

        // Accelerate when active, decelerate when not
        const targetSpeed = isActive ? 0.8 : 0
        rotationSpeed.current = THREE.MathUtils.lerp(rotationSpeed.current, targetSpeed, delta * 3)

        group.current.rotation.y += rotationSpeed.current * delta

        // Gentle floating animation
        if (isActive) {
            group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03
        }

        if (vrm) {
            vrm.update(delta)

            // Idle breathing
            const breathe = Math.sin(state.clock.elapsedTime * 1.5) * 0.01
            group.current.position.y += breathe
        }
    })

    if (!vrm) {
        return (
            <mesh>
                <boxGeometry args={[0.5, 1.5, 0.3]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        )
    }

    return (
        <group ref={group} position={[0, 0, 0]}>
            <primitive object={vrm.scene} />
        </group>
    )
}

// Room environment floor
function RoomFloor() {
    return (
        <>
            {/* Main floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Subtle grid pattern */}
            <gridHelper
                args={[20, 40, '#2a2a4e', '#1a1a3e']}
                position={[0, 0.001, 0]}
            />

            {/* Glowing ring under avatar */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[0.8, 1.2, 64]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </>
    )
}

export default function AvatarSelector({ onSelect }: AvatarSelectorProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [, setLoadingProgress] = useState(0)

    const currentAvatar = AVATARS[currentIndex]

    // Simulate loading progress
    useEffect(() => {
        setLoadingProgress(0)
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + Math.random() * 30
            })
        }, 100)
        return () => clearInterval(interval)
    }, [currentIndex])

    const goToNext = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => (prev + 1) % AVATARS.length)
        setTimeout(() => setIsTransitioning(false), 500)
    }

    const goToPrev = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => (prev - 1 + AVATARS.length) % AVATARS.length)
        setTimeout(() => setIsTransitioning(false), 500)
    }

    const handleSelect = () => {
        onSelect(currentAvatar.file, currentAvatar.name)
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrev()
            if (e.key === 'ArrowRight') goToNext()
            if (e.key === 'Enter') handleSelect()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentIndex])

    return (
        <div className="avatar-selector">
            {/* Background gradient */}
            <div className="selector-background" />

            {/* Title */}
            <div className="selector-header">
                <h1>Choose Your AI Companion</h1>
                <p>Select an avatar to begin your journey</p>
            </div>

            {/* 3D Canvas with avatar */}
            <div className="avatar-stage">
                <Canvas gl={{ antialias: true, alpha: true }}>
                    <color attach="background" args={['#0a0a15']} />
                    <fog attach="fog" args={['#0a0a15', 5, 15]} />

                    <PerspectiveCamera makeDefault position={[0, 1.2, 3.5]} fov={40} />

                    {/* Lighting - no shadows to avoid WebGL shader issues */}
                    <ambientLight intensity={0.6} />
                    <directionalLight
                        position={[3, 5, 3]}
                        intensity={1.2}
                    />
                    <pointLight position={[-3, 3, -2]} intensity={0.5} color="#6366f1" />
                    <pointLight position={[3, 2, 2]} intensity={0.3} color="#ec4899" />

                    {/* Environment */}
                    <Environment preset="city" />

                    {/* Room floor */}
                    <RoomFloor />

                    {/* Avatar */}
                    <AvatarPreview
                        avatarUrl={currentAvatar.file}
                        isActive={!isTransitioning}
                    />

                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 3}
                        maxPolarAngle={Math.PI / 2}
                        target={[0, 1, 0]}
                    />
                </Canvas>

                {/* Navigation arrows */}
                <button
                    className="nav-arrow nav-prev"
                    onClick={goToPrev}
                    disabled={isTransitioning}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button
                    className="nav-arrow nav-next"
                    onClick={goToNext}
                    disabled={isTransitioning}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Avatar info panel */}
            <div className="avatar-info">
                <div
                    className="avatar-name-badge"
                    style={{ borderColor: currentAvatar.color }}
                >
                    <span
                        className="avatar-color-dot"
                        style={{ backgroundColor: currentAvatar.color }}
                    />
                    <h2>{currentAvatar.name}</h2>
                </div>
                <p className="avatar-description">{currentAvatar.description}</p>

                {/* Avatar dots indicator */}
                <div className="avatar-dots">
                    {AVATARS.map((avatar, index) => (
                        <button
                            key={avatar.id}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                                backgroundColor: index === currentIndex ? avatar.color : 'transparent',
                                borderColor: avatar.color
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Select button */}
            <button
                className="select-button"
                onClick={handleSelect}
                style={{
                    background: `linear-gradient(135deg, ${currentAvatar.color}, ${currentAvatar.color}88)`
                }}
            >
                <span>Select {currentAvatar.name}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Keyboard hint */}
            <div className="keyboard-hint">
                <span>← →</span> Navigate
                <span>Enter</span> Select
            </div>
        </div>
    )
}
