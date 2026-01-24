import { forwardRef, useState, useEffect } from 'react';
import { Avatar } from '@/types/avatar';
import { Bot } from 'lucide-react';

export interface Avatar3DRef {
  sendGesture: (gesture: string) => void;
  sendEmotion: (emotion: string) => void;
}

interface AvatarDisplayProps {
  avatar: Avatar;
  iframeUrl?: string;
  isSpeaking?: boolean;
}

// Loading placeholder
function LoadingPlaceholder({ color }: { color: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0812' }}>
      <div
        className="relative w-40 h-40 rounded-full animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${color}40, ${color}20)`,
          boxShadow: `0 0 60px ${color}40`,
        }}
      >
        <div className="absolute inset-4 rounded-full glass flex items-center justify-center">
          <div
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${color} transparent transparent transparent` }}
          />
        </div>
      </div>
    </div>
  );
}

// Fallback placeholder
function FallbackPlaceholder({ avatar, isSpeaking }: { avatar: Avatar; isSpeaking?: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0812' }}>
      <div
        className={`relative w-40 h-40 rounded-full animate-float ${isSpeaking ? 'animate-glow-ring' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${avatar.color}40, ${avatar.color}20)`,
          boxShadow: `0 0 60px ${avatar.color}40`,
        }}
      >
        <div className="absolute inset-4 rounded-full glass flex items-center justify-center">
          <Bot
            className={`w-16 h-16 ${isSpeaking ? 'scale-110' : ''}`}
            style={{ color: avatar.color }}
          />
        </div>
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce-dot"
                style={{
                  backgroundColor: avatar.color,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const AvatarDisplay = forwardRef<Avatar3DRef, AvatarDisplayProps>(
  ({ avatar, isSpeaking }, ref) => {
    const [Scene, setScene] = useState<React.ComponentType<any> | null>(null);
    const [error, setError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) return;

      // Dynamic import after mount
      import('../three/Avatar3DDisplay')
        .then((mod) => {
          setScene(() => mod.Avatar3DDisplay);
        })
        .catch((err) => {
          console.error('Failed to load 3D display:', err);
          setError(true);
        });
    }, [mounted]);

    if (!mounted) {
      return <LoadingPlaceholder color={avatar.color} />;
    }

    if (error || !Scene) {
      if (error) {
        return <FallbackPlaceholder avatar={avatar} isSpeaking={isSpeaking} />;
      }
      return <LoadingPlaceholder color={avatar.color} />;
    }

    return (
      <div className="w-full h-full rounded-2xl overflow-hidden">
        <Scene ref={ref} avatar={avatar} isSpeaking={isSpeaking} />
      </div>
    );
  }
);

AvatarDisplay.displayName = 'AvatarDisplay';
