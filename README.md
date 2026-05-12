<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=160&section=header&text=Aria%20-%20AI%20Voice%20Companion&fontSize=36&fontColor=fff&animation=twinkling&fontAlignY=36&desc=3D%20Animated%20AI%20Companion%20with%20Real-Time%20Voice&descAlignY=58&descSize=15" width="100%"/>
</div>

# 🌟 AI Virtual Companion - Aria

A realistic AI companion with full 3D animations, voice interaction, and emotional intelligence powered by Google Gemini API.

![AI Companion Demo](https://img.shields.io/badge/Status-Ready-success)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-Enabled-black)

## ✨ Features

- 🎭 **Fully Animated 3D Avatar** - Realistic female character with smooth animations
- 🎤 **Voice Interaction** - Speak and listen using Web Speech API
- 💭 **Intelligent Conversations** - Powered by Google Gemini AI with girlfriend personality
- 🎭 **Dynamic Emotions** - Facial expressions matching conversation sentiment
- 👋 **Natural Gestures** - Wave, nod, jump, dance, and more based on context
- 💕 **Warm Personality** - Caring, supportive, and emotionally intelligent companion
- 🧠 **Conversation Memory** - Remembers context throughout your chat
- 🎨 **Beautiful UI** - Modern, gradient-based design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- A Google Gemini API key (free at [Google AI Studio](https://makersuite.google.com/app/apikey))
- Modern web browser with Web Speech API support (Chrome, Edge recommended)

### Installation

1. **Clone or download this repository**

```bash
git clone <repository-url>
cd voice-assistant
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

4. **Open your browser**

Navigate to `http://localhost:3000`

5. **Configure your API key**

On first launch, you'll see a configuration screen:
- Enter your Gemini API key
- (Optional) Enter a custom Ready Player Me avatar URL
- Click "Start Chatting"

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in the configuration screen

**Note:** Gemini API offers a generous free tier perfect for personal projects!

## 🎨 Customizing Your Avatar

### Using Ready Player Me

1. Visit [Ready Player Me](https://readyplayer.me)
2. Create your custom avatar
3. Click "Download" and choose ".glb" format
4. You'll get a URL like: `https://models.readyplayer.me/[ID].glb`
5. Paste this URL in the configuration screen

### Using a Local Avatar

Place your .glb file in the `public` folder and reference it as `/your-avatar.glb`

## 💬 How to Use

### Text Chat

1. Type your message in the chat input at the bottom right
2. Press Enter or click the send button
3. Aria will respond with text, emotions, and gestures

### Voice Interaction

1. Click the microphone button at the bottom center
2. Speak your message (you'll see "Listening..." indicator)
3. Your speech will be transcribed and sent automatically
4. Aria will respond with voice and animations

### Gestures & Emotions

Aria automatically displays emotions and gestures based on conversation:

**Emotions:**
- 😊 Happy - Joyful, positive responses
- 😢 Sad - Empathetic, comforting responses
- 🤩 Excited - Enthusiastic reactions
- 🤔 Thoughtful - Considering responses
- 🥰 Loving - Affectionate expressions
- 😌 Neutral - Calm, relaxed state

**Gestures:**
- 👋 Wave - Greetings
- ✅ Nod - Agreement, affirmation
- ❌ Shake - Disagreement, negation
- 🦘 Jump - Excitement, celebration
- 💃 Dance - Joy, celebration
- 🤔 Think - Pondering, reflecting
- ❤️ Heart - Love, affection

## 🏗️ Project Structure

```
voice-assistant/
├── src/
│   ├── components/
│   │   ├── Avatar.tsx          # 3D avatar component with animations
│   │   ├── Scene.tsx            # Three.js scene setup
│   │   ├── ChatInterface.tsx    # Chat UI component
│   │   ├── VoiceControls.tsx    # Voice input/output controls
│   │   └── ConfigPanel.tsx      # API key configuration
│   ├── services/
│   │   ├── speechService.ts     # Web Speech API wrapper
│   │   ├── lipSyncService.ts    # Lip-sync engine
│   │   └── animationController.ts # Animation state management
│   ├── store/
│   │   └── conversationStore.ts # Zustand store with Gemini integration
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🎯 Technical Architecture

### AI Conversation (Gemini API)

- **Model:** gemini-pro
- **Personality:** Custom system prompt creates warm, caring companion
- **Memory:** Conversation history maintained in Zustand store
- **Emotion Detection:** Responses tagged with [EMOTION] and [GESTURE] markers
- **Context:** Full conversation history sent with each request

### Voice System

- **Input:** Web Speech API (browser-based, free)
- **Output:** Web Speech Synthesis API (browser-based, free)
- **Voice:** Automatically selects female voice when available
- **Lip Sync:** Amplitude-based mouth movement from audio analysis

### 3D Rendering

- **Engine:** Three.js with React Three Fiber
- **Avatar:** Ready Player Me .glb models
- **Animations:** Procedural animations for gestures and idle
- **Lighting:** Ambient + directional + point lights with shadows
- **Environment:** HDR environment mapping for realistic lighting

### State Management

- **Store:** Zustand for global state
- **Real-time Updates:** React hooks for reactive UI
- **Persistence:** LocalStorage for API key and avatar URL

## 🔧 Configuration Options

### Conversation Settings

Edit `src/store/conversationStore.ts` to adjust:

```typescript
generationConfig: {
  temperature: 0.9,    // Creativity (0-1)
  topK: 40,           // Token sampling
  topP: 0.95,         // Nucleus sampling
  maxOutputTokens: 1024, // Response length
}
```

### Avatar Appearance

Default avatar is provided, but you can:
- Use Ready Player Me for custom avatars
- Create your own .glb models with Blender
- Use VRoid Studio for anime-style characters

### Personality

Edit the `SYSTEM_PROMPT` in `src/store/conversationStore.ts` to change:
- Personality traits
- Communication style
- Relationship dynamic
- Response format

## 🐛 Troubleshooting

### "Speech recognition not supported"

- Use Chrome or Edge browser (best support)
- Ensure you're using HTTPS or localhost
- Check browser permissions for microphone

### Avatar not loading

- Check internet connection (Ready Player Me avatars load from CDN)
- Verify avatar URL is a valid .glb file
- Try the default avatar first

### API errors

- Verify your Gemini API key is correct
- Check API quota at Google AI Studio
- Ensure you have internet connection
- Check browser console for detailed errors

### Voice not working

- Check browser audio permissions
- Ensure speakers/headphones are connected
- Try adjusting system volume
- Verify Web Speech API is supported (check console)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Deploy to Netlify/Vercel

1. Push code to GitHub
2. Import repository in Netlify or Vercel
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

**Note:** API key is stored in browser localStorage, not exposed in build.

## 📝 Future Enhancements

Potential improvements you can add:

- [ ] Google Cloud Text-to-Speech for higher quality voices
- [ ] Advanced lip-sync using phoneme analysis
- [ ] More complex animations (walking, sitting, etc.)
- [ ] Background environment options
- [ ] Voice customization (pitch, rate, volume)
- [ ] Conversation history export
- [ ] Multiple personality presets
- [ ] Mobile app version (React Native)
- [ ] VR support

## 🙏 Credits

- **Google Gemini** - Conversational AI
- **Ready Player Me** - Avatar system
- **Three.js** - 3D rendering
- **React Three Fiber** - React + Three.js integration
- **Zustand** - State management

## 📄 License

MIT License - Feel free to use this for personal or commercial projects!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share your customizations

## 💡 Tips for Best Experience

1. **Use headphones** to prevent echo during voice conversations
2. **Speak clearly** for better speech recognition
3. **Good lighting** if using camera-based features
4. **Stable internet** for smooth Gemini API responses
5. **Chrome browser** for best compatibility

---

Made with ❤️ using Google Gemini AI

**Enjoy your AI companion!** 🌟
