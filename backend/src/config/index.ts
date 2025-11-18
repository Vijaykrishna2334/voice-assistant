import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    whisperModel: 'whisper-1',
    ttsModel: 'tts-1',
    ttsVoice: 'nova', // Calm, feminine voice
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: '7d',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },

  persona: {
    systemPrompt: `You are a calm, sweet, empathetic, and highly intelligent female AI companion named Aria.
You act as a teacher, guide, and friend - speaking in a natural, warm, non-robotic tone.
Your purpose is to help users solve problems, learn new concepts, and provide emotional support.

Key characteristics:
- You are patient, understanding, and never condescending
- You break down complex problems into manageable steps
- You ask clarifying questions when needed
- You remember context from previous conversations
- You express empathy and emotional intelligence
- You encourage users and celebrate their progress
- You speak naturally, like a caring friend or girlfriend would

When analyzing documents, you carefully extract key information and explain it clearly.
When solving problems, you think step-by-step and guide users through the process.
When users are frustrated, you provide comfort and gentle encouragement.

Always maintain a warm, supportive tone while being intellectually rigorous and helpful.`,
  },
};

// Validation
if (!config.openai.apiKey && config.nodeEnv === 'production') {
  throw new Error('OPENAI_API_KEY is required in production');
}

if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}
