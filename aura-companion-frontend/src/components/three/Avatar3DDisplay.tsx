import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Avatar } from '@/types/avatar';

interface Avatar3DDisplayProps {
    avatar: Avatar;
    isSpeaking?: boolean;
}

export interface Avatar3DRef {
    sendGesture: (gesture: string) => void;
    sendEmotion: (emotion: string) => void;
}

// VRM Avatar Model Component
function VRMAvatar({
    avatarFile,
    isSpeaking,
    gesture,
    emotion
}: {
    avatarFile: string;
    isSpeaking: boolean;
    gesture: string;
    emotion: string;
}) {
    const group = useRef<THREE.Group>(null);
    const [vrm, setVRM] = useState<VRM | null>(null);
    const idleTimer = useRef(0);

    // Load VRM model
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        loader.load(
            avatarFile,
            (gltf) => {
                const vrmModel = gltf.userData.vrm as VRM;
                if (vrmModel) {
                    VRMUtils.rotateVRM0(vrmModel);
                    setVRM(vrmModel);
                    console.log('✅ VRM model loaded:', avatarFile);
                }
            },
            undefined,
            (error) => console.error('Error loading VRM:', error)
        );

        return () => {
            if (vrm) {
                VRMUtils.deepDispose(vrm.scene);
            }
        };
    }, [avatarFile]);

    // Animation loop
    useFrame((state, delta) => {
        if (!group.current || !vrm) return;

        idleTimer.current += delta;
        vrm.update(delta);

        // Breathing animation
        const breathe = Math.sin(idleTimer.current * 1.5) * 0.01;
        group.current.position.y = breathe;

        // Gentle sway
        const sway = Math.sin(idleTimer.current * 0.5) * 0.02;
        group.current.rotation.z = sway;

        // Lip sync when speaking
        if (isSpeaking && vrm.expressionManager) {
            const mouthOpen = Math.abs(Math.sin(idleTimer.current * 15)) * 0.6;
            vrm.expressionManager.setValue('aa', mouthOpen);
            vrm.expressionManager.setValue('oh', mouthOpen * 0.3);
        } else if (vrm.expressionManager) {
            vrm.expressionManager.setValue('aa', 0);
            vrm.expressionManager.setValue('oh', 0);
        }

        // Apply emotion
        if (vrm.expressionManager && emotion) {
            const emotionMap: { [key: string]: string } = {
                'happy': 'happy',
                'sad': 'sad',
                'excited': 'happy',
                'loving': 'happy',
                'thoughtful': 'neutral',
                'neutral': 'neutral'
            };
            const expr = emotionMap[emotion] || 'neutral';
            vrm.expressionManager.setValue(expr, 0.7);
        }

        // Blinking
        if (vrm.expressionManager && Math.random() < 0.003) {
            vrm.expressionManager.setValue('blink', 1);
            setTimeout(() => {
                vrm.expressionManager?.setValue('blink', 0);
            }, 150);
        }
    });

    if (!vrm) {
        return (
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1.5, 32]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        );
    }

    return (
        <group ref={group} position={[0, 0, 0]}>
            <primitive object={vrm.scene} />
        </group>
    );
}

// Room Environment
function Room() {
    return (
        <>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial color="#1a1520" roughness={0.9} />
            </mesh>

            {/* Grid */}
            <gridHelper args={[15, 30, '#2a2540', '#1a1830']} position={[0, 0.001, 0]} />

            {/* Glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                <ringGeometry args={[0.9, 1.3, 64]} />
                <meshBasicMaterial color="#6366f1" transparent opacity={0.2} />
            </mesh>
        </>
    );
}

// Map avatar ID to VRM file
function getAvatarFile(avatarId: string): string {
    const fileMap: { [key: string]: string } = {
        'aria': '/Aria.vrm',
        'ani': '/ani_.vrm',
        'sample': '/AvatarSample_E.vrm'
    };
    return fileMap[avatarId] || '/Aria.vrm';
}

// Main 3D Display Component
export const Avatar3DDisplay = forwardRef<Avatar3DRef, Avatar3DDisplayProps>(
    ({ avatar, isSpeaking = false }, ref) => {
        const [gesture, setGesture] = useState('idle');
        const [emotion, setEmotion] = useState('neutral');

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            sendGesture: (g: string) => {
                console.log('🎭 Gesture:', g);
                setGesture(g);
            },
            sendEmotion: (e: string) => {
                console.log('😊 Emotion:', e);
                setEmotion(e);
            }
        }));

        return (
            <div className="w-full h-full rounded-2xl overflow-hidden" style={{ background: '#0a0812' }}>
                <Canvas gl={{ antialias: true, alpha: true }}>
                    <color attach="background" args={['#0a0812']} />
                    <fog attach="fog" args={['#0a0812', 4, 15]} />

                    <PerspectiveCamera makeDefault position={[0, 1.3, 3]} fov={40} />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[3, 5, 3]} intensity={1.2} />
                    <pointLight position={[-3, 3, -2]} intensity={0.4} color="#6366f1" />
                    <pointLight position={[3, 2, 2]} intensity={0.3} color="#ec4899" />

                    <Environment preset="night" />

                    <Room />

                    <VRMAvatar
                        avatarFile={getAvatarFile(avatar.id)}
                        isSpeaking={isSpeaking}
                        gesture={gesture}
                        emotion={emotion}
                    />

                    <OrbitControls
                        target={[0, 1.2, 0]}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 4}
                        minDistance={1.5}
                        maxDistance={5}
                        enablePan={false}
                        enableDamping
                        dampingFactor={0.05}
                    />
                </Canvas>
            </div>
        );
    }
);

Avatar3DDisplay.displayName = 'Avatar3DDisplay';
