// Add new methods to OpenAIService in services/openai.ts
import * as FileSystem from 'expo-file-system/legacy';

// Expo exposes env vars to the client only when prefixed with EXPO_PUBLIC_.
// We also accept OPENAI_API_KEY for flexibility (e.g. other runtimes), but in Expo Go
// you should prefer EXPO_PUBLIC_OPENAI_API_KEY.
import Constants from 'expo-constants';

const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ??
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_OPENAI_API_KEY ??
  process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn(
    'Missing OpenAI API key. Set EXPO_PUBLIC_OPENAI_API_KEY (recommended) in your .env.local and restart Expo.'
  );
}

export type CharismaAnalysis = {
  charismaScore: number;
  potentialNote: string;
  insights: {
    type: 'strength' | 'improvement';
    text: string;
    detail: string;
  }[];
};

export const OpenAIService = {
  /**
   * Transcribes audio using OpenAI Whisper
   */
  transcribeAudio: async (uri: string): Promise<string> => {
    try {
      // Note: We skip the file existence check using deprecated getInfoAsync 
      // because we trust the URI from expo-av and want to avoid the crash.
      // If the file is missing, the fetch call below will simply fail.

      const formData = new FormData();
      // @ts-ignore: React Native FormData
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a', // expo-av records in m4a/caf by default on iOS, but we need to check preset. HIGH_QUALITY usually maps to m4a or caf. Whisper supports m4a.
        name: 'audio.m4a',
      });
      formData.append('model', 'whisper-1'); // OpenAI's optimized Whisper model (equivalent to v3 large in quality/speed)

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          // Content-Type is set automatically by FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw error;
    }
  },

  /**
   * Generates speech from text using OpenAI TTS
   */
  generateSpeech: async (text: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'shimmer', // A clear, female voice often good for coaching
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TTS API Error: ${error.error?.message || response.statusText}`);
      }

      // Get the blob/buffer
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Ensure we have a valid Data URI for expo-av
          // It might come back as data:application/octet-stream;base64,... 
          // We force it to audio/mpeg just in case, though it usually just needs the base64 part.
          const base64 = result.split(',')[1];
          resolve(`data:audio/mpeg;base64,${base64}`);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const dataUri = await base64Promise;

      // Returning Data URI directly to avoid FileSystem latency
      return dataUri;
    } catch (error) {
      console.error('TTS failed:', error);
      throw error;
    }
  },

  /**
   * Analyzes transcripts to generate a charisma score and insights
   */
  analyzeAssessment: async (transcripts: string[]): Promise<CharismaAnalysis> => {
    try {
      const combinedText = transcripts.join('\n\n');

      const systemPrompt = `
You are a brutally honest communication coach. Analyze the user's speech transcripts from a baseline assessment.
Your goal is to give them a "reality check". Do not sugarcoat glitches or weaknesses.
Most beginners perceive themselves to be better than they are. You must correct this.

Output a JSON object with:
- "charismaScore" (Integer between 42 and 65).
- "potentialNote" (1 short sentence. brutally honest about current state but hinting at potential. E.g. "You're currently invisible in meetings, but that can change.")
- "insights": Array of 3 objects, each with:
  - "type": "improvement" (The first two MUST be "improvement". Only the last one can be "strength" if really deserved, otherwise "improvement")
  - "text": Short punchy title (2-4 words maximum, e.g. "Painfully monotonous", "Weak conviction")
  - "detail": One or two sentences explaining WHY using direct quotes if possible. Be critical.

Example of critical insight:
{
  "type": "improvement",
  "text": "Frequent hedging",
  "detail": "You constantly said 'I think' and 'maybe', killing your authority instantly."
}
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // or gpt-4o-mini
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here are my transcripts:\n\n${combinedText}` }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GPT API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return result as CharismaAnalysis;
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback for demo if API fails
      return {
        charismaScore: 65,
        potentialNote: "Your upside is strong — a few small tweaks will make you sound noticeably more confident fast.",
        insights: [
          { type: 'improvement', text: 'Analysis unavailable', detail: 'Check your internet connection or API key.' }
        ]
      };
    }
  },

  /**
   * Generates a chat response and audio for the challenge
   */
  generateChallengeResponse: async (
    history: { role: 'user' | 'assistant'; content: string }[],
    systemPrompt?: string
  ): Promise<{ text: string; audio?: string }> => {
    try {
      // 1. Get text response
      const defaultPrompt = `
You are a charismatic communication training partner. 
Roleplay a short scenario: "Mastering the Pause".
You are the coach/partner. 
Keep your responses short (1-2 sentences). 
Correct the user if they rush. encourage them if they pause well.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 150, // Limit response length for speed
          messages: [
            { role: 'system', content: systemPrompt || defaultPrompt },
            ...history,
          ],
        }),
      });

      if (!response.ok) throw new Error('Chat API failed');
      const data = await response.json();
      const text = data.choices[0].message.content;
      return { text };
    } catch (error) {
      console.error('Challenge response failed', error);
      return { text: "Good job. Let's keep going." };
    }
  },
};
