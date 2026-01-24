import { useState, useEffect } from 'react';
import { Avatar } from '@/types/avatar';
import { Bot } from 'lucide-react';

interface AvatarPreviewFrameProps {
  avatar: Avatar;
  iframeUrl?: string;
}

// We'll load 3D dynamically after mount
function Avatar3DLoader({ avatar }: { avatar: Avatar }) {
  const [Scene, setScene] = useState<React.ComponentType<{ avatar: Avatar }> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Dynamic import after mount
    import('./Avatar3DScene')
      .then((mod) => {
        setScene(() => mod.default);
      })
      .catch((err) => {
        console.error('Failed to load 3D scene:', err);
        setError(true);
      });
  }, []);

  if (error) {
    return <FallbackPlaceholder avatar={avatar} />;
  }

  if (!Scene) {
    return <LoadingPlaceholder color={avatar.color} />;
  }

  return <Scene avatar={avatar} />;
}

// Loading placeholder
function LoadingPlaceholder({ color }: { color: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative w-48 h-48 rounded-full animate-float"
        style={{
          background: `linear-gradient(135deg, ${color}40, ${color}20)`,
          boxShadow: `0 0 60px ${color}40`,
        }}
      >
        <div className="absolute inset-4 rounded-full glass flex items-center justify-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${color} transparent transparent transparent` }}
          />
        </div>
      </div>
    </div>
  );
}

// Fallback if 3D fails
function FallbackPlaceholder({ avatar }: { avatar: Avatar }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative w-48 h-48 rounded-full animate-float"
        style={{
          background: `linear-gradient(135deg, ${avatar.color}40, ${avatar.color}20)`,
          boxShadow: `0 0 60px ${avatar.color}40`,
        }}
      >
        <div className="absolute inset-4 rounded-full glass flex items-center justify-center">
          <Bot className="w-20 h-20" style={{ color: avatar.color }} />
        </div>
        <div
          className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ borderColor: `${avatar.color}30`, animationDuration: '10s' }}
        />
      </div>
    </div>
  );
}

export function AvatarPreviewFrame({ avatar }: AvatarPreviewFrameProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden" style={{ background: '#0a0a15' }}>
      {mounted ? (
        <Avatar3DLoader avatar={avatar} />
      ) : (
        <LoadingPlaceholder color={avatar.color} />
      )}
    </div>
  );
}
