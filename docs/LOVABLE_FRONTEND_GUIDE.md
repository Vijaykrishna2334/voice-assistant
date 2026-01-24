# Lovable.dev Frontend Documentation
## AI Voice Assistant with 3D Avatar Selection & Room Environment

---

## ⚠️ CRITICAL: Lovable.dev Limitations

> **Lovable.dev does NOT support Three.js, WebGL, or direct 3D rendering.**
> 
> The 3D VRM avatar and room environment require `@react-three/fiber`, `@pixiv/three-vrm`, and WebGL.

### Solution: Hybrid Architecture

```
┌────────────────────────────────────────────────────┐
│           LOVABLE.DEV (Main App)                   │
│  ┌──────────────────────────────────────────────┐  │
│  │   Avatar Selection Screen (2D UI)            │  │
│  │   - Carousel navigation                       │  │
│  │   - Avatar cards with info                   │  │
│  ├──────────────────────────────────────────────┤  │
│  │                                              │  │
│  │   ┌────────────────────────────────────┐     │  │
│  │   │     IFRAME (3D Avatar + Room)      │     │  │
│  │   │     Hosted on Vercel/Netlify       │     │  │
│  │   │     Three.js + VRM + Environment   │     │  │
│  │   └────────────────────────────────────┘     │  │
│  │                                              │  │
│  ├──────────────────────────────────────────────┤  │
│  │              Chat Interface                   │  │
│  ├──────────────────────────────────────────────┤  │
│  │              Voice Controls                   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 📋 COMPLETE LOVABLE.DEV PROMPT

Copy this entire prompt into Lovable.dev:

```
Create a modern AI Voice Assistant web application with avatar selection, chat interface, and voice controls.

## APP OVERVIEW
A voice-controlled AI assistant with multiple avatar options. Users select an avatar from a game-style carousel, then interact via voice and chat. The 3D avatar is displayed in an iframe.

## SCREENS

### SCREEN 1: Avatar Selection (Initial Screen)
Full-screen avatar selection with game-style carousel.

#### Layout:
- Dark gradient background
- Title: "Choose Your AI Companion" centered at top
- Large avatar preview area (60% height) - shows iframe with 3D preview
- Avatar info panel below preview
- Navigation arrows on left/right sides
- Select button at bottom
- Dots indicator showing current avatar

#### Avatar Data:
```javascript
const AVATARS = [
  { id: 'aria', name: 'Aria', description: 'Your AI companion with charm and intelligence', color: '#6366f1' },
  { id: 'ani', name: 'Ani', description: 'Energetic and expressive assistant', color: '#ec4899' },
  { id: 'sample', name: 'Sample', description: 'Classic demonstration avatar', color: '#22c55e' }
]
```

#### Components:
1. **SelectorHeader** - Title and subtitle
2. **AvatarPreviewFrame** - Iframe container for 3D preview
3. **NavigationArrows** - Left/right buttons
4. **AvatarInfoPanel** - Name badge + description
5. **DotsIndicator** - Current position dots
6. **SelectButton** - Gradient button with arrow icon
7. **KeyboardHint** - Shows "← → Navigate, Enter Select"

#### Styling:
```css
.avatar-selector {
  height: 100vh;
  background: linear-gradient(135deg, #0a0a15 0%, #1a1a2e 40%, #16213e 70%, #0a0a15 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selector-header h1 {
  font-size: 2.5rem;
  color: white;
  text-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
}

.nav-arrow:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.avatar-name-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 2px solid var(--avatar-color);
}

.select-button {
  padding: 16px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--avatar-color), var(--avatar-color-transparent));
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);
  cursor: pointer;
}

.avatar-dots {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--avatar-color);
  background: transparent;
  cursor: pointer;
}

.dot.active {
  background: var(--avatar-color);
  box-shadow: 0 0 15px var(--avatar-color);
}
```

#### Functionality:
- Arrow buttons navigate between avatars
- Keyboard arrows work too (← →)
- Dots are clickable to jump to specific avatar
- Enter key or Select button confirms choice
- Save selected avatar to localStorage
- Transition to main app after selection

