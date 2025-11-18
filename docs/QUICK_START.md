# Quick Start Guide

Get your Personal AI Companion running in under 10 minutes!

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Step 1: Clone & Install

```bash
cd voice-assistant
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## Step 2: Database Setup

```bash
# Create a PostgreSQL database
createdb ai_companion

# Or use a cloud database:
# - Supabase (https://supabase.com)
# - Neon (https://neon.tech)
# - Railway (https://railway.app)
```

## Step 3: Configure Environment

```bash
# Backend configuration
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_companion"
OPENAI_API_KEY="sk-your-openai-api-key"
JWT_SECRET="your-random-secret-string"
```

```bash
# Frontend configuration
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

## Step 4: Initialize Database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

## Step 5: Run the Application

```bash
# Option 1: Run both together (recommended)
npm run dev

# Option 2: Run separately
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Step 6: Access the App

Open your browser and go to: **http://localhost:5173**

1. Click "Register" to create an account
2. Fill in your name, email, and password
3. Start chatting with your AI companion!

## Features to Try

### Text Chat
- Type a message and press Enter or click Send
- Ask questions, seek advice, or have a conversation

### Voice Input
- Click the microphone icon to start recording
- Speak your message
- Click again to stop and send

### Document Upload (Coming Soon)
- Upload PDF, DOCX, or TXT files
- Ask questions about the document content

### Avatar States
Watch the avatar change expressions based on:
- Your emotional state
- The type of conversation
- AI's response tone

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check DATABASE_URL is correct
- Try: `psql -d ai_companion` to test connection

### OpenAI API Error
- Verify your API key is correct
- Check you have credits: https://platform.openai.com/usage
- Ensure the key has proper permissions

### Port Already in Use
- Backend (3001): Change PORT in backend/.env
- Frontend (5173): Change port in frontend/vite.config.ts

### CORS Errors
- Make sure ALLOWED_ORIGINS in backend/.env includes your frontend URL
- Default: `http://localhost:5173`

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
- Check [API.md](./API.md) for API documentation
- See [DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment

## Need Help?

- Check the logs in your terminal
- Ensure all environment variables are set correctly
- Verify Node.js version: `node --version` (should be 18+)
- Make sure all dependencies are installed

## Default Behavior

- Conversations are auto-saved
- Avatar responds with voice (if browser supports it)
- Messages are stored in the database
- Context is remembered across sessions

Enjoy your AI companion! 🤖💜
