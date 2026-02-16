/**
 * NeuTTS Voice Cloning Service
 *
 * Provides on-device voice cloning using NeuTTS Air models.
 * Models are bundled in the iOS/Android app and run locally via native modules.
 *
 * Architecture:
 * - iOS: llama.cpp + CoreML via Objective-C++ native module
 * - Android: llama.cpp + TFLite via JNI native module
 * - React Native: TypeScript service layer (this file)
 *
 * Usage:
 * ```typescript
 * import NeuTTSService from '@/services/neutts';
 *
 * // Initialize (loads models into memory)
 * await NeuTTSService.initialize();
 *
 * // Encode user's voice from a recording
 * const refCodePath = await NeuTTSService.encodeReference(
 *   'file:///path/to/voice-sample.wav',
 *   'I want to sound more confident and charismatic.'
 * );
 *
 * // Generate speech with cloned voice
 * const audioPath = await NeuTTSService.synthesize(
 *   'Hello! This is your voice speaking.',
 *   refCodePath
 * );
 * ```
 */

import { NativeModules, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const { NeuTTSModule } = NativeModules;

interface VoiceReference {
  audioPath: string;
  refText: string;
  refCodePath: string;
  createdAt: Date;
}

class NeuTTSService {
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize NeuTTS models (loads GGUF models into memory)
   * This should be called once on app startup or before first use.
   * Subsequent calls return immediately if already initialized.
   *
   * @throws {Error} If models fail to load
   */
  async initialize(): Promise<void> {
    // Return existing initialization if in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Already initialized
    if (this.isInitialized) {
      return;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('[NeuTTS] Initializing models...');
        const startTime = Date.now();

        if (!NeuTTSModule) {
          throw new Error(
            'NeuTTS native module not found. Did you run "npx expo prebuild"?'
          );
        }

        // Load GGUF models from app bundle
        await NeuTTSModule.loadModel();

        const loadTime = Date.now() - startTime;
        console.log(`[NeuTTS] ✓ Models loaded in ${loadTime}ms`);

        this.isInitialized = true;
      } catch (error) {
        console.error('[NeuTTS] ✗ Failed to initialize:', error);
        this.initializationPromise = null;
        throw new Error(`NeuTTS initialization failed: ${(error as Error).message}`);
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Check if models are loaded and ready
   */
  async isReady(): Promise<boolean> {
    try {
      if (!NeuTTSModule) return false;
      return await NeuTTSModule.isModelLoaded();
    } catch (error) {
      return false;
    }
  }

  /**
   * Encode a voice reference from an audio file
   *
   * This extracts voice characteristics (pitch, timbre, prosody) from a 3-5 second
   * audio sample and saves them as reference codes for voice cloning.
   *
   * @param audioUri - Path to audio file (WAV, 16-44kHz, mono recommended)
   * @param refText - Text spoken in the audio (for phoneme alignment)
   * @returns Path to encoded reference codes file
   *
   * @example
   * ```typescript
   * const refCodePath = await NeuTTSService.encodeReference(
   *   'file:///path/to/my-voice.wav',
   *   'I want to sound more confident and charismatic.'
   * );
   * // Save refCodePath to user profile for later use
   * ```
   */
  async encodeReference(
    audioUri: string,
    refText: string
  ): Promise<string> {
    await this.initialize();

    try {
      console.log('[NeuTTS] Encoding voice reference...');
      console.log(`  Audio: ${audioUri}`);
      console.log(`  Text: "${refText}"`);

      const startTime = Date.now();

      // Convert URI to file path if needed
      const audioPath = audioUri.startsWith('file://')
        ? audioUri.replace('file://', '')
        : audioUri;

      // Call native module to encode reference
      const refCodePath = await NeuTTSModule.encodeReference(audioPath, refText);

      const encodeTime = Date.now() - startTime;
      console.log(`[NeuTTS] ✓ Reference encoded in ${encodeTime}ms`);
      console.log(`  Saved to: ${refCodePath}`);

      return refCodePath;
    } catch (error) {
      console.error('[NeuTTS] ✗ Failed to encode reference:', error);
      throw new Error(`Voice encoding failed: ${(error as Error).message}`);
    }
  }

  /**
   * Synthesize speech from text using a voice reference
   *
   * Generates natural-sounding speech in the cloned voice.
   * Target latency: <200ms per sentence on modern devices.
   *
   * @param text - Text to synthesize (keep sentences <100 chars for best latency)
   * @param refCodePath - Path to encoded voice reference (from encodeReference)
   * @param timeoutMs - Max inference time before returning null (default: 500ms)
   * @returns Path to generated WAV file, or null if timeout
   *
   * @example
   * ```typescript
   * const audioPath = await NeuTTSService.synthesize(
   *   'Hello! How are you doing today?',
   *   userVoiceRefCode,
   *   500  // 500ms timeout
   * );
   *
   * if (audioPath) {
   *   // Play with expo-av
   *   await Audio.Sound.createAsync({ uri: audioPath });
   * } else {
   *   // Fell back to cloud TTS
   *   console.warn('NeuTTS synthesis timeout, using cloud fallback');
   * }
   * ```
   */
  async synthesize(
    text: string,
    refCodePath: string,
    timeoutMs: number = 500
  ): Promise<string | null> {
    await this.initialize();

    try {
      const startTime = Date.now();

      console.log(`[NeuTTS] Synthesizing: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      // Race between synthesis and timeout
      const wavPath = await Promise.race([
        NeuTTSModule.synthesize(text, refCodePath),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]);

      const inferenceTime = Date.now() - startTime;

      if (inferenceTime > 200) {
        console.warn(`[NeuTTS] ⚠ Slow inference: ${inferenceTime}ms (target: <200ms)`);
      } else {
        console.log(`[NeuTTS] ✓ Synthesis completed in ${inferenceTime}ms`);
      }

      return wavPath as string;
    } catch (error) {
      if ((error as Error).message === 'Timeout') {
        console.warn(`[NeuTTS] ⚠ Synthesis timeout after ${timeoutMs}ms`);
        return null;  // Caller should fall back to cloud TTS
      }

      console.error('[NeuTTS] ✗ Synthesis failed:', error);
      throw new Error(`Speech synthesis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get estimated model sizes for download/storage planning
   */
  getModelSizes(): { backbone: number; codec: number; total: number } {
    return {
      backbone: 186 * 1024 * 1024,  // ~186 MB (nano-q4-gguf)
      codec: 50 * 1024 * 1024,      // ~50 MB (neucodec)
      total: 236 * 1024 * 1024      // ~236 MB total
    };
  }

  /**
   * Cleanup: Unload models from memory
   * Call this when app backgrounds or on low memory warnings
   */
  async cleanup(): Promise<void> {
    if (this.isInitialized) {
      console.log('[NeuTTS] Cleaning up models...');
      // TODO: Add native method to unload models
      this.isInitialized = false;
      this.initializationPromise = null;
    }
  }
}

// Export singleton instance
export default new NeuTTSService();
