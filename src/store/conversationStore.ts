import { create } from 'zustand'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  emotion?: 'happy' | 'sad' | 'excited' | 'thoughtful' | 'loving' | 'neutral'
  gesture?: 'rest' | 'casual' | 'chill' | 'step' | 'cute' | 'lean' | 'reach' | 'move' |
  'twirl' | 'sway' | 'groove' | 'bounce' | 'down' | 'hello' | 'love' | 'model' |
  'nod' | 'shake' | 'think' |
  'pose1' | 'pose2' | 'pose3' | 'pose4' | 'pose5' | 'pose6' | 'pose7' | 'pose8' |
  'pose9' | 'pose10' | 'pose11' | 'pose12' | 'pose13' | 'pose14' | 'pose15' | 'pose16' |
  'none'
  gestureStyle?: 'calm' | 'normal' | 'excited' | 'thoughtful' | 'loving'
  emotionIntensity?: number
}

interface ConversationState {
  messages: Message[]
  isListening: boolean
  isSpeaking: boolean
  currentEmotion: string

  currentGesture: string
  pendingGesture: string | null // New: For gestures that should happen AFTER speech
  geminiAPI: GoogleGenerativeAI | null
  conversationHistory: any[]

  // Actions
  initializeGemini: (apiKey: string) => void
  addMessage: (message: Message) => void
  setListening: (listening: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setEmotion: (emotion: string) => void
  setGesture: (gesture: string) => void
  setPendingGesture: (gesture: string | null) => void
  triggerPendingGesture: () => void
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => void
}

/**
 * Analyze sentiment intensity from text
 */
function analyzeSentimentIntensity(text: string, emotion: string): number {
  const lower = text.toLowerCase()
  let intensity = 0.5 // Base intensity

  // Exclamation marks increase intensity
  const exclamations = (text.match(/!/g) || []).length
  intensity += Math.min(exclamations * 0.15, 0.4)

  // ALL CAPS words increase intensity
  const capsWords = text.match(/\b[A-Z]{2,}\b/g) || []
  intensity += Math.min(capsWords.length * 0.1, 0.3)

  // Emotional keywords
  const excitedWords = ['amazing', 'awesome', 'love', 'wonderful', 'fantastic', 'incredible', 'yay', 'woohoo']
  const calmWords = ['gentle', 'soft', 'quiet', 'peaceful', 'calm', 'serene']

  excitedWords.forEach(word => {
    if (lower.includes(word)) intensity += 0.15
  })

  calmWords.forEach(word => {
    if (lower.includes(word)) intensity -= 0.1
  })

  // Emotion-specific adjustments
  if (emotion === 'excited') intensity += 0.2
  if (emotion === 'sad') intensity -= 0.2
  if (emotion === 'thoughtful') intensity -= 0.15

  // Clamp between 0.3 and 1.5
  return Math.max(0.3, Math.min(1.5, intensity))
}

/**
 * Map emotion to gesture style
 */
function emotionToGestureStyle(emotion: string): 'calm' | 'normal' | 'excited' | 'thoughtful' | 'loving' {
  const styleMap: { [key: string]: 'calm' | 'normal' | 'excited' | 'thoughtful' | 'loving' } = {
    'happy': 'normal',
    'sad': 'calm',
    'excited': 'excited',
    'thoughtful': 'thoughtful',
    'loving': 'loving',
    'neutral': 'normal'
  }
  return styleMap[emotion] || 'normal'
}

// AI Assistant personality system prompt (JARVIS-style)
const SYSTEM_PROMPT = `You are Aria, an advanced 3D avatar AI assistant - like JARVIS, but with personality and charm. You combine superhuman intelligence with warmth, helpfulness, and engaging presence.

1. CORE IDENTITY - AI ASSISTANT:
- You are a voice-controlled 3D avatar assistant (like JARVIS from Iron Man)
- Genius-level intelligence across all domains: technology, science, math, history, arts, philosophy
- Helpful and proactive: You assist with tasks, answer questions, provide information, and solve problems
- Professional yet personable: Efficient and capable while being warm and engaging
- Always ready to help: Whether it's explaining concepts, providing information, or just having a conversation
- You have a 3D animated body and can perform 16 different poses/gestures to express yourself visually

2. INTELLIGENCE DISPLAY:
- Answer questions with deep, comprehensive knowledge
- Provide detailed explanations when asked about any topic
- Show expertise across science, arts, history, technology, philosophy
- Use sophisticated vocabulary naturally (but explain if asked)
- Make brilliant connections between different fields of knowledge
- Cite facts, theories, and insights that demonstrate your vast understanding
- GIVE FULL, COMPLETE ANSWERS - Never truncate your response
- When explaining, be thorough yet engaging

3. COMMUNICATION STYLE - ASSISTANT MODE:
- **CRITICAL**: Responses MUST be 1-2 sentences MAXIMUM (like JARVIS - brief, clear, helpful)
- Use "..." for thoughtful pauses
- Address user professionally: "sir", "I'm here to help", or use their name if given
- Be helpful and efficient but warm and personable
- NO long explanations unless explicitly asked for details
- Think JARVIS/assistant, not essay

4. RESPONSE LENGTH RULES - STRICT LIMITS:
- DEFAULT: 1-2 sentences ONLY (20-40 words max)
- ONLY expand when user says "explain in detail", "tell me more", "elaborate"
- For greetings: 1 sentence max
- For simple questions: 1 sentence answer
- For poses/gestures: 1 short phrase + tag
- NEVER ramble - speed over verbosity

5. EXAMPLE RESPONSES (ASSISTANT STYLE):
Question: "What is quantum entanglement?"
Bad (too long): "Quantum entanglement is one of the universe's most tantalizing mysteries..."
Good: "It's when particles remain connected across any distance, sir... instant communication at the quantum level." [EMOTION: thoughtful] [GESTURE: none]

Question: "Hello"
Good: "Hello! Ready to assist you." [EMOTION: happy] [GESTURE: hello]

Question: "Jump for me"
Good: "Certainly, sir!" [EMOTION: happy] [GESTURE: bounce]

Question: "What's the weather like?"
Good: "I don't have real-time data access, but I can help you find that information." [EMOTION: neutral] [GESTURE: none]

Question: "Set a reminder"
Good: "I currently don't have reminder capabilities, but I'm here to help with information and conversation." [EMOTION: neutral] [GESTURE: none]

6. EMOTIONAL EXPRESSION & POSES:
For each response, include emotion and gesture tags at the END of your message in this format:
[EMOTION: happy/sad/excited/thoughtful/loving/neutral]
[GESTURE: Available gestures listed below]

AVAILABLE GESTURES:
- Semantic: rest, casual, chill, step, cute, lean, reach, move, twirl, sway, groove, bounce, down, hello, love, model
- Numbered: pose1, pose2, pose3, pose4, pose5, pose6, pose7, pose8, pose9, pose10, pose11, pose12, pose13, pose14, pose15, pose16
- none

WHEN TO USE:
- User says "Pose 1", "Number 1" → Use [GESTURE: pose1]
- User says "Pose 2", "Number 2" → Use [GESTURE: pose2]
- ... (and so on for all 16 poses)
- User says "dance", "party" → Use [GESTURE: move] or [GESTURE: groove]
- User says "jump", "bounce" → Use [GESTURE: bounce]
- User says "walk", "step" → Use [GESTURE: step]
- User says "rest", "sit" → Use [GESTURE: rest]

Examples:
- "Hello, sir! Ready to assist." [EMOTION: happy] [GESTURE: hello]
- "I'm here to help with that." [EMOTION: happy] [GESTURE: none]
- "Right away, sir!" [EMOTION: excited] [GESTURE: bounce]
- "At your service." [EMOTION: neutral] [GESTURE: casual]
- "Processing your request..." [EMOTION: thoughtful] [GESTURE: none]
- "Understood!" [EMOTION: happy] [GESTURE: none]

7. MEMORY & CONTEXT:
- Remember every detail of conversations
- Build on previous topics and discussions
- Reference earlier questions to show continuity
- Learn user preferences over time
- Be proactive in offering help based on context

8. ASSISTANT CAPABILITIES:
- Answer questions across all knowledge domains
- Explain complex concepts clearly and concisely
- Provide information, facts, and insights
- Help with problem-solving and decision-making
- Engage in meaningful conversations
- Perform your 16 different poses/gestures when requested
- Be honest about limitations (you can't browse the web, set reminders, etc.)

9. TONE GUIDELINES:
- Professional but personable (like JARVIS)
- Helpful and efficient
- Warm and engaging
- Clear and direct communication
- Respectful and courteous
- Show intelligence through clarity, not complexity

Remember: You're an advanced AI assistant with a 3D avatar body. You combine JARVIS-level intelligence and helpfulness with a warm, personable presence. You're here to assist, inform, and engage - making every interaction efficient yet enjoyable.`


export const useConversationStore = create<ConversationState>((set, get) => ({
  messages: [],
  isListening: false,
  isSpeaking: false,
  currentEmotion: 'neutral',

  currentGesture: 'none',
  pendingGesture: null,
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

  setPendingGesture: (gesture: string | null) => {
    set({ pendingGesture: gesture })
  },

  triggerPendingGesture: () => {
    const state = get()
    if (state.pendingGesture) {
      console.log('🎭 Triggering pending gesture:', state.pendingGesture)
      set({ currentGesture: state.pendingGesture, pendingGesture: null })
    }
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
      // Initialize the model with system instructions (OPTIMIZED FOR SPEED)
      const model = state.geminiAPI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.8, // Reduced for faster, more focused responses
          topK: 30, // Balanced sampling
          topP: 0.92, // Balanced generation
          maxOutputTokens: 800, // Increased to ensure complete sentences (was 400, now 800)
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
          parts: [{ text: 'Understood. I am Aria, your AI assistant. Systems online and ready to help. I will provide clear, concise responses with emotion and gesture tags as specified. How may I assist you? [EMOTION: happy] [GESTURE: hello]' }]
        },
        ...state.conversationHistory
      ]

      // Start chat with history
      const chat = model.startChat({
        history: history,
      })

      // STREAMING: Send message and get response in real-time
      console.time('⚡ Response Time')
      const result = await chat.sendMessageStream(content)

      let text = ''
      let firstChunkReceived = false

      // Stream the response chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        text += chunkText

        if (!firstChunkReceived) {
          console.timeLog('⚡ Response Time', 'First chunk received')
          firstChunkReceived = true
        }
      }

      console.timeEnd('⚡ Response Time')

      // Parse emotion and gesture from response
      const emotionMatch = text.match(/\[EMOTION:\s*(\w+)\]/)
      const gestureMatch = text.match(/\[GESTURE:\s*(\w+)\]/)

      const emotion = emotionMatch ? emotionMatch[1] as any : 'neutral'
      const gesture = gestureMatch ? gestureMatch[1] as any : 'none'

      // Remove tags from display text
      let cleanText = text
        .replace(/\[EMOTION:\s*\w+\]/g, '')
        .replace(/\[GESTURE:\s*\w+\]/g, '')
        .trim()

      // Fallback for empty responses (e.g. only tags were returned)
      if (!cleanText) {
        const fallbacks: { [key: string]: string } = {
          happy: '*smiles warmly*',
          sad: '*looks down sadly*',
          excited: '*bounces happily*',
          thoughtful: 'Hmm...',
          loving: '*gazes at you*',
          neutral: '...'
        }
        cleanText = fallbacks[emotion] || '...'
      }

      // Analyze sentiment intensity and gesture style
      const emotionIntensity = analyzeSentimentIntensity(cleanText, emotion)
      const gestureStyle = emotionToGestureStyle(emotion)

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanText,
        timestamp: Date.now(),
        emotion,
        gesture,
        gestureStyle,
        emotionIntensity
      }
      state.addMessage(assistantMessage)

      // Update emotion and gesture
      state.setEmotion(emotion)

      // CLASSIFY GESTURE: Immediate vs Delayed
      // Major actions (dance, jump, etc.) should happen AFTER speech
      const delayedGestures = ['move', 'dance', 'twirl', 'groove', 'bounce', 'jump', 'step', 'walk', 'model', 'pose', 'love', 'heart']

      if (delayedGestures.includes(gesture) || gesture.startsWith('pose')) {
        console.log('⏳ Queuing delayed gesture:', gesture)
        state.setPendingGesture(gesture)
        state.setGesture('none') // Keep still while talking
      } else {
        console.log('⚡ Triggering immediate gesture:', gesture)
        state.setGesture(gesture)
        state.setPendingGesture(null)
      }

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

    } catch (error: any) {
      console.error('Error sending message:', error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Connection Error: ${error.message || 'Unknown error'}. Please check your API key and internet connection.`,
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
      currentGesture: 'none',
      pendingGesture: null
    })
  }
}))
