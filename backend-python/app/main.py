"""
Voice Assistant Python Backend
FastAPI application with Whisper STT, Kokoro TTS, and Gemini LLM.
"""
import os
import base64
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List

from app.core.config import settings
from app.core.logging import get_logger
from app.services.llm import llm_service
from app.services.voice import stt_service, tts_service, vad_service

logger = get_logger(__name__)


# Request/Response models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[int] = None


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    text: str
    emotion: str
    gesture: str
    raw: Optional[str] = None


class TranscribeRequest(BaseModel):
    audio: str  # Base64 encoded audio
    language: str = "en"


class SynthesizeRequest(BaseModel):
    text: str


# Lifespan handler for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("🚀 Starting Voice Assistant Backend...")
    
    # Initialize LLM
    llm_service.initialize()
    
    # Load voice models (lazy loading - will load on first use)
    logger.info("Voice models will load on first use")
    
    yield
    
    logger.info("👋 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Voice Assistant API",
    description="Python backend with Whisper STT, Kokoro TTS, and Gemini LLM",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "stt": "whisper-" + settings.stt_model,
        "tts": "kokoro-" + settings.kokoro_voice,
        "llm": "gemini"
    }


# Chat endpoint (same as before, for compatibility)
@app.post("/api/chat/simple", response_model=ChatResponse)
async def chat_simple(request: ChatRequest):
    """Non-streaming chat endpoint."""
    try:
        history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
        result = await llm_service.chat(request.message, history)
        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Transcribe audio (STT)
@app.post("/api/voice/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    """Transcribe audio using Faster-Whisper."""
    try:
        # Load model if not loaded
        if not stt_service.model_loaded:
            await stt_service.load_model()
        
        # Decode base64 audio
        audio_data = base64.b64decode(request.audio)
        
        # Transcribe
        result = await stt_service.transcribe(audio_data, request.language)
        
        return result
        
    except Exception as e:
        logger.error(f"Transcribe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Synthesize speech (TTS)
@app.post("/api/voice/synthesize")
async def synthesize_speech(request: SynthesizeRequest):
    """Synthesize speech using Kokoro TTS."""
    try:
        # Load model if not loaded
        if not tts_service.model_loaded:
            await tts_service.load_model()
        
        # Generate audio
        audio_bytes = await tts_service.synthesize(request.text)
        
        # Return as WAV
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"}
        )
        
    except Exception as e:
        logger.error(f"Synthesize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# WebSocket for real-time voice with barge-in
@app.websocket("/api/voice/stream")
async def voice_stream(websocket: WebSocket):
    """
    Real-time voice WebSocket with barge-in support.
    
    Protocol:
    - Client sends: {"type": "audio", "data": "<base64 audio>"}
    - Server sends: {"type": "transcript", "text": "..."}
    - Server sends: {"type": "response", "text": "...", "emotion": "...", "gesture": "..."}
    - Server sends: {"type": "audio", "data": "<base64 audio>"}
    - Client sends: {"type": "interrupt"} - barge-in to stop TTS
    """
    await websocket.accept()
    logger.info("Voice WebSocket connected")
    
    # Load models
    if not stt_service.model_loaded:
        await stt_service.load_model()
    if not tts_service.model_loaded:
        await tts_service.load_model()
    if not vad_service.model_loaded:
        await vad_service.load_model()
    
    audio_buffer = b""
    is_speaking = False  # TTS is playing
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "audio":
                # Decode audio chunk
                audio_chunk = base64.b64decode(data["data"])
                
                # Check for barge-in (user speaking while TTS is playing)
                if is_speaking:
                    has_speech = await vad_service.detect_speech(audio_chunk)
                    if has_speech:
                        logger.info("🛑 Barge-in detected! Stopping TTS")
                        await websocket.send_json({"type": "stop_audio"})
                        is_speaking = False
                        audio_buffer = audio_chunk  # Start new buffer
                        continue
                
                # Accumulate audio
                audio_buffer += audio_chunk
                
                # Process when we have ~1 second of audio
                if len(audio_buffer) >= 32000:  # 16kHz * 2 bytes * 1 sec
                    # Check if speech
                    has_speech = await vad_service.detect_speech(audio_buffer)
                    
                    if has_speech:
                        # Transcribe
                        result = await stt_service.transcribe(audio_buffer)
                        text = result.get("text", "")
                        
                        if text and not text.startswith("["):
                            await websocket.send_json({
                                "type": "transcript",
                                "text": text
                            })
                            
                            # Get LLM response
                            response = await llm_service.chat(text)
                            await websocket.send_json({
                                "type": "response",
                                **response
                            })
                            
                            # Generate TTS
                            is_speaking = True
                            audio_bytes = await tts_service.synthesize(response["text"])
                            
                            # Send audio in chunks
                            chunk_size = 32000
                            for i in range(0, len(audio_bytes), chunk_size):
                                chunk = audio_bytes[i:i+chunk_size]
                                await websocket.send_json({
                                    "type": "audio",
                                    "data": base64.b64encode(chunk).decode()
                                })
                            
                            await websocket.send_json({"type": "audio_end"})
                            is_speaking = False
                    
                    audio_buffer = b""
            
            elif data["type"] == "interrupt":
                logger.info("Client requested interrupt")
                is_speaking = False
                audio_buffer = b""
            
            elif data["type"] == "end":
                # Process remaining audio
                if len(audio_buffer) > 1000:
                    result = await stt_service.transcribe(audio_buffer)
                    text = result.get("text", "")
                    
                    if text and not text.startswith("["):
                        await websocket.send_json({
                            "type": "transcript",
                            "text": text,
                            "is_final": True
                        })
                
                audio_buffer = b""
    
    except WebSocketDisconnect:
        logger.info("Voice WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
