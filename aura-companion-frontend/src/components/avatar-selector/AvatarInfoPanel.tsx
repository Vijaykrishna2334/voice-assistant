import { Avatar } from '@/types/avatar';
import { Sparkles } from 'lucide-react';

interface AvatarInfoPanelProps {
  avatar: Avatar;
}

export function AvatarInfoPanel({ avatar }: AvatarInfoPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      {/* Name Badge */}
      <div
        className="glass inline-flex items-center gap-3 px-6 py-3 rounded-full"
        style={{ borderColor: `${avatar.color}40` }}
      >
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: avatar.color }}
        />
        <span className="font-display text-xl font-semibold text-foreground">
          {avatar.name}
        </span>
        <Sparkles className="w-4 h-4" style={{ color: avatar.color }} />
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-center max-w-md px-4 leading-relaxed">
        {avatar.description}
      </p>
    </div>
  );
}
