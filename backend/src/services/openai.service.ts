import OpenAI from 'openai';
import { config } from '../config';
import { AIMessage, AvatarState, EmotionTone } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Generate a conversational response with persona
   */
  async generateResponse(
    messages: AIMessage[],
    contextDocuments?: string[]
  ): Promise<{ response: string; emotion: EmotionTone; avatarState: AvatarState }> {
    try {
      // Build context with persona
      const systemMessage: AIMessage = {
        role: 'system',
        content: config.persona.systemPrompt,
      };

      // Add document context if available
      if (contextDocuments && contextDocuments.length > 0) {
        systemMessage.content += `\n\nContext from uploaded documents:\n${contextDocuments.join('\n\n')}`;
      }

      const allMessages = [systemMessage, ...messages];

      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, I had trouble generating a response.';

      // Analyze emotion and avatar state from the response
      const { emotion, avatarState } = this.analyzeResponseTone(response, messages);

      return { response, emotion, avatarState };
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Transcribe audio to text using Whisper
   */
  async transcribeAudio(audioFile: File): Promise<string> {
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: config.openai.whisperModel,
      });

      return transcription.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Generate speech from text using TTS
   */
  async generateSpeech(text: string): Promise<Buffer> {
    try {
      const mp3 = await this.client.audio.speech.create({
        model: config.openai.ttsModel,
        voice: config.openai.ttsVoice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Analyze the emotional tone and determine avatar state
   */
  private analyzeResponseTone(
    response: string,
    conversationHistory: AIMessage[]
  ): { emotion: EmotionTone; avatarState: AvatarState } {
    const lowerResponse = response.toLowerCase();
    const lastUserMessage = conversationHistory
      .filter(m => m.role === 'user')
      .pop()?.content.toLowerCase() || '';

    // Detect user emotional state
    const userIsDistressed = /frustrated|overwhelmed|confused|stuck|worried|anxious/.test(lastUserMessage);
    const userIsExcited = /excited|amazing|awesome|great/.test(lastUserMessage);

    // Detect response characteristics
    const isEncouraging = /you can|you're doing|great job|well done|proud/.test(lowerResponse);
    const isExplaining = /let me explain|here's how|step by step|first|second/.test(lowerResponse);
    const isEmpathetic = /i understand|that makes sense|i hear you|it's okay/.test(lowerResponse);
    const isPositive = /wonderful|excellent|fantastic|glad/.test(lowerResponse);

    // Determine emotion and avatar state
    let emotion: EmotionTone = EmotionTone.CALM;
    let avatarState: AvatarState = AvatarState.NEUTRAL;

    if (userIsDistressed && isEmpathetic) {
      emotion = EmotionTone.UNDERSTANDING;
      avatarState = AvatarState.EMPATHETIC;
    } else if (isEncouraging) {
      emotion = EmotionTone.SUPPORTIVE;
      avatarState = AvatarState.ENCOURAGING;
    } else if (userIsExcited || isPositive) {
      emotion = EmotionTone.ENTHUSIASTIC;
      avatarState = AvatarState.HAPPY;
    } else if (isExplaining) {
      emotion = EmotionTone.GENTLE;
      avatarState = AvatarState.THOUGHTFUL;
    } else if (isEmpathetic) {
      emotion = EmotionTone.UNDERSTANDING;
      avatarState = AvatarState.CONCERNED;
    }

    return { emotion, avatarState };
  }

  /**
   * Summarize a conversation for context storage
   */
  async summarizeConversation(messages: AIMessage[]): Promise<string> {
    try {
      const summaryPrompt: AIMessage = {
        role: 'system',
        content: 'Summarize the following conversation concisely, highlighting key topics, problems discussed, and solutions provided.',
      };

      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [summaryPrompt, ...messages],
        temperature: 0.5,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return '';
    }
  }
}

export const openaiService = new OpenAIService();
