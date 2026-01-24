import { useRef, useEffect } from 'react';
import { Message } from '@/types/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping?: boolean;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatInterface({ messages, isTyping }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center text-muted-foreground">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Ready to chat!</p>
          <p className="text-sm mt-1">Press the microphone to start speaking</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3 animate-slide-up',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}
          
          <div
            className={cn(
              'max-w-[75%] px-4 py-3',
              message.role === 'user' ? 'message-user' : 'message-assistant'
            )}
          >
            <p className="text-sm md:text-base leading-relaxed">
              {message.content}
            </p>
            <p className="text-xs mt-2 opacity-60">
              {formatTime(message.timestamp)}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 justify-start animate-fade-in">
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="message-assistant px-4 py-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/60 animate-bounce-dot"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
