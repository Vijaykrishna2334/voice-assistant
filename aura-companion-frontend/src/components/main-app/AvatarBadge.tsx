import { Avatar } from '@/types/avatar';
import { RotateCcw } from 'lucide-react';

interface AvatarBadgeProps {
  avatar: Avatar;
  onChangeAvatar: () => void;
}

export function AvatarBadge({ avatar, onChangeAvatar }: AvatarBadgeProps) {
  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="glass-strong flex items-center gap-3 px-4 py-2.5 rounded-full">
        {/* Status indicator */}
        <div
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: '#22c55e' }}
        />
        
        {/* Avatar name */}
        <span className="font-medium text-foreground">{avatar.name}</span>
        
        {/* Change avatar button */}
        <button
          onClick={onChangeAvatar}
          className="w-7 h-7 rounded-full flex items-center justify-center
                     transition-all duration-300 hover:rotate-180"
          style={{
            backgroundColor: `${avatar.color}30`,
            border: `1px solid ${avatar.color}60`,
          }}
          title="Change avatar"
        >
          <RotateCcw className="w-3.5 h-3.5" style={{ color: avatar.color }} />
        </button>
      </div>
    </div>
  );
}
