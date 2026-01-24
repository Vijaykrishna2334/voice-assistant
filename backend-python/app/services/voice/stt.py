"""
Speech-to-Text service using Faster-Whisper.
Uses tiny.en model for fast transcription.
"""
import io
import wave
import tempfile
import os
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class STTService:
    """Speech-to-Text service using Faster-Whisper."""

    def __init__(self, model_size: Optional[str] = None):
        """Initialize STT service."""
        self.model_size = model_size or settings.stt_model
        
        # Auto-detect CUDA
        try:
            import torch
            if torch.cuda.is_available():
                self.device = "cuda"
                self.compute_type = "float16"
                logger.info(f"CUDA GPU detected: {torch.cuda.get_device_name(0)}")
            else:
                self.device = "cpu"
                self.compute_type = "int8"
        except ImportError:
            self.device = "cpu"
            self.compute_type = "int8"
        
        self.model = None
        self.model_loaded = False
        logger.info(f"STT initialized: model={self.model_size}, device={self.device}")

    async def load_model(self) -> None:
        """Load the Whisper model."""
        try:
            from faster_whisper import WhisperModel
            
            logger.info(f"Loading Whisper model: {self.model_size}...")
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )
            self.model_loaded = True
            logger.info("✅ STT model loaded successfully")
        except ImportError:
            logger.error("faster-whisper not installed")
            self.model_loaded = False
        except Exception as e:
            logger.error(f"Failed to load STT model: {e}")
            self.model_loaded = False

    def _bytes_to_wav_file(self, audio_data: bytes, sample_rate: int = 16000) -> str:
        """Convert raw audio bytes to a temporary WAV file."""
        temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        
        with wave.open(temp_file.name, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_data)
        
        return temp_file.name

    async def transcribe(self, audio_data: bytes, language: str = "en") -> dict:
        """
        Transcribe audio to text.

        Args:
            audio_data: Audio bytes (16-bit PCM, mono, 16kHz)
            language: Language code

        Returns:
            Dict with transcription result
        """
        if not self.model_loaded or self.model is None:
            return {
                "text": "[STT model not loaded]",
                "language": language,
                "confidence": 0.0,
            }

        try:
            temp_wav = self._bytes_to_wav_file(audio_data)
            
            try:
                segments, info = self.model.transcribe(
                    temp_wav,
                    language=language,
                    vad_filter=True,
                    beam_size=3,
                    vad_parameters=dict(
                        threshold=0.3,
                        min_speech_duration_ms=150,
                        min_silence_duration_ms=300
                    )
                )
                
                text_parts = []
                for segment in segments:
                    text_parts.append(segment.text)
                
                full_text = " ".join(text_parts).strip()
                
                logger.info(f"Transcribed: {full_text[:50]}...")
                
                return {
                    "text": full_text if full_text else "[No speech detected]",
                    "language": info.language if info else language,
                    "confidence": 0.9,
                }
                
            finally:
                if os.path.exists(temp_wav):
                    os.remove(temp_wav)
                    
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return {
                "text": f"[Transcription error: {str(e)}]",
                "language": language,
                "confidence": 0.0,
            }


# Global instance
stt_service = STTService()
