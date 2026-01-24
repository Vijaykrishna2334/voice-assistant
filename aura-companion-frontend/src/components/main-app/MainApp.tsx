import { useState, useCallback, useEffect } from 'react';
import { Avatar, Message } from '@/types/avatar';
import { useVoice } from '@/hooks/useVoice';
import { useAvatar3D } from '@/hooks/useAvatar3D';
import { AvatarBadge } from './AvatarBadge';
import { AvatarDisplay } from './AvatarDisplay';
import { ChatInterface } from './ChatInterface';
import { VoiceControls } from './VoiceControls';

interface MainAppProps {
  avatar: Avatar;
  onChangeAvatar: () => void;
  iframeUrl?: string;
  backendUrl?: string;
}

export function MainApp({ avatar, onChangeAvatar, iframeUrl, backendUrl }: MainAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [autoListen, setAutoListen] = useState(false);

  const voice = useVoice();
  const avatar3D = useAvatar3D();

  // Handle completed voice input
  const handleVoiceInput = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Show typing indicator
      setIsTyping(true);

      // Simulate AI response (replace with actual API call)
      try {
        // If backend URL is provided, make actual API call
        if (backendUrl) {
          const response = await fetch(`${backendUrl}/api/chat/simple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: messages }),
          });
          const data = await response.json();

          // Send commands to avatar
          if (data.gesture) avatar3D.sendGesture(data.gesture);
          if (data.emotion) avatar3D.sendEmotion(data.emotion);

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.text,
            timestamp: Date.now(),
            emotion: data.emotion,
            gesture: data.gesture,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          voice.speak(data.text, () => {
            if (autoListen) voice.startListening();
          });
        } else {
          // Demo mode - simulate response
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const responses = [
            "Hello! I'm here to help you. What would you like to talk about?",
            "That's an interesting question! Let me think about that.",
            "I'd be happy to assist you with that. Could you tell me more?",
            "Great point! I appreciate you sharing that with me.",
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: randomResponse,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          voice.speak(randomResponse, () => {
            if (autoListen) voice.startListening();
          });
        }
      } catch (error) {
        console.error('Error getting response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, backendUrl, avatar3D, voice, autoListen]
  );

  // Watch for completed transcripts
  useEffect(() => {
    if (!voice.isListening && voice.transcript) {
      handleVoiceInput(voice.transcript);
    }
  }, [voice.isListening, voice.transcript, handleVoiceInput]);

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      <AvatarBadge avatar={avatar} onChangeAvatar={onChangeAvatar} />

      {/* Avatar Display Area */}
      <div className="h-[40vh] md:h-[50vh] p-4 pt-16">
        <div
          className="h-full max-w-3xl mx-auto rounded-2xl glass-strong overflow-hidden"
          style={{ boxShadow: `0 0 60px ${avatar.color}20` }}
        >
          <AvatarDisplay
            ref={avatar3D.avatarRef}
            avatar={avatar}
            isSpeaking={voice.isSpeaking}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 pb-36">
        <ChatInterface messages={messages} isTyping={isTyping} />
      </div>

      {/* Voice Controls with Chat Input */}
      <VoiceControls
        isListening={voice.isListening}
        isSpeaking={voice.isSpeaking}
        autoListen={autoListen}
        transcript={voice.transcript}
        onStartListening={voice.startListening}
        onStopListening={voice.stopListening}
        onStopSpeaking={voice.stopSpeaking}
        onToggleAutoListen={() => setAutoListen((prev) => !prev)}
        onSendMessage={handleVoiceInput}
      />
    </div>
  );
}
