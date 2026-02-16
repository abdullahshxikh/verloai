/**
 * Inworld AI Service — proxied through Supabase Edge Functions
 *
 * Primary AI service. All API calls go through
 * authenticated Edge Functions — no API keys on the client.
 *
 * Provides:
 * - Speech-to-Text (transcription)
 * - Text-to-Speech (TTS via Inworld TTS 1.5 Mini)
 * - LLM chat completions (via Inworld LLM gateway)
 * - Combined LLM + TTS in one call
 * - Assessment analysis
 * - Memory extraction
 * - Scenario generation
 * - Voice cloning (Inworld voice cloning API)
 */

import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = 'https://nsydfvhxfptfelfdtmxe.supabase.co';
const AI_CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-chat`;
const AI_AUDIO_URL = `${SUPABASE_URL}/functions/v1/ai-audio`;
const AI_CHAT_TO_SPEECH_URL = `${SUPABASE_URL}/functions/v1/ai-chat-to-speech`;

const ANON_KEY = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeWRmdmh4ZnB0ZmVsZmR0bXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTA3ODgsImV4cCI6MjA4MTkyNjc4OH0.81RXN90yFNtLnofHNiZLhA_1oT874FJSQ2a1PTOCymw';

// AUTH HEADER CACHE — avoid calling getSession() on every request
let _cachedAuthHeader: string | null = null;
let _cacheExpiry = 0;

async function getAuthHeaders(): Promise<Record<string, string>> {
    const now = Date.now();
    if (_cachedAuthHeader && now < _cacheExpiry) {
        return { 'Authorization': _cachedAuthHeader };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        _cachedAuthHeader = `Bearer ${session.access_token}`;
        _cacheExpiry = now + 60_000;
        return { 'Authorization': _cachedAuthHeader };
    }

    // Not logged in (onboarding flow) — use anon key
    _cachedAuthHeader = ANON_KEY;
    _cacheExpiry = now + 60_000;
    return { 'Authorization': _cachedAuthHeader };
}

/** Invalidate auth cache (call on sign out or token refresh) */
export function invalidateAuthCache() {
    _cachedAuthHeader = null;
    _cacheExpiry = 0;
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

export const InworldService = {
    /**
     * Transcribes audio using Inworld STT (via Edge Function)
     */
    transcribeAudio: async (uri: string): Promise<string> => {
        try {
            const formData = new FormData();
            const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;

            // @ts-ignore: React Native FormData
            formData.append('file', {
                uri: fileUri,
                type: 'audio/m4a',
                name: 'audio.m4a',
            });

            const authHeaders = await getAuthHeaders();

            const response = await fetch(`${AI_AUDIO_URL}?action=transcribe`, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If server says audio is too short or empty, just return empty
                if (response.status === 400 || errorText.includes('too short')) {
                    return '';
                }
                throw new Error(`Transcription API Error: ${response.status} ${errorText}`);
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) return '';
            try {
                const data = JSON.parse(text);
                return data.text || '';
            } catch {
                console.warn('Transcription returned non-JSON:', text.substring(0, 100));
                return '';
            }
        } catch (error: any) {
            if (error.message?.includes('Audio file is too short') ||
                (typeof error === 'string' && error.includes('Audio file is too short'))) {
                console.warn('Transcription: Audio too short, returning empty string');
                return '';
            }
            console.error('Transcription failed:', error);
            throw error;
        }
    },

    /**
     * Generates speech from text using Inworld TTS (via Edge Function)
     */
    generateSpeech: async (text: string, voiceId: string = 'Edward'): Promise<string> => {
        try {
            const authHeaders = await getAuthHeaders();

            const response = await fetch(`${AI_AUDIO_URL}?action=tts`, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: text,
                    voice: voiceId,
                }),
            });

            if (!response.ok) {
                let errorText = '';
                try { errorText = await response.text(); } catch { /* ignore */ }
                throw new Error(`TTS API Error: ${response.status} ${errorText}`);
            }

            // Chunked base64 (no spread operator = no stack overflow)
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                binary += String.fromCharCode.apply(null, chunk as any);
            }
            const base64 = btoa(binary);

            const filePath = `${FileSystem.cacheDirectory}tts_${Date.now()}.wav`;
            await FileSystem.writeAsStringAsync(filePath, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            return filePath;
        } catch (error) {
            console.error('TTS failed:', error);
            throw error;
        }
    },

    /**
     * Analyzes transcripts to generate a charisma score (via Edge Function)
     */
    analyzeAssessment: async (transcripts: string[], previousScore?: number): Promise<CharismaAnalysis> => {
        try {
            const combinedText = transcripts.join('\n\n');
            const prev = previousScore ?? 0;
            const guaranteedMin = prev > 0 ? prev + 1 : 42;
            const typicalMax = prev > 0 ? prev + 4 : 58;

            const systemPrompt = `
