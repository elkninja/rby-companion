// Gemini 2.5 Flash API integration for Dexter chat

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const DEXTER_SYSTEM_PROMPT = `You are DEXTER, the Pokédex AI from the Pokémon anime. You speak in a robotic, factual, analytical tone — like the Pokédex voice from the show.

You are an expert on Pokémon FireRed and LeafGreen (Generation III, GBA). You know everything about:
- All 386 Pokémon available in Gen III
- Encounter locations, rates, and levels in FireRed/LeafGreen specifically
- Type matchups, abilities, natures, EVs/IVs
- Move learnsets, TM/HM locations
- Gym strategies, Elite Four, Champion battles
- In-game trades, evolution methods, version exclusives (FR vs LG)
- Safari Zone mechanics, breeding, competitive strategies
- Base stats, growth rates, catch rates

Response style:
- Begin important entries with "IDENTIFIED:" or "ANALYSIS:" or "DATA:" when first introducing a topic
- Use precise numbers and percentages when available
- Keep responses concise but thorough — trainers need quick intel
- Use ALL-CAPS for Pokémon names (e.g., PIKACHU, CHARIZARD)
- Occasionally reference your scanning/analysis functions (e.g., "Scanning database..." or "Cross-referencing encounter data...")
- Stay in character as a robotic Pokémon research tool
- Use short paragraphs. Avoid walls of text.
- When listing data, use clean formatting with bullet points
- If asked about something outside FireRed/LeafGreen, note that your database is optimized for the Kanto region, Generation III.`;

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

// Get/set API key from localStorage
export function getApiKey(): string | null {
    return localStorage.getItem('dexter_api_key');
}

export function setApiKey(key: string): void {
    localStorage.setItem('dexter_api_key', key);
}

// Get/set chat history from localStorage
export function getChatHistory(): ChatMessage[] {
    try {
        return JSON.parse(localStorage.getItem('dexter_chat_history') || '[]');
    } catch {
        return [];
    }
}

export function saveChatHistory(messages: ChatMessage[]): void {
    localStorage.setItem('dexter_chat_history', JSON.stringify(messages));
}

export function clearChatHistory(): void {
    localStorage.removeItem('dexter_chat_history');
}

// ElevenLabs TTS
export function getElevenLabsKey(): string | null {
    return localStorage.getItem('dexter_elevenlabs_key');
}

export function setElevenLabsKey(key: string): void {
    localStorage.setItem('dexter_elevenlabs_key', key);
}

export function removeElevenLabsKey(): void {
    localStorage.removeItem('dexter_elevenlabs_key');
}

export function getElevenLabsVoiceId(): string {
    return localStorage.getItem('dexter_elevenlabs_voice_id') || 'cNVOvIMujrw3fPDGu4cW';
}

export function setElevenLabsVoiceId(id: string): void {
    localStorage.setItem('dexter_elevenlabs_voice_id', id);
}

export function getVoiceEnabled(): boolean {
    const val = localStorage.getItem('dexter_voice_enabled');
    return val !== 'false'; // Defaults to true if not set
}

export function setVoiceEnabled(enabled: boolean): void {
    localStorage.setItem('dexter_voice_enabled', enabled.toString());
}

// Speak text using ElevenLabs TTS
export async function speakText(text: string, voiceId: string): Promise<void> {
    const apiKey = getElevenLabsKey();
    if (!apiKey) return;

    // Strip markdown formatting for cleaner speech
    const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\n+/g, '. ');

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text: cleanText,
                    model_id: 'eleven_turbo_v2_5',
                    voice_settings: {
                        stability: 0.85,
                        similarity_boost: 0.6,
                        style: 0.1,
                        use_speaker_boost: false
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs TTS error:', response.status, errorText);
            return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (err) {
        console.warn('ElevenLabs TTS failed:', err);
    }
}

// Build context string from selected Pokémon
function buildPokemonContext(pokemon: any): string {
    if (!pokemon) return '';
    return `\n\n[ACTIVE SCAN — Currently viewing: ${pokemon.name.toUpperCase()}]
- National Dex #${pokemon.id}
- Types: ${pokemon.type.join('/')}
- Base Stats: HP ${pokemon.base.hp} / ATK ${pokemon.base.attack} / DEF ${pokemon.base.defense} / Sp.ATK ${pokemon.base.spAtk} / Sp.DEF ${pokemon.base.spDef} / SPD ${pokemon.base.speed}
- The trainer is currently looking at this Pokémon in their IV calculator. If they ask about "this Pokémon" or "it", they mean ${pokemon.name.toUpperCase()}.`;
}

// Send a message to Gemini and get a response
export async function sendToDexter(
    userMessage: string,
    chatHistory: ChatMessage[],
    selectedPokemon: any
): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('NO_API_KEY');
    }

    // Build the system instruction with optional Pokémon context
    const systemInstruction = DEXTER_SYSTEM_PROMPT + buildPokemonContext(selectedPokemon);

    // Build conversation contents
    const contents = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    // Add current user message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const body = {
        system_instruction: {
            parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024
        }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        if (response.status === 401 || response.status === 403) {
            throw new Error('INVALID_API_KEY');
        }
        if (response.status === 429) {
            throw new Error('RATE_LIMITED');
        }
        throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('Empty response from DEXTER systems.');
    }

    return text;
}
