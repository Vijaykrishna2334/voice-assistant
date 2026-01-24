"""
Voice Activity Detection (VAD) using Silero-VAD.
Used for barge-in detection - interrupting TTS when user speaks.
"""
import torch
import struct
import numpy as np
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class VADService:
    """Voice Activity Detection using Silero-VAD neural model."""

    def __init__(self, threshold: Optional[float] = None, sample_rate: int = 16000):
        """Initialize VAD service."""
        self.threshold = threshold or settings.vad_threshold
        self.sample_rate = sample_rate
        self.model = None
        self.model_loaded = False
        self.use_energy_fallback = False
        self.energy_threshold = 500
        
        logger.info(f"VAD initialized: threshold={self.threshold}")

    async def load_model(self) -> None:
        """Load the Silero-VAD model."""
        try:
            self.model, utils = torch.hub.load(
                repo_or_dir='snakers4/silero-vad',
                model='silero_vad',
                force_reload=False,
                onnx=False
            )
            
            self.model_loaded = True
            logger.info("✅ Silero-VAD model loaded successfully")
            
        except Exception as e:
            logger.warning(f"Failed to load Silero-VAD, using energy fallback: {e}")
            self.use_energy_fallback = True
            self.model_loaded = True

    async def detect_speech(self, audio_data: bytes) -> bool:
        """
        Detect if audio contains speech.

        Args:
            audio_data: Raw audio bytes (16-bit PCM)

        Returns:
            True if speech detected (for barge-in)
        """
        if not self.model_loaded:
            return False

        if len(audio_data) < 2:
            return False

        try:
            if self.use_energy_fallback:
                return await self._detect_speech_energy(audio_data)
            else:
                return await self._detect_speech_silero(audio_data)
                
        except Exception as e:
            logger.error(f"VAD error: {e}")
            return True  # Assume speech on error

    async def _detect_speech_silero(self, audio_data: bytes) -> bool:
        """Detect speech using Silero-VAD neural model."""
        try:
            num_samples = len(audio_data) // 2
            audio_int16 = struct.unpack(f'<{num_samples}h', audio_data[:num_samples * 2])
            audio_float32 = np.array(audio_int16, dtype=np.float32) / 32768.0
            
            # Silero-VAD requires exactly 512 samples for 16kHz
            required_samples = 512
            
            if len(audio_float32) < required_samples:
                audio_float32 = np.pad(audio_float32, (0, required_samples - len(audio_float32)))
            elif len(audio_float32) > required_samples:
                audio_float32 = audio_float32[:required_samples]
            
            audio_tensor = torch.from_numpy(audio_float32)
            speech_prob = self.model(audio_tensor, self.sample_rate).item()
            
            is_speech = speech_prob > self.threshold
            
            if is_speech:
                logger.debug(f"🎤 Speech detected: prob={speech_prob:.2f}")
            
            return is_speech
            
        except Exception as e:
            logger.error(f"Silero-VAD error: {e}")
            return await self._detect_speech_energy(audio_data)

    async def _detect_speech_energy(self, audio_data: bytes) -> bool:
        """Fallback: Energy-based speech detection."""
        try:
            num_samples = len(audio_data) // 2
            samples = struct.unpack(f'<{num_samples}h', audio_data[:num_samples * 2])
            
            sum_squares = sum(s * s for s in samples)
            rms = (sum_squares / num_samples) ** 0.5 if num_samples > 0 else 0
            
            is_speech = rms > self.energy_threshold
            
            if is_speech:
                logger.debug(f"🎤 Speech detected (energy): rms={rms:.0f}")
            
            return is_speech
            
        except Exception as e:
            logger.error(f"Energy VAD error: {e}")
            return True


# Global instance
vad_service = VADService()
