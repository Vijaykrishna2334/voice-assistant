import { cn } from '@/lib/utils';
import { Avatar } from '@/types/avatar';

interface DotsIndicatorProps {
  avatars: Avatar[];
  currentIndex: number;
  onDotClick: (index: number) => void;
}

export function DotsIndicator({ avatars, currentIndex, onDotClick }: DotsIndicatorProps) {
  return (
    <div className="flex gap-3 justify-center">
      {avatars.map((avatar, index) => (
        <button
          key={avatar.id}
          onClick={() => onDotClick(index)}
          className={cn(
            'w-3.5 h-3.5 rounded-full transition-all duration-300',
            'border-2 cursor-pointer',
            index === currentIndex
              ? 'scale-110'
              : 'bg-transparent hover:scale-105'
          )}
          style={{
            borderColor: avatar.color,
            backgroundColor: index === currentIndex ? avatar.color : 'transparent',
            boxShadow: index === currentIndex ? `0 0 15px ${avatar.color}` : 'none',
          }}
          aria-label={`Select ${avatar.name}`}
        />
      ))}
    </div>
  );
}
