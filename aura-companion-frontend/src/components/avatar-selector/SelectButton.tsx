import { ArrowRight } from 'lucide-react';
import { Avatar } from '@/types/avatar';

interface SelectButtonProps {
  avatar: Avatar;
  onClick: () => void;
}

export function SelectButton({ avatar, onClick }: SelectButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative px-10 py-4 rounded-full font-display text-lg font-semibold text-white
                 transition-all duration-300 hover:scale-105 active:scale-100"
      style={{
        background: `linear-gradient(135deg, ${avatar.color}, ${avatar.color}99)`,
        boxShadow: `0 10px 40px ${avatar.color}66`,
      }}
    >
      <span className="flex items-center gap-3">
        Select {avatar.name}
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
