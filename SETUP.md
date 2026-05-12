# 🚀 Setup Guide - AI Virtual Companion

Complete step-by-step guide to get your AI companion up and running.

## 📋 Prerequisites Check

Before starting, ensure you have:

- [ ] Node.js version 16 or higher installed
- [ ] npm (comes with Node.js)
- [ ] A modern web browser (Chrome or Edge recommended)
- [ ] Internet connection
- [ ] A Google account (for Gemini API key)

### Check Your Node.js Version

```bash
node --version
# Should show v16.x.x or higher

npm --version
# Should show 8.x.x or higher
```

## 🔑 Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key" button
   - Choose "Create API key in new project" (or select existing project)
   - Copy the generated key immediately

3. **Important Notes**
   - Keep your API key secure and private
   - Don't share it or commit it to version control
   - Free tier includes generous usage limits
   - No credit card required for free tier

## 📦 Step 2: Install Dependencies

Navigate to the project directory and install:

```bash
cd voice-assistant
npm install
```

This will install all required packages:
- React & React DOM
- Three.js & React Three Fiber
- Google Generative AI SDK
- Zustand (state management)
- Vite (build tool)
- TypeScript

**Installation should take 1-3 minutes depending on your internet speed.**

## 🎭 Step 3: (Optional) Get Custom Avatar

If you want a custom avatar instead of the default:

### Using Ready Player Me

1. **Create Avatar**
   - Visit: https://readyplayer.me
   - Click "Create Avatar"
   - Customize appearance (gender, face, hair, clothes, etc.)

2. **Export Avatar**
   - After customization, click "Done" or "Download"
   - Choose ".glb" format
   - You'll get a URL like: `https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb`
   - Copy this URL for later

### Using VRoid Studio (Anime Style)

1. Download VRoid Studio: https://vroid.com/en/studio
2. Create your character
3. Export as .vrm file
4. Convert to .glb using online converter
5. Place in `public` folder

## ▶️ Step 4: Run the Application

Start the development server:

```bash
npm run dev
```

You should see:

```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## 🌐 Step 5: Open in Browser

1. **Open your browser**
   - Navigate to: `http://localhost:3000`
   - Chrome or Edge recommended for best compatibility

2. **You'll see the Configuration Screen**
   - Beautiful purple gradient background
   - Welcome message
   - Input fields for API key and avatar

## ⚙️ Step 6: Configure Application

On the configuration screen:

1. **Enter Gemini API Key** (Required)
   - Paste the API key you got from Step 1
   - This will be stored securely in your browser's localStorage

2. **Enter Avatar URL** (Optional)
   - Paste Ready Player Me URL if you have one
   - Leave blank to use the default avatar
   - You can change this later by clearing browser data

3. **Click "Start Chatting"**
   - Application will initialize
   - 3D scene will load
   - Avatar will appear

## 🎉 Step 7: Start Using Your Companion

### First Interaction - Text Chat

1. Look for the chat interface on the right side
2. Type a message like: "Hello! What's your name?"
3. Press Enter or click the send button
4. Aria will respond with text, emotion, and gesture

### Enable Voice Interaction

1. **Click the microphone button** (bottom center)
2. **Allow microphone access** when browser asks
3. **Speak your message** clearly
4. You'll see "Listening..." indicator
5. Your speech will be transcribed automatically
6. Aria will respond with voice and animations

### Allow Audio Output

When Aria responds:
- Browser may ask permission to play audio
- Click "Allow" to hear her voice
- She'll speak all her responses automatically

## 🔧 Troubleshooting Common Issues

### Issue: Dependencies Won't Install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
```

### Issue: "Speech recognition not supported"

**Solutions:**
- Use Chrome or Edge browser (Safari has limited support)
- Ensure you're on `localhost` or `https://` (required for microphone)
- Check browser permissions: Settings → Privacy → Microphone
- Try reloading the page

### Issue: Avatar Not Loading

**Solutions:**
- Check internet connection (avatar loads from CDN)
- Try the default avatar first (leave URL blank)
- Verify avatar URL is correct .glb format
- Check browser console (F12) for detailed errors
- Clear browser cache and reload

### Issue: "Invalid API Key" or API Errors

**Solutions:**
- Verify API key is correct (no extra spaces)
- Check you're using Gemini API key (not other Google APIs)
- Ensure you haven't exceeded free tier limits
- Visit Google AI Studio to check key status
- Try generating a new API key

### Issue: No Voice Output

**Solutions:**
- Check system volume and browser volume
- Ensure speakers/headphones are connected
- Try a different browser
- Check browser permissions for audio
- Look for browser console errors

### Issue: Avatar Appears but Doesn't Animate

**Solutions:**
- This is normal initially - animations trigger during conversation
- Try sending a message to trigger animations
- Check browser console for WebGL errors
- Ensure your GPU supports WebGL 2.0

## 🎨 Customization Tips

### Change Personality

Edit `src/store/conversationStore.ts`:

```typescript
const SYSTEM_PROMPT = `You are [name], a [personality traits]...`
```

### Adjust Voice Settings

Edit `src/services/speechService.ts`:

```typescript
utterance.rate = 1.0   // Speed (0.5-2.0)
utterance.pitch = 1.1  // Pitch (0-2)
utterance.volume = 1.0 // Volume (0-1)
```

### Change UI Colors

Edit `src/index.css` and component CSS files to change gradients and colors.

## 📱 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| 3D Graphics | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ✅ | ⚠️ | ⚠️ |
| Voice Output | ✅ | ✅ | ✅ | ✅ |
| Overall | Best | Best | Good | Limited |

✅ = Fully Supported | ⚠️ = Partial Support | ❌ = Not Supported

## 🔒 Security & Privacy

### Your Data

- **API Key**: Stored only in browser localStorage (never sent to any server except Google)
- **Conversations**: Not saved permanently (cleared on browser refresh unless you save them)
- **Voice**: Processed locally by browser, transcripts sent to Gemini API
- **Avatar**: Loaded from Ready Player Me CDN

### Best Practices

- Don't share your API key with anyone
- Don't commit API key to version control
- Clear browser data to reset all settings
- Use private/incognito mode for extra privacy

## 🚀 Next Steps

Now that you're set up:

1. **Have a conversation** - Try different topics and emotions
2. **Test gestures** - Say "hello", "yes", "no", "I love this"
3. **Customize avatar** - Create your perfect companion at Ready Player Me
4. **Adjust personality** - Edit the system prompt to your preferences
5. **Explore features** - Try all the emotions and gestures

## 📚 Additional Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Ready Player Me Docs](https://docs.readyplayer.me/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Web Speech API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🆘 Getting Help

If you encounter issues:

1. Check browser console (F12) for error messages
2. Review this troubleshooting guide
3. Check the main README.md
4. Search for error messages online
5. Open an issue on GitHub with:
   - Error message
   - Browser and version
   - Steps to reproduce

## 🎊 You're Ready!

Enjoy your AI companion! Aria is ready to chat, listen, and be your supportive virtual friend.

**Have fun! 💕**
