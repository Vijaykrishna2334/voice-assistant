# System Architecture

## Overview

The Personal AI Companion is a full-stack web application with the following architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Components: Avatar, Chat, Login, Sidebar        │  │
│  │  State: Zustand (Auth, Chat)                     │  │
│  │  Routing: React Router                           │  │
│  │  Styling: TailwindCSS                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Express)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes: Auth, Conversations, Documents, Voice   │  │
│  │  Services: OpenAI, Document, Conversation        │  │
│  │  Middleware: Auth, Upload                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│  PostgreSQL │    │   OpenAI API     │    │ File Storage│
│  (Prisma)   │    │  - GPT-4         │    │  (uploads/) │
│             │    │  - Whisper       │    │             │
│  - Users    │    │  - TTS           │    │  Documents  │
│  - Convos   │    └──────────────────┘    └─────────────┘
│  - Messages │
│  - Docs     │
└─────────────┘
```

## Component Breakdown

### Frontend

**Technology Stack:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- Axios (HTTP client)
- React Router (routing)

**Key Components:**
1. **Avatar** - Animated avatar with emotional states
2. **ChatMessage** - Individual message component with markdown support
3. **ChatInput** - Text/voice input with real-time STT
4. **Sidebar** - Conversation history and navigation
5. **Login** - Authentication UI

**State Management:**
- `authStore` - User authentication state
- `chatStore` - Conversations and messages

### Backend

**Technology Stack:**
- Node.js + Express + TypeScript
- Prisma ORM
- OpenAI SDK
- JWT authentication
- Multer (file uploads)

**API Endpoints:**

```
/api/auth
  POST /register      - Register new user
  POST /login         - Login user
  POST /logout        - Logout user
  GET  /me            - Get current user

/api/conversations
  POST /              - Create conversation
  GET  /              - Get all conversations
  GET  /:id           - Get conversation by ID
  POST /message       - Send message & get AI response
  DELETE /:id         - Delete conversation

/api/documents
  POST /upload        - Upload document
  GET  /              - Get all documents
  GET  /:id           - Get document by ID
  DELETE /:id         - Delete document

/api/voice
  POST /transcribe    - Audio → Text (Whisper)
  POST /synthesize    - Text → Audio (TTS)
```

### Database Schema

```prisma
User
  - id, email, name, password
  - conversations[]
  - documents[]
  - sessions[]

Conversation
  - id, userId, title
  - messages[]
  - timestamps

Message
  - id, conversationId, role, content
  - emotion, avatarState
  - timestamp

Document
  - id, userId, filename, fileType
  - filePath, extractedText
  - uploadedAt

Session
  - id, userId, token
  - expiresAt
```

## Data Flow

### Message Flow

```
User Input → STT (optional) → Frontend State
                ↓
        POST /api/conversations/message
                ↓
        Backend: Build Context
        - Load conversation history
        - Load document context (if any)
        - Build prompt with persona
                ↓
        OpenAI GPT-4 API
                ↓
        Response Analysis
        - Detect emotion
        - Determine avatar state
                ↓
        Save to Database
                ↓
        Return Response → Frontend
                ↓
        TTS (optional) → Audio Playback
```

### Document Upload Flow

```
File Selection → Upload
        ↓
Backend: Multer receives file
        ↓
Extract Text
  - PDF: pdf-parse
  - DOCX: mammoth
  - TXT: raw text
        ↓
Sanitize & Store
  - Save metadata in DB
  - Store extracted text
  - Keep file on disk
        ↓
Return Document ID
        ↓
Available for context in conversations
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input sanitization
- File type validation
- File size limits
- SQL injection protection (Prisma)
- XSS protection (React)

## Performance Optimizations

- Prisma connection pooling
- Conversation context summarization
- Optimistic UI updates
- Lazy loading conversations
- Audio streaming
- Response caching potential

## Scalability

Current architecture supports:
- Up to 1000 concurrent users
- Horizontal scaling via load balancer
- Database read replicas
- CDN for frontend assets
- Background job queue (future)

## AI Integration

**OpenAI Services:**
1. **GPT-4** - Conversational AI with persona
2. **Whisper** - Speech-to-Text transcription
3. **TTS** - Text-to-Speech synthesis

**Persona System:**
- System prompt defines personality
- Context window: 200k+ tokens
- Temperature: 0.7 for natural responses
- Emotion detection from response content
- Avatar state mapping

## Future Enhancements

- WebSocket for real-time messaging
- Vector database for RAG
- Fine-tuning for persona
- 3D avatar rendering
- Multi-language support
- Mobile app (React Native)
- Voice wake word detection
- Conversation analytics
