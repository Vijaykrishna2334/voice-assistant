export interface Avatar {
  id: string;
  name: string;
  description: string;
  color: string;
  colorClass: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotion?: string;
  gesture?: string;
}

export type Screen = 'avatar-select' | 'main';

export interface AppState {
  currentScreen: Screen;
  selectedAvatar: Avatar | null;
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  autoListen: boolean;
}
