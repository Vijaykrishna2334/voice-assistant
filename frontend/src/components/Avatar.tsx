import { useEffect, useState } from 'react';
import { AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
  isListening?: boolean;
  isSpeaking?: boolean;
}

const avatarExpressions: Record<AvatarState, { emoji: string; color: string; description: string }> = {
  [AvatarState.NEUTRAL]: {
    emoji: '😊',
    color: 'from-pink-400 to-purple-400',
    description: 'Ready to help',
  },
  [AvatarState.HAPPY]: {
    emoji: '😄',
    color: 'from-yellow-400 to-pink-400',
    description: 'Excited',
  },
  [AvatarState.THOUGHTFUL]: {
    emoji: '🤔',
    color: 'from-blue-400 to-purple-400',
    description: 'Thinking',
  },
  [AvatarState.EMPATHETIC]: {
    emoji: '🥺',
    color: 'from-pink-400 to-red-400',
    description: 'Understanding',
  },
  [AvatarState.CONCERNED]: {
    emoji: '😟',
    color: 'from-orange-400 to-red-400',
    description: 'Concerned',
  },
  [AvatarState.ENCOURAGING]: {
    emoji: '💪',
    color: 'from-green-400 to-blue-400',
    description: 'Encouraging',
  },
};

export default function Avatar({ state, isListening, isSpeaking }: AvatarProps) {
  const [pulse, setPulse] = useState(false);
  const expression = avatarExpressions[state] || avatarExpressions[AvatarState.NEUTRAL];

  useEffect(() => {
    if (isListening || isSpeaking) {
      setPulse(true);
    } else {
      setPulse(false);
    }
  }, [isListening, isSpeaking]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${expression.color} opacity-30 blur-2xl ${
            pulse ? 'animate-pulse-slow' : ''
          }`}
        />

        {/* Avatar container */}
        <div
          className={`relative w-48 h-48 rounded-full bg-gradient-to-br ${expression.color} flex items-center justify-center shadow-2xl ${
            pulse ? 'animate-pulse' : ''
          } transition-all duration-500`}
        >
          {/* Avatar face */}
          <div className="text-8xl">{expression.emoji}</div>

          {/* Listening indicator */}
          {isListening && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="absolute -top-2 right-4">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-white rounded animate-pulse" />
                <div className="w-1 h-6 bg-white rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                <div className="w-1 h-5 bg-white rounded animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-gray-700">{expression.description}</p>
        {isListening && <p className="text-sm text-red-600 mt-1">Listening...</p>}
        {isSpeaking && <p className="text-sm text-blue-600 mt-1">Speaking...</p>}
      </div>
    </div>
  );
}
