import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { openaiService } from '../services/openai.service';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/voice/transcribe
 * Transcribe audio to text using Whisper
 */
router.post('/transcribe', uploadMiddleware.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const transcription = await openaiService.transcribeAudio(req.file as any);

    res.json({ text: transcription });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/voice/synthesize
 * Convert text to speech using TTS
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await openaiService.generateSpeech(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);
  } catch (error: any) {
    console.error('Error synthesizing speech:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
