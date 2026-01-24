import { useState, KeyboardEvent } from 'react';
import { Mic, MicOff, Square, Volume2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  autoListen: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onToggleAutoListen: () => void;
  onSendMessage: (message: string) => void;
}

export function VoiceControls({
  isListening,
  isSpeaking,
  autoListen,
  transcript,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onToggleAutoListen,
  onSendMessage,
}: VoiceControlsProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (trimmed && trimmed.length <= 1000) {
      onSendMessage(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Transcript preview */}
      {isListening && transcript && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4">
          <div className="glass-strong px-4 py-2 rounded-full max-w-sm text-center">
            <p className="text-sm text-foreground truncate">{transcript}</p>
          </div>
        </div>
      )}

      <div className="glass-strong border-t border-glass-border/30 px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {/* Text input row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, 1000))}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isListening || isSpeaking}
              className={cn(
                'flex-1 px-4 py-3 rounded-full text-sm',
                'bg-background-secondary border border-glass-border/50',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isListening || isSpeaking}
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center',
                'transition-all duration-300',
                inputValue.trim()
                  ? 'gradient-primary glow-soft hover:scale-105'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Voice controls row */}
          <div className="flex items-center justify-center gap-4">
            {/* Auto-listen toggle */}
            <button
              onClick={onToggleAutoListen}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                autoListen
                  ? 'bg-primary/30 text-primary border border-primary/50'
                  : 'bg-glass border border-glass-border/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Auto
              </span>
            </button>

            {/* Main mic button */}
            {isSpeaking ? (
              <button
                onClick={onStopSpeaking}
                className="w-14 h-14 rounded-full flex items-center justify-center
                           bg-destructive/20 border-2 border-destructive/50
                           transition-all duration-300 hover:bg-destructive/30"
                aria-label="Stop speaking"
              >
                <Square className="w-5 h-5 text-destructive" />
              </button>
            ) : isListening ? (
              <button
                onClick={onStopListening}
                className="w-14 h-14 rounded-full flex items-center justify-center
                           mic-button mic-button-listening"
                aria-label="Stop listening"
              >
                <MicOff className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                onClick={onStartListening}
                className="w-14 h-14 rounded-full flex items-center justify-center
                           mic-button transition-all duration-300 hover:scale-105"
                aria-label="Start listening"
              >
                <Mic className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Status text */}
            <div className="min-w-[80px] text-center">
              <p className="text-sm text-muted-foreground">
                {isSpeaking
                  ? 'Speaking...'
                  : isListening
                  ? 'Listening...'
                  : 'Tap to speak'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