---

### SCREEN 2: Main Application

After avatar selection, show the main interface.

#### Layout (Top to Bottom):
1. **Avatar Badge** (top-left, fixed)
   - Green status dot
   - Avatar name
   - Change avatar button (↻)

2. **3D Avatar Iframe** (50-60% height)
   - Full-width iframe
   - Dark background
   - Room environment rendered inside iframe

3. **Chat Interface** (scrollable)
   - Message bubbles
   - User on right, AI on left
   - Timestamps

4. **Voice Controls** (bottom, fixed)
   - Large mic button (center)
   - Auto-listen toggle
   - Status text

#### Avatar Badge Styling:
```css
.avatar-badge {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 50px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.avatar-status {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.change-avatar-btn {
  width: 28px;
  height: 28px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 50%;
  color: #a5b4fc;
  cursor: pointer;
}

.change-avatar-btn:hover {
  background: rgba(99, 102, 241, 0.4);
  transform: rotate(180deg);
}
```

---

## COLOR PALETTE

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #16213e;
  --bg-glass: rgba(26, 26, 46, 0.8);
  
  /* Accents */
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-tertiary: #a855f7;
  --accent-pink: #ec4899;
  --accent-green: #22c55e;
  
  /* Text */
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Borders */
  --border-light: rgba(255, 255, 255, 0.1);
  --border-accent: rgba(99, 102, 241, 0.3);
}
```

---

## CHAT INTERFACE

### Message Bubbles:
```css
.message {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  margin: 8px 0;
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 16px 16px 4px 16px;
}

.message.assistant {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}
```

---

## VOICE CONTROLS

### Bottom Control Bar:
```css
.voice-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.mic-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.mic-button.listening {
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
    transform: scale(1.05);
  }
}

.auto-listen-btn {
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 20px;
  color: #a5b4fc;
  font-size: 0.9rem;
}

.auto-listen-btn.active {
  background: rgba(99, 102, 241, 0.4);
  color: white;
}
```

---

## STATE MANAGEMENT

```typescript
// App State
interface AppState {
  // Screen state
  currentScreen: 'avatar-select' | 'main';
  
  // Avatar state
  selectedAvatar: {
    id: string;
    name: string;
    color: string;
  } | null;
  currentAvatarIndex: number;
  
  // Chat state
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  
  // Config
  backendUrl: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotion?: string;
  gesture?: string;
}

// Save/Load from localStorage
const saveAvatar = (avatar) => localStorage.setItem('selected_avatar', JSON.stringify(avatar));
const loadAvatar = () => JSON.parse(localStorage.getItem('selected_avatar') || 'null');
```

---

## IFRAME COMMUNICATION

### Send Commands to 3D Avatar:
```typescript
// Reference to iframe
const avatarIframeRef = useRef<HTMLIFrameElement>(null);

// Send gesture command
function sendGesture(gesture: string) {
  avatarIframeRef.current?.contentWindow?.postMessage(
    { type: 'gesture', gesture },
    '*'
  );
}

// Send emotion command
function sendEmotion(emotion: string) {
  avatarIframeRef.current?.contentWindow?.postMessage(
    { type: 'emotion', emotion },
    '*'
  );
}

// Switch avatar
function switchAvatar(avatarId: string) {
  avatarIframeRef.current?.contentWindow?.postMessage(
    { type: 'switch-avatar', avatarId },
    '*'
  );
}

