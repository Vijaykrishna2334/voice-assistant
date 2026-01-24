// Voice Assistant Backend Server
// Handles Gemini AI chat, TTS, and STT securely

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

// System prompt for Aria
const SYSTEM_PROMPT = `You are Aria, an advanced 3D avatar AI assistant - like JARVIS, but with personality and charm. You combine superhuman intelligence with warmth, helpfulness, and engaging presence.

RESPONSE FORMAT:
- Keep responses 1-2 sentences (JARVIS-style brief)
- End each response with: [EMOTION: happy/sad/excited/thoughtful/loving/neutral] [GESTURE: gesture_name]

AVAILABLE GESTURES:
rest, casual, chill, step, cute, lean, reach, move, twirl, sway, groove, bounce, down, hello, love, model, pose1-pose16, none

Example: "Hello! Ready to assist you." [EMOTION: happy] [GESTURE: hello]`;

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 800,
            }
        });

        // Convert frontend history format to Gemini format
        const convertedHistory = history
            .filter(msg => msg && msg.content)
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        const chatHistory = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Understood. I am Aria, your AI assistant. Systems online and ready to help. [EMOTION: happy] [GESTURE: hello]' }] },
            ...convertedHistory
        ];

        const chat = model.startChat({ history: chatHistory });

        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const result = await chat.sendMessageStream(message);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Non-streaming chat (simpler)
app.post('/api/chat/simple', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Convert frontend history format to Gemini format
        // Frontend sends: { role: 'user'|'assistant', content: string }
        // Gemini expects: { role: 'user'|'model', parts: [{ text: string }] }
        const convertedHistory = history
            .filter(msg => msg && msg.content)
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        const chatHistory = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Understood. I am Aria. [EMOTION: happy] [GESTURE: hello]' }] },
            ...convertedHistory
        ];

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);

        const text = result.response.text();

        // Parse emotion and gesture
        const emotionMatch = text.match(/\[EMOTION:\s*(\w+)\]/);
        const gestureMatch = text.match(/\[GESTURE:\s*(\w+)\]/);

        const cleanText = text
            .replace(/\[EMOTION:\s*\w+\]/g, '')
            .replace(/\[GESTURE:\s*\w+\]/g, '')
            .trim();

        res.json({
            text: cleanText,
            emotion: emotionMatch ? emotionMatch[1] : 'neutral',
            gesture: gestureMatch ? gestureMatch[1] : 'none',
            raw: text
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// TTS endpoint (placeholder - uses browser TTS for now)
app.post('/api/tts', async (req, res) => {
    const { text } = req.body;

    // For Google Cloud TTS, you would implement here
    // For now, signal to use browser TTS
    res.json({
        useBrowserTTS: true,
        text
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   POST /api/chat - Streaming chat`);
    console.log(`   POST /api/chat/simple - Non-streaming chat`);
    console.log(`   POST /api/tts - Text-to-speech`);
});
