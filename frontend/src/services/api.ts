import axios from 'axios';
import type {
  User,
  AuthResponse,
  Conversation,
  ConversationResponse,
  Document,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, name: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/register', { email, name, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};

// Conversation API
export const conversationAPI = {
  getAll: async (): Promise<Conversation[]> => {
    const { data } = await api.get('/api/conversations');
    return data;
  },

  getById: async (id: string): Promise<Conversation> => {
    const { data } = await api.get(`/api/conversations/${id}`);
    return data;
  },

  create: async (title?: string): Promise<Conversation> => {
    const { data } = await api.post('/api/conversations', { title });
    return data;
  },

  sendMessage: async (
    message: string,
    conversationId?: string,
    documentIds?: string[]
  ): Promise<ConversationResponse> => {
    const { data } = await api.post('/api/conversations/message', {
      message,
      conversationId,
      documentIds,
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/conversations/${id}`);
  },
};

// Document API
export const documentAPI = {
  getAll: async (): Promise<Document[]> => {
    const { data } = await api.get('/api/documents');
    return data;
  },

  upload: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/documents/${id}`);
  },
};

// Voice API
export const voiceAPI = {
  transcribe: async (audioBlob: Blob): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const { data } = await api.post('/api/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  synthesize: async (text: string): Promise<Blob> => {
    const { data } = await api.post(
      '/api/voice/synthesize',
      { text },
      {
        responseType: 'blob',
      }
    );
    return data;
  },
};

export default api;
