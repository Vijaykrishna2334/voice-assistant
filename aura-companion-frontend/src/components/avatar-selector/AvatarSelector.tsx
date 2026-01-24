import { useState, useEffect, useCallback } from 'react';
import { Avatar } from '@/types/avatar';
import { AVATARS } from '@/data/avatars';
import { NavigationArrow } from './NavigationArrow';
import { DotsIndicator } from './DotsIndicator';
import { AvatarInfoPanel } from './AvatarInfoPanel';
import { SelectButton } from './SelectButton';
import { KeyboardHint } from './KeyboardHint';
import { AvatarPreviewFrame } from './AvatarPreviewFrame';
import { Sparkles } from 'lucide-react';

interface AvatarSelectorProps {
  onSelect: (avatar: Avatar) => void;
  iframeUrl?: string;
}

export function AvatarSelector({ onSelect, iframeUrl }: AvatarSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAvatar = AVATARS[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % AVATARS.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + AVATARS.length) % AVATARS.length);
  }, []);

  const handleSelect = useCallback(() => {
    onSelect(currentAvatar);
  }, [currentAvatar, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Enter') handleSelect();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, handleSelect]);

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-8 md:pt-12 pb-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground text-glow">
            Choose Your AI Companion
          </h1>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Select an avatar to begin your journey
        </p>
      </header>

      {/* Main Preview Area */}
      <div className="flex-1 relative flex items-center justify-center px-4 py-6">
        {/* Navigation Arrows */}
        <NavigationArrow direction="left" onClick={goToPrev} />
        <NavigationArrow direction="right" onClick={goToNext} />

        {/* Avatar Preview Container */}
        <div className="w-full max-w-2xl aspect-square md:aspect-[4/3] relative">
          <div 
            className="absolute inset-0 rounded-3xl glass-strong overflow-hidden"
            style={{
              boxShadow: `0 0 80px ${currentAvatar.color}30`,
            }}
          >
            <AvatarPreviewFrame avatar={currentAvatar} iframeUrl={iframeUrl} />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pb-8 md:pb-12 flex flex-col items-center gap-6">
        <AvatarInfoPanel avatar={currentAvatar} />
        
        <DotsIndicator
          avatars={AVATARS}
          currentIndex={currentIndex}
          onDotClick={setCurrentIndex}
        />

        <SelectButton avatar={currentAvatar} onClick={handleSelect} />
        
        <KeyboardHint />
      </div>
    </div>
  );
}
