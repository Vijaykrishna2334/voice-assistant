export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationRequest {
  message: string;
  conversationId?: string;
  documentIds?: string[];
}

export interface ConversationResponse {
  conversationId: string;
  messageId: string;
  response: string;
  emotion?: string;
  avatarState?: string;
}

export interface DocumentUploadResponse {
  documentId: string;
  filename: string;
  extractedText: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export enum AvatarState {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  THOUGHTFUL = 'thoughtful',
  EMPATHETIC = 'empathetic',
  CONCERNED = 'concerned',
  ENCOURAGING = 'encouraging',
}

export enum EmotionTone {
  CALM = 'calm',
  SUPPORTIVE = 'supportive',
  ENTHUSIASTIC = 'enthusiastic',
  GENTLE = 'gentle',
  UNDERSTANDING = 'understanding',
}
