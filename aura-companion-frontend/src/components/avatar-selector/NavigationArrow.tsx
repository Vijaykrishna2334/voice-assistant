import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

export function NavigationArrow({ direction, onClick, disabled }: NavigationArrowProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'nav-arrow z-20',
        direction === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={`Navigate ${direction}`}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
