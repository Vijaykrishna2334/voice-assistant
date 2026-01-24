"""
Text-to-Speech service using Kokoro-82M TTS.
Lightweight 82M parameter model with high quality output.
"""
import io
import wave
import numpy as np
from typing import Optional, AsyncGenerator

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_device():
    """Detect best available device for TTS."""
    try:
        import torch
        if torch.cuda.is_available():
            logger.info("CUDA GPU detected for Kokoro TTS")
            return "cuda"
    except ImportError:
        pass
    return "cpu"


class KokoroTTSService:
    """Text-to-Speech service using Kokoro-82M TTS."""

    def __init__(self, voice: Optional[str] = None, lang_code: Optional[str] = None):
        """Initialize Kokoro TTS service."""
        self.voice = voice or settings.kokoro_voice
        self.lang_code = lang_code or settings.kokoro_lang_code
        self.sample_rate = 24000  # Kokoro outputs at 24kHz
        self.pipeline = None
        self.model_loaded = False
        self.device = get_device()
        logger.info(f"TTS initialized: voice={self.voice}, device={self.device}")

    async def load_model(self) -> None:
        """Load the Kokoro TTS model."""
        try:
            from kokoro import KPipeline
            
            logger.info("Loading Kokoro TTS model...")
            self.pipeline = KPipeline(lang_code=self.lang_code)
            self.model_loaded = True
            logger.info("✅ Kokoro TTS model loaded successfully")
                
        except ImportError as e:
            logger.error("kokoro not installed - run: pip install 'kokoro>=0.9.2' soundfile")
            raise
        except Exception as e:
            logger.error(f"Failed to load Kokoro TTS: {e}")
            raise

    async def synthesize(self, text: str) -> bytes:
        """
        Synthesize speech from text.

        Args:
            text: Text to synthesize

        Returns:
            WAV audio data as bytes
        """
        if not self.model_loaded:
            await self.load_model()

        logger.info(f"Synthesizing: {text[:50]}...")

        try:
            generator = self.pipeline(text, voice=self.voice)
            
            audio_chunks = []
            for i, (gs, ps, audio) in enumerate(generator):
                audio_chunks.append(audio)
            
            if audio_chunks:
                full_audio = np.concatenate(audio_chunks)
            else:
                logger.warning("No audio generated")
                return b""

            # Convert to WAV bytes
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(self.sample_rate)
                audio_int16 = (full_audio * 32767).astype(np.int16)
                wav_file.writeframes(audio_int16.tobytes())

            wav_bytes = wav_buffer.getvalue()
            logger.info(f"Generated {len(wav_bytes)} bytes of audio")
            return wav_bytes

        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            raise

    async def synthesize_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """Stream synthesize speech from text."""
        if not self.model_loaded:
            await self.load_model()

        try:
            generator = self.pipeline(text, voice=self.voice)
            
            for i, (gs, ps, audio) in enumerate(generator):
                wav_buffer = io.BytesIO()
                with wave.open(wav_buffer, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(self.sample_rate)
                    audio_int16 = (audio * 32767).astype(np.int16)
                    wav_file.writeframes(audio_int16.tobytes())
                
                yield wav_buffer.getvalue()

        except Exception as e:
            logger.error(f"TTS streaming failed: {e}")
            raise


# Global instance
tts_service = KokoroTTSService()
