# 🎭 VRM Avatar System - Upgrade Guide

## What's New?

Your AI companion now supports **VTuber-style anime avatars** using the VRM format!

## ✨ New Features

### 1. VRM Avatar Support
- **Load anime-style characters** from VRoid Studio
- **Full facial expressions** using VRM blendshapes
- **Eye tracking** - avatar looks around naturally
- **Better lip sync** - mouth movements match speech
- **Automatic blinking** - realistic eye animations

### 2. Enhanced Animations
- **Full body IK** - natural movement
- **Improved gestures** - waving, dancing, jumping
- **Body sway** - subtle idle movements
- **Spring bone physics** - hair and clothing movement (VRM feature)

### 3. Better Lighting
- **Optimized for anime** - softer shadows, better colors
- **Multiple light sources** - fill, rim, and key lights
- **Smooth camera** - damping for cinematic feel

## 🎨 Avatar Types Supported

### VRM Format (.vrm) - NEW! ⭐
- **Best for**: Anime/VTuber style characters
- **Created with**: VRoid Studio (free software)
- **Features**: Full expressions, eye tracking, physics
- **Example**: The twin-tail blonde character you showed

### GLB Format (.glb)
- **Best for**: Realistic characters
- **Created with**: Ready Player Me, Blender
- **Features**: Basic animations
- **Example**: Photorealistic avatars

## 🚀 Quick Start with VRM

### Option 1: Use VRoid Studio (Create Your Own)

1. **Download VRoid Studio**
   - Free: https://vroid.com/en/studio
   - Available for Windows & Mac

2. **Create Character**
   - Open VRoid Studio
   - Choose female/male preset
   - Customize: hair (twin-tails!), face, outfit
   - Add accessories (choker, belt, etc.)

3. **Export VRM**
   - Click "Camera/Export"
   - Choose VRM 0.0 format
   - Save .vrm file

4. **Use in App**
   - Upload to cloud storage (get public URL)
   - Or place in `public/avatars/` folder
   - Paste URL in configuration screen

### Option 2: Download Ready-Made VRM

1. **VRoid Hub** (Free)
   - Visit: https://hub.vroid.com/
   - Browse characters
   - Download .vrm file (if allowed)

2. **Booth** (Free & Paid)
   - Visit: https://booth.pm/
   - Search: "VRM モデル"
   - Purchase and download

### Option 3: Use Sample VRM (Instant)

Default VRM is already configured! Just:
1. Start the app
2. Enter your Gemini API key
3. Leave avatar URL empty
4. A sample anime character will load

## 📐 Character Like Your Reference Images

To create the blonde twin-tail character you showed:

### In VRoid Studio:

**Hair:**
- Style: Twin-tails (pigtails)
- Color: Blonde/golden (#FFD700)
- Length: Medium to waist
- Volume: High/fluffy

**Face:**
- Eyes: Large, bright (amber/gold color)
- Expression: Gentle/confident
- Makeup: Light blush, eyeliner

**Outfit:**
- Base: Black off-shoulder dress
- Belt: Gold buckle at waist
- Top: Short puffy sleeves
- Skirt: Flared, above knee
- Accessories: Choker/collar
- Stockings: Dark (use texture overlay for fishnet)
- Gloves: Fingerless, black

**Details:**
- Add metallic textures for belt/buckles
- Glossy material for leather-look parts
- Soft fabric for dress
- Enable hair physics for natural movement

## 🎮 Testing Your VRM Avatar

After loading your VRM:

1. ✅ **Model loads correctly** - character appears in scene
2. ✅ **Facial expressions work** - smile when happy, sad face when empathetic
3. ✅ **Eye tracking** - eyes move and look around
4. ✅ **Lip sync** - mouth moves when speaking
5. ✅ **Blinking** - automatic eye blinking every ~3 seconds
6. ✅ **Gestures** - wave, nod, dance, jump work properly
7. ✅ **Physics** - hair and clothing move naturally

## 🔧 Technical Details

### What Changed?

**New Dependencies:**
```json
"@pixiv/three-vrm": "^2.x" // VRM loader for Three.js
```

**New Files:**
- `src/services/vrmLoader.ts` - VRM loading service
- `src/components/EnhancedAvatar.tsx` - Avatar with VRM support
- `AVATAR_GUIDE.md` - Complete avatar creation guide

**Updated Files:**
- `src/components/Scene.tsx` - Uses EnhancedAvatar, better lighting
- `src/components/ConfigPanel.tsx` - VRM info and hints

### Avatar Loading Logic

```typescript
// Automatically detects file type
const fileType = url.endsWith('.vrm') ? 'vrm' : 'glb'

// VRM: Full expressions, eye tracking, physics
// GLB: Basic animations only
```

### Expression System

VRM expressions mapped to emotions:
```typescript
happy → 'happy' blendshape
sad → 'sad' blendshape
excited → 'happy' blendshape
loving → 'happy' blendshape
thoughtful → 'neutral' blendshape
```

Lip sync using 'aa' mouth shape (あ sound).

## 📝 Compatibility

### Browser Support
- ✅ Chrome/Edge - Full support
- ✅ Firefox - Full support
- ⚠️ Safari - Limited VRM support

### Performance
- VRM models: 30,000-50,000 polygons recommended
- Texture size: 1024x1024 or 2048x2048
- FPS: 60fps on modern hardware

## 🎨 Sample VRM URLs

Try these sample avatars:

### Official Three-VRM Samples:
```
https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm
```

### Create Your Own:
See **AVATAR_GUIDE.md** for complete tutorial!

## 🐛 Troubleshooting

### VRM Won't Load
- Check file extension is `.vrm`
- Verify URL is publicly accessible
- Try opening URL in browser first
- Check browser console for errors

### Animations Look Weird
- Ensure VRM is in T-pose before export
- Check humanoid rig is correct
- Try different VRM version (0.0 vs 1.0)

### Poor Performance
- Reduce texture size in VRoid export
- Lower polygon count
- Disable spring physics if needed

### Expressions Don't Work
- Verify blendshapes exist in VRM
- Check VRM version compatibility
- Test in VRM viewer first

## 💡 Pro Tips

1. **Start with VRoid presets** - easier than from scratch
2. **Export multiple versions** - different texture sizes for testing
3. **Keep .vroid project files** - so you can edit later
4. **Test in VRM Viewer** first - before using in app
5. **Optimize for web** - balance quality vs. file size
6. **Use public CDN** - faster loading than personal servers

## 🎊 You're Ready!

Your AI companion can now use beautiful anime-style VTuber avatars!

**Next steps:**
1. Try the default VRM avatar
2. Create your own in VRoid Studio
3. Download from VRoid Hub
4. Commission a custom character

For detailed instructions on creating avatars exactly like your reference images, see **AVATAR_GUIDE.md**!

---

**Made with ❤️ for VTuber fans**
