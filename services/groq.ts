// Groq API Service - Complete migration from OpenAI
import Constants from 'expo-constants';

const GROQ_API_KEY =
    process.env.EXPO_PUBLIC_GROQ_API_KEY ??
    (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_GROQ_API_KEY ??
    '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';

if (!GROQ_API_KEY) {
    console.warn(
        'Missing Groq API key. Set EXPO_PUBLIC_GROQ_API_KEY in your .env.local and restart Expo.'
    );
}

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export type CharismaAnalysis = {
    charismaScore: number;
    potentialNote: string;
    insights: {
        type: 'strength' | 'improvement';
        text: string;
        detail: string;
    }[];
};

export const GroqService = {
    /**
     * Transcribes audio using Groq's Whisper Large v3 Turbo (ultra-fast, 216x real-time)
     */
    transcribeAudio: async (uri: string): Promise<string> => {
        try {
            const formData = new FormData();
            // @ts-ignore: React Native FormData
            formData.append('file', {
                uri: uri,
                type: 'audio/m4a',
                name: 'audio.m4a',
            });
            // Using Whisper Large v3 Turbo for best speed/accuracy balance
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('response_format', 'json');

            const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Groq Whisper API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Groq transcription failed:', error);
            throw error;
        }
    },

    /**
     * Generates speech from text using Groq's TTS (canopylabs/orpheus-v1-english)
     */
    generateSpeech: async (text: string, voiceId: string = 'daniel'): Promise<string> => {
        try {
            const response = await fetch(`${GROQ_BASE_URL}/audio/speech`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'canopylabs/orpheus-v1-english',
                    input: text,
                    voice: voiceId, // Valid voices: autumn, diana, hannah, austin, daniel, troy
                    response_format: 'wav',
                    speed: 1.0,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Groq TTS API Error: ${error.error?.message || response.statusText}`);
            }

            // Get the audio blob
            const blob = await response.blob();

            // Convert blob to base64 Data URI for expo-av
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64 = result.split(',')[1];
                    resolve(`data:audio/wav;base64,${base64}`);
                };
                reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            const dataUri = await base64Promise;

            return dataUri;
        } catch (error) {
            console.error('Groq TTS failed:', error);
            throw error;
        }
    },

    /**
     * Analyzes transcripts to generate a charisma score using Llama 3.3 70B
     */
    analyzeAssessment: async (transcripts: string[], previousScore?: number): Promise<CharismaAnalysis> => {
        try {
            const combinedText = transcripts.join('\n\n');

            const systemPrompt = `
You are a brutally honest, high-stakes communication coach. Analyze the user's speech transcripts.
Your goal is to give them a "reality check". Do not sugarcoat glitches, filler words, or weaknesses.
Be sharp, witty, and a bit "roast-y" in your feedback.

STEADY GROWTH LOGIC:
- If a 'previousScore' is provided (${previousScore ?? 'none'}), the new score MUST be slightly higher (by 1-3 points) IF the user performed reasonably well, showing consistency.
- If the user was terrible, the score can stay the same but rarely goes down unless they were completely silent or offensive.
- If no previousScore, keep the baseline between 45 and 65 for beginners.
- Maximum score is 99 (reserved for masters).

Output a JSON object with:
- "charismaScore" (Integer).
- "potentialNote" (1 short sentence. brutally honest but encouraging progress).
- "insights": Array of 3 objects, each with:
  - "type": "improvement" (The first two MUST be "improvement". Only the last one can be "strength" if really deserved, otherwise "improvement")
  - "text": Roast-style title (2-4 words, e.g. "Vocal Sandpaper", "Confidence of a Mouse")
  - "detail": One or two sentences explaining WHY. Use direct quotes if possible. Be critical.
`;

            const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant', // Ultra-fast for better UX
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Here are my transcripts:\n\n${combinedText}` }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Groq Chat API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);
            return result as CharismaAnalysis;
        } catch (error) {
            console.error('Groq analysis failed:', error);
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
     * Generates a chat response using Llama 3.1 8B Instant (ultra-fast)
     */
    generateChallengeResponse: async (
        history: { role: 'user' | 'assistant'; content: string }[],
        systemPrompt?: string
    ): Promise<{ text: string }> => {
        try {
            const defaultPrompt = `
You are a charismatic communication training partner. 
Roleplay a short scenario: "Mastering the Pause".
You are the coach/partner. 
Keep your responses short (1-2 sentences). 
Correct the user if they rush. encourage them if they pause well.
`;

            const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant', // Ultra-fast for real-time conversation
                    temperature: 0.8,
                    messages: [
                        { role: 'system', content: systemPrompt || defaultPrompt },
                        ...history,
                    ],
                }),
            });

            if (!response.ok) throw new Error('Groq Chat API failed');
            const data = await response.json();
            const text = data.choices[0].message.content;
            return { text };
        } catch (error) {
            console.error('Groq challenge response failed', error);
            return { text: "Good job. Let's keep going." };
        }
    },

    /**
     * Generates a completely new, unique scenario if the user runs out of content.
     */
    generateNewScenario: async (track: string, difficulty: string): Promise<any> => {
        try {
            const prompt = `
Generate a unique, high-value communication training scenario for the '${track}' track at '${difficulty}' difficulty.
The scenario should be realistic, a bit stressful, and require specific charisma skills (like warmth, authority, or playful banter).

Output a JSON object for a 'Level' with:
{
  "id": "generated-uuid",
  "title": "Short catchy title",
  "description": "1 sentence hook",
  "xp": 200,
  "track": "${track}",
  "difficulty": "${difficulty}",
  "opener": "The first thing the AI character says to the user",
  "aiCharacter": { "role": "Specific persona name" },
  "systemPrompt": "Instructions for the AI on how to act in this scenario. Keep it concise.",
  "context": {
    "situation": "The backstory",
    "action": "What the user needs to do",
    "goal": "The winning condition"
  }
}
`;

            const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    response_format: { type: "json_object" },
                    messages: [{ role: 'system', content: prompt }],
                }),
            });

            if (!response.ok) throw new Error('Scenario generation failed');
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('AI Scenario Generation failed', error);
            return null;
        }
    }
};
