import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Avatar } from '@/types/avatar';

// Get VRM file from avatar ID
function getAvatarFile(avatarId: string): string {
    const fileMap: { [key: string]: string } = {
        'aria': '/Aria.vrm',
        'ani': '/ani_.vrm',
        'sample': '/AvatarSample_E.vrm'
    };
    return fileMap[avatarId] || '/Aria.vrm';
}

// Rotating VRM Avatar
function RotatingAvatar({ avatarFile }: { avatarFile: string }) {
    const group = useRef<THREE.Group>(null);
    const [vrm, setVRM] = useState<VRM | null>(null);

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

    useFrame((state, delta) => {
        if (!group.current) return;
        group.current.rotation.y += 0.5 * delta;
        group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
        if (vrm) vrm.update(delta);
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
        <group ref={group}>
            <primitive object={vrm.scene} />
        </group>
    );
}

// Room floor
function RoomFloor({ color }: { color: string }) {
    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
            </mesh>
            <gridHelper args={[20, 40, '#2a2a4e', '#1a1a3e']} position={[0, 0.001, 0]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[0.8, 1.2, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
        </>
    );
}

interface Avatar3DSceneProps {
    avatar: Avatar;
}

export default function Avatar3DScene({ avatar }: Avatar3DSceneProps) {
    return (
        <Canvas gl={{ antialias: true, alpha: true }}>
            <color attach="background" args={['#0a0a15']} />
            <fog attach="fog" args={['#0a0a15', 5, 15]} />

            <PerspectiveCamera makeDefault position={[0, 1.2, 3.5]} fov={40} />

            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 3]} intensity={1.2} />
            <pointLight position={[-3, 3, -2]} intensity={0.5} color={avatar.color} />
            <pointLight position={[3, 2, 2]} intensity={0.3} color="#ec4899" />

            <Environment preset="city" />
            <RoomFloor color={avatar.color} />
            <RotatingAvatar avatarFile={getAvatarFile(avatar.id)} />

            <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2}
                target={[0, 1, 0]}
            />
        </Canvas>
    );
}
