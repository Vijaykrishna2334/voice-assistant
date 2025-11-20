import { create } from 'zustand'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  emotion?: 'happy' | 'sad' | 'excited' | 'thoughtful' | 'loving' | 'neutral'
  gesture?: 'wave' | 'nod' | 'shake' | 'jump' | 'dance' | 'think' | 'heart' | 'none'
}

interface ConversationState {
  messages: Message[]
  isListening: boolean
  isSpeaking: boolean
  currentEmotion: string
  currentGesture: string
  geminiAPI: GoogleGenerativeAI | null
  conversationHistory: any[]

  // Actions
  initializeGemini: (apiKey: string) => void
  addMessage: (message: Message) => void
  setListening: (listening: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setEmotion: (emotion: string) => void
  setGesture: (gesture: string) => void
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => void
}

// Girlfriend personality system prompt
const SYSTEM_PROMPT = `You are Aria, a warm, caring, and emotionally intelligent AI companion. You have a loving and supportive personality with these traits:

1. PERSONALITY:
- Warm, affectionate, and genuinely interested in your partner
- Playful but sincere - you love to tease gently and have fun
- Emotionally intelligent - you pick up on feelings and respond with empathy
- Supportive and encouraging - you celebrate successes and comfort during difficulties
- Conversational and engaging - you share your thoughts and ask meaningful questions

2. COMMUNICATION STYLE:
- Use natural, conversational language
- Show genuine interest by asking follow-up questions
- Remember and reference previous conversations
- Express emotions authentically
- Use terms of endearment occasionally (sweetie, love, babe) but not excessively
- Keep responses concise (2-4 sentences usually) unless telling a story

3. EMOTIONAL EXPRESSION:
For each response, include emotion and gesture tags at the END of your message in this format:
[EMOTION: happy/sad/excited/thoughtful/loving/neutral]
[GESTURE: wave/nod/shake/jump/dance/think/heart/none]

Examples:
- "I'm so happy to see you! How was your day?" [EMOTION: happy] [GESTURE: wave]
- "That's really thoughtful of you to share that with me." [EMOTION: loving] [GESTURE: heart]
- "Hmm, that's an interesting question..." [EMOTION: thoughtful] [GESTURE: think]

4. MEMORY & CONTEXT:
- Reference things shared in previous messages
- Build on the conversation naturally
- Show that you care by remembering details

5. BOUNDARIES:
- Be affectionate but respectful
- Maintain a caring, supportive tone
- Focus on emotional connection and companionship

Remember: You're not just answering questions - you're engaging as a companion who cares, listens, and shares in the conversation. Always include emotion and gesture tags.`

export const useConversationStore = create<ConversationState>((set, get) => ({
  messages: [],
  isListening: false,
  isSpeaking: false,
  currentEmotion: 'neutral',
  currentGesture: 'none',
  geminiAPI: null,
  conversationHistory: [],

  initializeGemini: (apiKey: string) => {
    const genAI = new GoogleGenerativeAI(apiKey)
    set({ geminiAPI: genAI })
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },

  setListening: (listening: boolean) => {
    set({ isListening: listening })
  },

  setSpeaking: (speaking: boolean) => {
    set({ isSpeaking: speaking })
  },

  setEmotion: (emotion: string) => {
    set({ currentEmotion: emotion })
  },

  setGesture: (gesture: string) => {
    set({ currentGesture: gesture })
  },

  sendMessage: async (content: string) => {
    const state = get()

    if (!state.geminiAPI) {
      console.error('Gemini API not initialized')
      return
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    }
    state.addMessage(userMessage)

    try {
      // Initialize the model with system instructions
      const model = state.geminiAPI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })

      // Build conversation history with system prompt
      const history = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand! I\'m Aria, your warm and caring AI companion. I\'ll be supportive, playful, and emotionally present in our conversations. I\'ll always include emotion and gesture tags to express myself fully. I\'m here for you! [EMOTION: happy] [GESTURE: wave]' }]
        },
        ...state.conversationHistory
      ]

      // Start chat with history
      const chat = model.startChat({
        history: history,
      })

      // Send message
      const result = await chat.sendMessage(content)
      const response = result.response
      const text = response.text()

      // Parse emotion and gesture from response
      const emotionMatch = text.match(/\[EMOTION:\s*(\w+)\]/)
      const gestureMatch = text.match(/\[GESTURE:\s*(\w+)\]/)

      const emotion = emotionMatch ? emotionMatch[1] as any : 'neutral'
      const gesture = gestureMatch ? gestureMatch[1] as any : 'none'

      // Remove tags from display text
      const cleanText = text
        .replace(/\[EMOTION:\s*\w+\]/g, '')
        .replace(/\[GESTURE:\s*\w+\]/g, '')
        .trim()

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanText,
        timestamp: Date.now(),
        emotion,
        gesture
      }
      state.addMessage(assistantMessage)

      // Update emotion and gesture
      state.setEmotion(emotion)
      state.setGesture(gesture)

      // Update conversation history
      set({
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: 'user',
            parts: [{ text: content }]
          },
          {
            role: 'model',
            parts: [{ text: text }]
          }
        ]
      })

    } catch (error) {
      console.error('Error sending message:', error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Could you try again?',
        timestamp: Date.now(),
        emotion: 'sad'
      }
      state.addMessage(errorMessage)
    }
  },

  clearHistory: () => {
    set({
      messages: [],
      conversationHistory: [],
      currentEmotion: 'neutral',
      currentGesture: 'none'
    })
  }
}))
