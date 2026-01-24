"""Configuration settings using Pydantic."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Get the directory where this config file is located
CONFIG_DIR = Path(__file__).parent.parent.parent
ENV_FILE = CONFIG_DIR / ".env"

# Explicitly load the .env file
load_dotenv(ENV_FILE)


class Settings(BaseSettings):
    """Application settings."""
    
    # Server
    port: int = 3001
    host: str = "0.0.0.0"
    
    # Gemini
    gemini_api_key: str = ""
    
    # STT (Faster-Whisper)
    stt_model: str = "tiny.en"
    
    # TTS (Kokoro)
    kokoro_voice: str = "af_heart"
    kokoro_lang_code: str = "a"
    
    # VAD
    vad_threshold: float = 0.5
    
    class Config:
        env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"


def get_settings() -> Settings:
    """Get settings."""
    return Settings()


settings = get_settings()

