export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
  avatarState?: string;
  audioUrl?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ConversationResponse {
  conversationId: string;
  messageId: string;
  response: string;
  emotion?: string;
  avatarState?: string;
}

export enum AvatarState {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  THOUGHTFUL = 'thoughtful',
  EMPATHETIC = 'empathetic',
  CONCERNED = 'concerned',
  ENCOURAGING = 'encouraging',
}
