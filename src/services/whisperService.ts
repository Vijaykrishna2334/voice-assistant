// Whisper Speech-to-Text Service using Transformers.js
// Uses OpenAI Whisper tiny.en model running in the browser
// Falls back to Web Speech API if Whisper cannot load

import { pipeline, env } from '@huggingface/transformers';

// Configure to use Web Workers and cache models locally
env.allowLocalModels = false;
env.useBrowserCache = true;

type TranscriptionCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;
type StatusCallback = (status: string) => void;

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

class WhisperService {
    private transcriber: any = null;
    private isLoading: boolean = false;
    private isReady: boolean = false;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private isRecording: boolean = false;
    private statusCallback: StatusCallback | null = null;

    // Fallback mode
    private usingFallback: boolean = false;
    private recognition: any = null;

    constructor() {
        // Don't auto-initialize - wait for first use
    }

    /**
     * Set a callback to receive status updates (loading progress, etc.)
     */
    setStatusCallback(callback: StatusCallback) {
        this.statusCallback = callback;
    }

    /**
     * Check if Web Speech API is available
     */
    private isWebSpeechAvailable(): boolean {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Initialize Web Speech API fallback
     */
    private initializeWebSpeechFallback(): void {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.usingFallback = true;
            this.isReady = true;
            this.statusCallback?.('Using browser speech recognition');
            console.log('✅ Web Speech API fallback ready');
        }
    }

    /**
     * Initialize the Whisper model (downloads ~40MB on first use)
     * Falls back to Web Speech API if Whisper fails
     */
    async initialize(): Promise<void> {
        if (this.isReady || this.isLoading) return;

        this.isLoading = true;
        this.statusCallback?.('Loading Whisper model...');
        console.log('🎤 Loading Whisper tiny.en model...');

        try {
            // Load whisper-tiny.en for English speech recognition
            // Using automatic-speech-recognition pipeline
            this.transcriber = await pipeline(
                'automatic-speech-recognition',
                'onnx-community/whisper-tiny.en',
                {
                    device: 'webgpu', // Try WebGPU first for speed
                    dtype: 'fp32',
                }
            );

            this.isReady = true;
            this.isLoading = false;
            this.statusCallback?.('Whisper ready');
            console.log('✅ Whisper model loaded and ready!');
        } catch (error) {
            console.warn('⚠️ WebGPU not available, falling back to WASM...');

            try {
                // Fallback to WASM if WebGPU isn't available
                this.transcriber = await pipeline(
                    'automatic-speech-recognition',
                    'onnx-community/whisper-tiny.en',
                    {
                        device: 'wasm',
                        dtype: 'fp32',
                    }
                );

                this.isReady = true;
                this.isLoading = false;
                this.statusCallback?.('Whisper ready');
                console.log('✅ Whisper model loaded (WASM fallback)');
            } catch (wasmError) {
                console.warn('⚠️ WASM also failed, trying Web Speech API fallback...');

                // Ultimate fallback: Web Speech API
                if (this.isWebSpeechAvailable()) {
                    this.initializeWebSpeechFallback();
                    this.isLoading = false;
                } else {
                    this.isLoading = false;
                    this.statusCallback?.('Speech recognition unavailable');
                    console.error('❌ No speech recognition available');
                    throw new Error('No speech recognition backend available');
                }
            }
        }
    }

    /**
     * Check if Whisper is ready for transcription
     */
    isModelReady(): boolean {
        return this.isReady;
    }

    /**
     * Check if model is currently loading
     */
    isModelLoading(): boolean {
        return this.isLoading;
    }

    /**
     * Start listening for voice input
     */
    async startListening(
        onResult: TranscriptionCallback,
        onError?: ErrorCallback,
        onEnd?: () => void
    ): Promise<void> {
        // Initialize model if not ready
        if (!this.isReady) {
            try {
                await this.initialize();
            } catch (error) {
                onError?.('Failed to initialize speech recognition');
                return;
            }
        }

        // Use Web Speech API fallback if Whisper failed
        if (this.usingFallback && this.recognition) {
            console.log('🎤 Using Web Speech API fallback');
            this.isRecording = true;

            this.recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                if (finalTranscript) {
                    console.log('🎤 Web Speech Transcript:', finalTranscript);
                    onResult(finalTranscript.trim(), true);
                } else if (interimTranscript) {
                    onResult(interimTranscript, false);
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error('❌ Web Speech API error:', event.error);
                this.isRecording = false;
                if (event.error === 'not-allowed') {
                    onError?.('Microphone access denied');
                } else {
                    onError?.(`Speech recognition error: ${event.error}`);
                }
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                onEnd?.();
            };

            try {
                this.recognition.start();
                console.log('🎤 Web Speech API listening started');
            } catch (error) {
                console.error('❌ Failed to start Web Speech API:', error);
                onError?.('Failed to start listening');
                this.isRecording = false;
            }
            return;
        }

        // Use Whisper with MediaRecorder
        // Request microphone access
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000, // Whisper expects 16kHz
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });
            console.log('🎤 Microphone access granted');
        } catch (error) {
            console.error('❌ Microphone access denied:', error);
            onError?.('Microphone access denied');
            return;
        }

        // Set up MediaRecorder
        this.audioChunks = [];
        this.isRecording = true;

        // Use webm format (most compatible)
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm';

        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = async () => {
            console.log('🎤 Recording stopped, transcribing...');

            try {
                // Combine audio chunks into a single blob
                const audioBlob = new Blob(this.audioChunks, { type: mimeType });

                if (audioBlob.size < 1000) {
                    console.warn('⚠️ Audio too short, skipping transcription');
                    onEnd?.();
                    return;
                }

                // Convert blob to array buffer for Whisper
                const arrayBuffer = await audioBlob.arrayBuffer();

                // Transcribe with Whisper
                console.time('🎤 Whisper Transcription');
                const result = await this.transcriber(arrayBuffer, {
                    language: 'english',
                    task: 'transcribe',
                    return_timestamps: false,
                });
                console.timeEnd('🎤 Whisper Transcription');

                const transcript = result.text?.trim() || '';
                console.log('🎤 Transcript:', transcript);

                if (transcript) {
                    onResult(transcript, true);
                } else {
                    console.warn('⚠️ No speech detected');
                }
            } catch (error) {
                console.error('❌ Transcription error:', error);
                onError?.('Transcription failed');
            } finally {
                onEnd?.();
                this.cleanup();
            }
        };

        this.mediaRecorder.onerror = (event) => {
            console.error('❌ MediaRecorder error:', event);
            onError?.('Recording failed');
            this.cleanup();
        };

        // Start recording
        this.mediaRecorder.start();
        console.log('🎤 Recording started');
    }

    /**
     * Stop listening and trigger transcription
     */
    stopListening(): void {
        // Stop Web Speech API if using fallback
        if (this.usingFallback && this.recognition) {
            try {
                this.recognition.stop();
                console.log('🎤 Web Speech API stopped');
            } catch (error) {
                // Ignore errors when stopping
            }
            this.isRecording = false;
            return;
        }

        // Stop MediaRecorder for Whisper
        if (this.mediaRecorder && this.isRecording) {
            this.isRecording = false;
            this.mediaRecorder.stop();
            console.log('🎤 Stop requested');
        }
    }

    /**
     * Clean up resources
     */
    private cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.audioChunks = [];
        this.isRecording = false;
    }

    /**
     * Check if currently recording
     */
    isCurrentlyRecording(): boolean {
        return this.isRecording;
    }
}

// Singleton instance
export const whisperService = new WhisperService();