// Listen for avatar ready
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'avatar-ready') {
      console.log('3D Avatar loaded and ready');
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Iframe Component:
```tsx
function AvatarIframe({ avatarId }: { avatarId: string }) {
  return (
    <iframe
      ref={avatarIframeRef}
      src={`https://your-avatar-app.vercel.app?avatar=${avatarId}`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px',
        background: '#0a0812'
      }}
      allow="microphone; autoplay"
    />
  );
}
```

---

## API INTEGRATION

### Backend Endpoints:

```typescript
// Chat with AI
async function sendMessage(message: string, history: Message[]) {
  const response = await fetch(`${BACKEND_URL}/api/chat/simple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  
  const data = await response.json();
  // data: { text, emotion, gesture }
  
  // Update avatar
  sendGesture(data.gesture);
  sendEmotion(data.emotion);
  
  // Speak the response
  speak(data.text);
  
  return data;
}
```

### Voice Input (Web Speech API):
```typescript
function startListening(onResult: (text: string) => void) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (event.results[0].isFinal) {
      onResult(transcript);
    }
  };
  
  recognition.start();
}
```

### Voice Output (Browser TTS):
```typescript
function speak(text: string, onEnd?: () => void) {
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find a female voice
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
  if (femaleVoice) utterance.voice = femaleVoice;
  
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  utterance.onend = onEnd;
  
  speechSynthesis.speak(utterance);
}
```

---

## ANIMATIONS

```css
/* Pulse for recording */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Fade in for elements */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide for carousel */
@keyframes slideIn {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Glow ring for active states */
@keyframes glow-ring {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
}

/* Typing indicator */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

---

## RESPONSIVE DESIGN

```css
/* Mobile */
@media (max-width: 768px) {
  .selector-header h1 {
    font-size: 1.8rem;
  }
  
  .nav-arrow {
    width: 48px;
    height: 48px;
  }
  
  .avatar-preview-frame {
    height: 50vh;
  }
  
  .select-button {
    padding: 14px 32px;
    font-size: 1rem;
  }
  
  .keyboard-hint {
    display: none;
  }
  
  .mic-button {
    width: 56px;
    height: 56px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .avatar-selector {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## COMPONENT HIERARCHY

```
App
├── AvatarSelector (Screen 1)
│   ├── SelectorBackground
│   ├── SelectorHeader
│   ├── AvatarPreviewFrame (iframe)
│   ├── NavigationArrow (left)
│   ├── NavigationArrow (right)
│   ├── AvatarInfoPanel
│   │   ├── AvatarNameBadge
│   │   ├── AvatarDescription
│   │   └── DotsIndicator
│   ├── SelectButton
│   └── KeyboardHint
│
└── MainApp (Screen 2)
    ├── AvatarBadge
    ├── AvatarIframe (3D scene)
    ├── ChatInterface
    │   ├── MessageList
    │   │   └── Message (multiple)
    │   └── TypingIndicator
    └── VoiceControls
        ├── AutoListenButton
        ├── MicButton
        ├── StopButton (conditional)
        └── StatusText
```

---

## DEPLOYMENT STEPS

### Step 1: Deploy 3D Avatar App (Vite)
```bash
cd voice-assistant
npm run build
npx vercel --prod
# Get URL: https://your-avatar-app.vercel.app
```

### Step 2: Deploy Backend
```bash
cd backend
npm install
# Deploy to Railway, Render, or Vercel
# Get URL: https://your-backend.railway.app
```

### Step 3: Create Lovable App
1. Go to lovable.dev
2. Paste this prompt
3. Generate the app
4. Update BACKEND_URL and AVATAR_IFRAME_URL constants

### Step 4: Test Integration
1. Open Lovable app
2. Select an avatar
3. Start chatting
4. Verify avatar responds with gestures

---

## 🔗 AVATAR GESTURES AVAILABLE

Send these via postMessage:
```javascript
// Gestures
'hello', 'wave', 'bounce', 'dance', 'twirl',
'pose1' to 'pose16', 'rest', 'casual', 'chill',
'step', 'cute', 'lean', 'reach', 'move', 'love'

// Emotions
'happy', 'sad', 'excited', 'thoughtful', 'loving', 'neutral'
```

---

## ✅ FINAL CHECKLIST

- [ ] Deploy 3D avatar to Vercel
- [ ] Deploy backend API
- [ ] Create Lovable app with this prompt
- [ ] Update iframe URL to Vercel deployment
- [ ] Update backend URL
- [ ] Test avatar selection flow
- [ ] Test chat and voice
- [ ] Test gestures and emotions
