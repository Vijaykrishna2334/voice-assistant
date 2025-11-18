import { create } from 'zustand';
import { conversationAPI, voiceAPI } from '../services/api';
import type { Conversation, Message, AvatarState } from '../types';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isListening: boolean;
  avatarState: AvatarState;
  selectedDocuments: string[];

  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  createConversation: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setSelectedDocuments: (docs: string[]) => void;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => Promise<string | null>;
  playVoice: (text: string) => Promise<void>;
}

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  isListening: false,
  avatarState: 'neutral' as AvatarState,
  selectedDocuments: [],

  loadConversations: async () => {
    try {
      set({ isLoading: true });
      const conversations = await conversationAPI.getAll();
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ isLoading: false });
    }
  },

  loadConversation: async (id: string) => {
    try {
      set({ isLoading: true });
      const conversation = await conversationAPI.getById(id);
      set({
        currentConversation: conversation,
        messages: conversation.messages || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
      set({ isLoading: false });
    }
  },

  createConversation: async () => {
    try {
      const conversation = await conversationAPI.create('New Conversation');
      set({
        currentConversation: conversation,
        messages: [],
        conversations: [conversation, ...get().conversations],
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  },

  sendMessage: async (content: string) => {
    try {
      set({ isSending: true });

      const { currentConversation, selectedDocuments } = get();

      // Add user message optimistically
      const tempUserMessage: Message = {
        id: 'temp-' + Date.now(),
        conversationId: currentConversation?.id || '',
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      set({ messages: [...get().messages, tempUserMessage] });

      // Send to API
      const response = await conversationAPI.sendMessage(
        content,
        currentConversation?.id,
        selectedDocuments
      );

      // Update with actual messages
      const assistantMessage: Message = {
        id: response.messageId,
        conversationId: response.conversationId,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        emotion: response.emotion,
        avatarState: response.avatarState,
      };

      set({
        messages: [...get().messages.filter((m) => m.id !== tempUserMessage.id), assistantMessage],
        avatarState: (response.avatarState as AvatarState) || 'neutral',
        isSending: false,
      });

      // If no current conversation, load it
      if (!currentConversation) {
        await get().loadConversation(response.conversationId);
      }

      // Auto-play voice response
      await get().playVoice(response.response);
    } catch (error) {
      console.error('Error sending message:', error);
      set({ isSending: false });
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await conversationAPI.delete(id);
      set({
        conversations: get().conversations.filter((c) => c.id !== id),
        currentConversation: get().currentConversation?.id === id ? null : get().currentConversation,
        messages: get().currentConversation?.id === id ? [] : get().messages,
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  },

  setSelectedDocuments: (docs: string[]) => {
    set({ selectedDocuments: docs });
  },

  startVoiceRecording: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.start();
      set({ isListening: true });
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  },

  stopVoiceRecording: async () => {
    return new Promise((resolve) => {
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        try {
          const { text } = await voiceAPI.transcribe(audioBlob);
          set({ isListening: false });
          resolve(text);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          set({ isListening: false });
          resolve(null);
        }
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  },

  playVoice: async (text: string) => {
    try {
      const audioBlob = await voiceAPI.synthesize(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice:', error);
    }
  },

  setSelectedDocuments: (docs: string[]) => {
    set({ selectedDocuments: docs });
  },
}));
