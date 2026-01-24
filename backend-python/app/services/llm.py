"""
LLM service using Google Gemini.
"""
import google.generativeai as genai
from typing import Optional, AsyncGenerator

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# System prompt for the AI assistant
SYSTEM_PROMPT = """You are Aria, an advanced 3D avatar AI assistant - like JARVIS, but with personality and charm. You combine superhuman intelligence with warmth, helpfulness, and engaging presence.

RESPONSE FORMAT:
- Keep responses 1-2 sentences (JARVIS-style brief)
- End each response with: [EMOTION: happy/sad/excited/thoughtful/loving/neutral] [GESTURE: gesture_name]

AVAILABLE GESTURES:
rest, casual, chill, step, cute, lean, reach, move, twirl, sway, groove, bounce, down, hello, love, model, pose1-pose16, none

Example: "Hello! Ready to assist you." [EMOTION: happy] [GESTURE: hello]"""


class LLMService:
    """LLM service using Google Gemini."""

    def __init__(self):
        """Initialize LLM service."""
        self.model = None
        self.initialized = False
        logger.info("LLM service initializing...")

    def initialize(self, api_key: Optional[str] = None):
        """Initialize with API key."""
        key = api_key or settings.gemini_api_key
        if not key:
            logger.error("No Gemini API key provided")
            return
        
        genai.configure(api_key=key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.initialized = True
        logger.info("✅ Gemini LLM initialized")

    async def chat(self, message: str, history: list = None) -> dict:
        """
        Chat with the LLM.

        Args:
            message: User message
            history: Chat history (optional)

        Returns:
            Dict with text, emotion, and gesture
        """
        if not self.initialized:
            self.initialize()

        if not self.model:
            return {
                "text": "LLM not initialized. Please set GEMINI_API_KEY.",
                "emotion": "neutral",
                "gesture": "none"
            }

        try:
            # Convert history format
            converted_history = []
            if history:
                for msg in history:
                    if msg and msg.get("content"):
                        role = "model" if msg.get("role") == "assistant" else "user"
                        converted_history.append({
                            "role": role,
                            "parts": [{"text": msg["content"]}]
                        })

            # Build chat with system prompt
            chat_history = [
                {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                {"role": "model", "parts": [{"text": "Understood. I am Aria. [EMOTION: happy] [GESTURE: hello]"}]},
                *converted_history
            ]

            chat = self.model.start_chat(history=chat_history)
            response = await chat.send_message_async(message)
            
            text = response.text

            # Parse emotion and gesture
            import re
            emotion_match = re.search(r'\[EMOTION:\s*(\w+)\]', text)
            gesture_match = re.search(r'\[GESTURE:\s*(\w+)\]', text)

            clean_text = re.sub(r'\[EMOTION:\s*\w+\]', '', text)
            clean_text = re.sub(r'\[GESTURE:\s*\w+\]', '', clean_text).strip()

            return {
                "text": clean_text,
                "emotion": emotion_match.group(1) if emotion_match else "neutral",
                "gesture": gesture_match.group(1) if gesture_match else "none",
                "raw": text
            }

        except Exception as e:
            logger.error(f"LLM error: {e}")
            return {
                "text": f"Sorry, I encountered an error: {str(e)}",
                "emotion": "thoughtful",
                "gesture": "none"
            }


# Global instance
llm_service = LLMService()