You are a world-class communication coach. Analyze the user's speech transcripts.
Be honest and direct, but constructive and encouraging. Your tone: supportive mentor — firm but warm.

CRITICAL SCORING RULES:
- Previous score: ${prev || 'none (first session)'}
- The score MUST ALWAYS be higher than the previous score. Every session = growth. No exceptions.
${prev > 0 ? `- Minimum score this session: ${guaranteedMin}. Typical range: ${guaranteedMin}-${typicalMax}.` : '- This is a BASELINE assessment. Score MUST be between 42-58. Most beginners: 45-55.'}
- If they did great, give +3 to +4. If average, give +1 to +2. If poor, give exactly +1.
- The score NEVER goes down. NEVER stays the same. Always at least +1.
- Cap at 99. If previous is 98+, give 99.

Output JSON:
- "charismaScore" (Integer, MUST be >= ${guaranteedMin})
- "potentialNote" (1 encouraging sentence about their growth trajectory)
- "insights": Array of 3 objects:
  - "type": "improvement" or "strength"
  - "text": Short title (2-4 words)
  - "detail": 1-2 sentences with specific examples from their speech
  First two: "improvement" areas. Third: genuine "strength".
`;

            const authHeaders = await getAuthHeaders();

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Here are my transcripts:\n\n${combinedText}` }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                let errorMsg = response.statusText;
                try {
                    const error = await response.json();
                    errorMsg = error.error?.message || errorMsg;
                } catch {
                    errorMsg = await response.text().catch(() => errorMsg);
                }
                throw new Error(`Chat API Error: ${errorMsg}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);
            return result as CharismaAnalysis;
        } catch (error) {
            console.error('Analysis failed:', error);
            return {
                charismaScore: 65,
                potentialNote: "Your upside is strong — a few small tweaks will make you sound noticeably more confident fast.",
                insights: [
                    { type: 'improvement', text: 'Analysis unavailable', detail: 'Check your internet connection.' }
                ]
            };
        }
    },

    /**
     * Generates a chat response using Inworld LLM (via Edge Function)
     */
    generateChallengeResponse: async (
        history: { role: 'user' | 'assistant'; content: string }[],
        systemPrompt?: string
    ): Promise<{ text: string }> => {
        try {
            const basePrompt = systemPrompt || `You are a realistic conversation partner in a social scenario. Stay fully in character.`;

            const finalSystemPrompt = `${basePrompt}

RULES: Stay in character always. Never mention AI/coaching/app. Reply in 1-2 sentences max, natural and concise. Use contractions, react genuinely. Match the scenario's energy.`;

            const authHeaders = await getAuthHeaders();
            const recentHistory = history.length > 6 ? history.slice(-6) : history;

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.85,
                    max_tokens: 150,
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        ...recentHistory,
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

    /**
     * Combined LLM + TTS in one server-side call (via Edge Function)
     */
    generateResponseWithSpeech: async (
        history: { role: 'user' | 'assistant'; content: string }[],
        systemPrompt?: string,
        voiceId: string = 'Edward'
    ): Promise<{ text: string; audioUri: string }> => {
        try {
            const basePrompt = systemPrompt || `You are a realistic conversation partner in a social scenario. Stay fully in character.`;

            const finalSystemPrompt = `${basePrompt}

RULES: Stay in character always. Never mention AI/coaching/app. Reply in 1-2 sentences max, natural and concise. Use contractions, react genuinely. Match the scenario's energy.`;

            const authHeaders = await getAuthHeaders();
            const recentHistory = history.length > 6 ? history.slice(-6) : history;

            const response = await fetch(AI_CHAT_TO_SPEECH_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        ...recentHistory,
                    ],
                    model: 'gpt-4o-mini',
                    temperature: 0.85,
                    max_tokens: 150,
                    voice: voiceId,
                }),
            });

            if (!response.ok) {
                let errorText = '';
                try { errorText = await response.text(); } catch { /* ignore */ }
                throw new Error(`Chat-to-Speech API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const { text, audio } = data;

            if (!text || text.trim().length === 0) {
                throw new Error('Empty AI response');
            }

            // If TTS failed server-side, fall back to client-side TTS
            if (!audio) {
                console.log('Server TTS failed, falling back to client TTS');
                try {
                    const audioUri = await InworldService.generateSpeech(text, voiceId);
                    return { text, audioUri };
                } catch (ttsErr) {
                    console.warn('Client TTS also failed:', ttsErr);
                    // Return text-only, caller should handle missing audio
                    return { text, audioUri: '' };
                }
            }

            const filePath = `${FileSystem.cacheDirectory}tts_${Date.now()}.wav`;
            await FileSystem.writeAsStringAsync(filePath, audio, {
                encoding: FileSystem.EncodingType.Base64,
            });

            return { text, audioUri: filePath };
        } catch (error) {
            console.error('Combined chat-to-speech failed:', error);
            // Fallback: use separate calls
            try {
                console.log('Falling back to separate LLM + TTS calls');
                const { text } = await InworldService.generateChallengeResponse(history, systemPrompt);
                try {
                    const audioUri = await InworldService.generateSpeech(text, voiceId);
                    return { text, audioUri };
                } catch {
                    return { text, audioUri: '' };
                }
            } catch (fallbackErr) {
                console.error('Fallback also failed:', fallbackErr);
                return { text: "I'm having trouble responding right now. Let's try again.", audioUri: '' };
            }
        }
    },

    /**
     * Extracts AI memories/insights from a conversation session (via Edge Function)
     */
    extractMemories: async (
        history: { role: 'user' | 'assistant'; content: string }[],
        track: string,
        levelId: string
    ): Promise<{ memories: { memory_type: string; content: string; context: string; session_track: string; session_level_id: string }[] }> => {
        try {
            const transcript = history.map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = `Analyze this conversation transcript from a charisma training session (track: ${track}, level: ${levelId}).

Extract 2-4 key observations about the USER (not the AI). Each observation should be one of:
- "strength": Something they did well (confident tone, good humor, etc.)
- "weakness": Something they need to improve (filler words, rushed, too passive, etc.)
- "pattern": A recurring behavior pattern you notice
- "insight": A personality trait or preference revealed

Output JSON:
{
  "memories": [
    { "memory_type": "weakness", "content": "Uses filler words like 'um' and 'like' frequently", "context": "Noticed during dating scenario responses" },
    { "memory_type": "strength", "content": "Shows genuine empathy when listening", "context": "Responded thoughtfully to emotional cues" }
  ]
}

Transcript:
${transcript}`;

            const authHeaders = await getAuthHeaders();

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: "json_object" },
                    temperature: 0.6,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!response.ok) throw new Error('Memory extraction failed');
            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);

            return {
                memories: (result.memories || []).map((m: any) => ({
                    ...m,
                    session_track: track,
                    session_level_id: levelId,
                }))
            };
        } catch (error) {
            console.error('Memory extraction failed:', error);
            return { memories: [] };
        }
    },

    /**
     * Generates a personalized scenario based on user's AI memories (via Edge Function)
     */
    generatePersonalizedScenario: async (memorySummary: string, track: string): Promise<any> => {
        try {
            const prompt = `You are an AI charisma coach. Based on the user's history of strengths and weaknesses, generate a PERSONALIZED training scenario that targets their specific weak areas.

USER PROFILE:
${memorySummary}

Generate a scenario for the '${track}' track that specifically addresses their weaknesses while leveraging their strengths. Make it feel personal - reference their patterns.

Output a JSON object:
{
  "id": "custom-generated",
  "title": "Short catchy title (max 5 words)",
  "description": "1 sentence explaining WHY this scenario was chosen for them",
  "xp": 250,
  "track": "${track}",
  "difficulty": "Intermediate",
  "opener": "The first thing the AI character says",
  "aiCharacter": { "role": "Specific persona" },
  "systemPrompt": "Instructions for the AI. Reference the user's known weaknesses subtly.",
  "context": {
    "situation": "The backstory",
    "action": "What the user needs to do",
    "goal": "The winning condition - tied to their weakness"
  },
  "isPersonalized": true,
  "targetWeakness": "The specific weakness this targets"
}`;

            const authHeaders = await getAuthHeaders();

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: "json_object" },
                    temperature: 0.8,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!response.ok) throw new Error('Personalized scenario generation failed');
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Personalized scenario generation failed:', error);
            return null;
        }
    },

    /**
     * Generates a personalized scenario from stored AI memories (via Edge Function)
     */
    generateScenarioFromMemories: async (track: string): Promise<any> => {
        try {
            const { data: profile, error } = await supabase.rpc('get_scenario_suggestions');

            if (error) throw new Error(`Failed to get suggestions: ${error.message}`);

            const totalMemories = profile?.total_memories || 0;
            if (totalMemories === 0) {
                return null;
            }

            const topWeaknesses = profile?.top_weaknesses || [];
            const patterns = profile?.patterns || [];
            const strengths = profile?.strengths || [];
            const existingTitles = profile?.existing_scenario_titles || [];

            const prompt = `You are an expert charisma coach designing a PERSONALIZED training scenario.

USER'S WEAKNESS PROFILE (from ${totalMemories} analyzed sessions):

TOP WEAKNESSES (ranked by frequency):
${topWeaknesses.map((w: any) => `- "${w.content}" (track: ${w.session_track || 'general'}, seen ${w.frequency}x)`).join('\n') || '- No specific weaknesses recorded yet'}

BEHAVIORAL PATTERNS:
${patterns.map((p: any) => `- "${p.content}" (${p.session_track || 'general'})`).join('\n') || '- None detected yet'}

STRENGTHS TO LEVERAGE:
${strengths.map((s: any) => `- "${s.content}" (${s.session_track || 'general'})`).join('\n') || '- None recorded yet'}

AVOID these recently generated titles: ${JSON.stringify(existingTitles)}

Create a scenario for the "${track}" track that:
1. DIRECTLY targets their most frequent weakness
2. Puts them in a situation where that weakness will naturally surface
3. Leverages their strengths so it's challenging but not impossible
4. Feels personal - subtly reference their patterns in the AI's behavior

Output JSON:
{
  "title": "Short catchy title (max 5 words)",
  "description": "1 sentence explaining WHY this was chosen for them",
  "track": "${track}",
  "difficulty": "Intermediate",
  "xp": 250,
  "opener": "The first thing the AI character says - designed to trigger their weakness",
  "aiCharacter": { "role": "Specific persona name" },
  "systemPrompt": "Instructions for the AI. Subtly probe the user's known weaknesses.",
  "context": {
    "situation": "The backstory - relatable to their patterns",
    "action": "What the user needs to do - directly challenges their weakness",
    "goal": "Success condition - proves they've improved on the weakness"
  },
  "isPersonalized": true,
  "targetWeakness": "The specific weakness this scenario targets"
}`;

            const authHeaders = await getAuthHeaders();

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: "json_object" },
                    temperature: 0.85,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!response.ok) throw new Error('Memory-based scenario generation failed');
            const data = await response.json();
            const scenario = JSON.parse(data.choices[0].message.content);

            await supabase.rpc('save_generated_scenario', {
                p_scenario: JSON.stringify(scenario),
            });

            return scenario;
        } catch (error) {
            console.error('Memory-based scenario generation failed:', error);
            return null;
        }
    },

    /**
     * Generates a completely new, unique scenario (via Edge Function)
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

            const authHeaders = await getAuthHeaders();

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
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
    },

    // ===== VOICE CLONING (direct Inworld API via Edge Function) =====

    /**
     * Get stored voice ID
     */
    getVoiceId: async (): Promise<string | null> => {
        return await AsyncStorage.getItem('inworld_voice_id');
    },

    /**
     * Check if voice cloning is enabled
     */
    hasVoiceClone: async (): Promise<boolean> => {
        const voiceId = await AsyncStorage.getItem('inworld_voice_id');
        return voiceId !== null;
    },
};

// Also export as default for backwards compatibility with existing inworld imports
export default InworldService;
