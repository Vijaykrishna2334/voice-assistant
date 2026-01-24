# AI Voice Assistant - Aria

A voice-controlled 3D avatar AI assistant powered by Google Gemini, with VRM avatar animations and natural speech interaction.

## 🏗️ Project Structure

```
voice-assistant/
├── src/                    # Frontend (React + Three.js)
│   ├── components/         # React components
│   │   ├── AniLevelAvatar.tsx   # 3D VRM avatar with animations
│   │   ├── ChatInterface.tsx    # Message display
│   │   ├── ConfigPanel.tsx      # API key configuration
│   │   ├── Scene.tsx            # Three.js canvas
│   │   └── VoiceControls.tsx    # Mic & speaker controls
│   ├── services/           # Frontend services
│   │   ├── speechService.ts     # TTS (Google Cloud + browser)
│   │   ├── whisperService.ts    # STT (Whisper + Web Speech fallback)
│   │   ├── poseAnimationManager.ts
│   │   ├── vroidPoseLoader.ts
│   │   └── ...animation services
│   ├── store/              # State management
│   │   └── conversationStore.ts
│   └── App.tsx
├── backend/                # Backend API (Express)
│   ├── server.js           # API endpoints
│   └── package.json
├── public/                 # Static assets
│   ├── *.vrm               # VRM avatar models
│   └── *.vroidpose         # Pose files
├── docs/                   # Documentation
└── .env                    # Environment variables
```

## 🚀 Quick Start

### Frontend (3D Avatar App)

```bash
cd voice-assistant
npm install
npm run dev
```

Open http://localhost:3000

### Backend (API Server)

```bash
cd voice-assistant/backend
npm install
npm run dev
```

API runs on http://localhost:3001

## 🔧 Configuration

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLOUD_API_KEY=your_tts_api_key  # Optional
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## ✨ Features

- **3D VRM Avatar** - Animated anime-style avatar with 16 poses
- **Voice Input** - Whisper STT with Web Speech API fallback
- **Voice Output** - Google Cloud TTS with browser fallback
- **AI Chat** - Gemini 2.5 Flash for intelligent responses
- **Emotion System** - Avatar expresses emotions based on responses
- **Gesture System** - Natural gestures triggered by conversation

## 🎮 Voice Commands

- "Hello" - Greeting
- "Dance" / "Move" - Trigger dance animation
- "Pose 1-16" - Specific pose
- "Jump" / "Bounce" - Jumping animation
- Any question - AI responds with appropriate emotion

## 📁 Key Files

| File | Purpose |
|------|---------|
| `AniLevelAvatar.tsx` | Main 3D avatar component |
| `conversationStore.ts` | Gemini AI integration |
| `whisperService.ts` | Speech-to-text |
| `speechService.ts` | Text-to-speech |
| `backend/server.js` | API server (separated) |

## 🔌 API Endpoints (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | Streaming chat (SSE) |
| `/api/chat/simple` | POST | Non-streaming chat |
| `/api/tts` | POST | Text-to-speech |

## 📄 License

MIT