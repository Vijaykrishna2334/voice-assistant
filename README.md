<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=160&section=header&text=Aria%20-%20AI%20Voice%20Companion&fontSize=36&fontColor=fff&animation=twinkling&fontAlignY=36&desc=3D%20Animated%20AI%20Companion%20with%20Real-Time%20Voice%20%26%20Emotion&descAlignY=58&descSize=15" width="100%"/>

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Real-time voice · Emotion-driven 3D avatar · Gemini-powered conversation memory**

</div>

---

## 🤖 What Is Aria?

Aria is a **3D animated AI companion** that you can talk to in real time. She listens, understands, remembers your conversations, and responds — with a fully animated 3D avatar that reacts with facial expressions and gestures based on the emotion of her response.

Built with React Three Fiber + Google Gemini API + Web Speech API.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎙️ **Voice Input** | Web Speech API captures and transcribes your voice in real time |
| 🔊 **Voice Output** | Text-to-speech responses with natural pacing |
| 🧠 **Conversation Memory** | Gemini API retains full context across the conversation |
| 😊 **Emotion Detection** | AI detects emotional tone → avatar reacts accordingly |
| 💃 **3D Animations** | Idle, talking, happy, thinking — dynamic gesture system |
| 👤 **Ready Player Me** | Realistic customizable avatars via Ready Player Me (.glb) |
| 💬 **Text + Voice** | Switch between typing and speaking anytime |

---

## 🏗 How It Works

```
You speak → Web Speech API transcribes
        ↓
Text sent to Gemini API with full conversation history
        ↓
Gemini generates response + detects emotional tone
        ↓
Response triggers matching animation on 3D avatar
        ↓
TTS speaks the response while avatar lip-syncs
        ↓
Conversation stored → next message has full context
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** + **TypeScript** | Frontend framework |
| **Three.js** + **React Three Fiber** | 3D rendering engine |
| **Google Gemini API** | Conversation AI + emotion analysis |
| **Web Speech API** | Browser-native speech-to-text + TTS |
| **Zustand** | Global state management |
| **Ready Player Me** | 3D avatar (.glb models) |
| **Vite** | Fast build tool |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key (free at [ai.google.dev](https://ai.google.dev))

### Setup

```bash
# Clone
git clone https://github.com/Vijaykrishna2334/voice-assistant.git
cd voice-assistant

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add: VITE_GEMINI_API_KEY=your_key_here

# Run
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Note:** Use Chrome or Edge for best Web Speech API support

---

## 🎭 Avatar Customization

Aria uses **Ready Player Me** avatars. To use your own:

1. Go to [readyplayer.me](https://readyplayer.me)
2. Create your avatar
3. Export as `.glb`
4. Replace the avatar file in `src/assets/`

---

## 📁 Project Structure

```
voice-assistant/
├── src/
│   ├── components/
│   │   ├── Avatar.tsx        # 3D avatar renderer + animations
│   │   ├── ChatInterface.tsx # Text/voice chat UI
│   │   └── VoiceControls.tsx # Mic + TTS controls
│   ├── services/
│   │   ├── speechService.ts  # Web Speech API integration
│   │   ├── lipSync.ts        # Avatar lip synchronization
│   │   └── animations.ts     # Gesture + emotion animations
│   ├── store/
│   │   └── geminiStore.ts    # Gemini API + conversation history
│   └── App.tsx
├── public/
│   └── avatars/              # Ready Player Me .glb files
├── package.json
└── vite.config.ts
```

---

## 📬 Contact

**Built by [Vijay Krishna](https://github.com/Vijaykrishna2334)**
- 📧 vijaykrishna2334@gmail.com
- 💼 [LinkedIn](https://linkedin.com/in/vijaykrishna2334)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=80&section=footer" width="100%"/>
