import { useRef, useCallback } from 'react';
import { Avatar3DRef } from '@/components/three/Avatar3DDisplay';

interface UseAvatar3DReturn {
    avatarRef: React.RefObject<Avatar3DRef>;
    sendGesture: (gesture: string) => void;
    sendEmotion: (emotion: string) => void;
}

export function useAvatar3D(): UseAvatar3DReturn {
    const avatarRef = useRef<Avatar3DRef>(null);

    const sendGesture = useCallback((gesture: string) => {
        avatarRef.current?.sendGesture(gesture);
    }, []);

    const sendEmotion = useCallback((emotion: string) => {
        avatarRef.current?.sendEmotion(emotion);
    }, []);

    return {
        avatarRef,
        sendGesture,
        sendEmotion,
    };
}
