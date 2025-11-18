# Personal AI Companion

An empathetic, human-like AI voice companion that learns, understands, and stores conversations, providing personalized guidance and support.

## Features

- **Multi-Modal Interaction**: Voice and text input/output
- **Empathetic AI Persona**: Calm, sweet, feminine voice with intelligent responses
- **Animated Avatar**: Visual avatar with expressions and gestures
- **Document Analysis**: Upload and analyze PDF, DOCX, and TXT files
- **Persistent Memory**: Remembers conversation history across sessions
- **Problem Solving**: Provides step-by-step guidance and explanations

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for fast development
- TailwindCSS for styling
- Web Speech API for browser STT
- React Three Fiber for 3D avatar

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- OpenAI API (GPT-4, Whisper, TTS)
- Document processing (pdf-parse, mammoth)

## Project Structure

```
voice-assistant/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── models/
│   └── package.json
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables (see `.env.example` in each directory)

4. Run database migrations:
   ```bash
   cd backend && npx prisma migrate dev
   ```

5. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/ai_companion"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3001"
```

## Development Roadmap

- [x] Project structure setup
- [ ] Backend API with AI integration
- [ ] STT/TTS implementation
- [ ] Chat interface UI
- [ ] Avatar visualization
- [ ] Document upload processing
- [ ] Conversation memory storage
- [ ] Authentication system
- [ ] Deployment configuration

## License

MIT
