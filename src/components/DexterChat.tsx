import { useState, useEffect, useRef } from 'react';
import {
    sendToDexter,
    getApiKey,
    setApiKey as saveApiKey,
    getChatHistory,
    saveChatHistory,
    clearChatHistory,
    getElevenLabsKey,
    setElevenLabsKey as saveElevenLabsKey,
    removeElevenLabsKey,
    getElevenLabsVoiceId,
    setElevenLabsVoiceId as saveElevenLabsVoiceId,
    getVoiceEnabled,
    setVoiceEnabled as saveVoiceEnabled,
    speakText
} from '../utils/geminiApi';
import type { ChatMessage } from '../utils/geminiApi';

interface DexterChatProps {
    selectedPokemon: any;
}

export function DexterChat({ selectedPokemon }: DexterChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKeyState] = useState<string | null>(null);
    const [elevenLabsKey, setElevenLabsKeyState] = useState<string | null>(null);
    const [voiceId, setVoiceIdState] = useState<string>('cNVOvIMujrw3fPDGu4cW');
    const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
    const [keyInput, setKeyInput] = useState('');
    const [elevenLabsInput, setElevenLabsInput] = useState('');
    const [voiceIdInput, setVoiceIdInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [typingText, setTypingText] = useState<string | null>(null);
    const [typingIndex, setTypingIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimerRef = useRef<number | null>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        setApiKeyState(getApiKey());
        setElevenLabsKeyState(getElevenLabsKey());

        const cachedVoiceId = getElevenLabsVoiceId();
        setVoiceIdState(cachedVoiceId);
        setVoiceIdInput(cachedVoiceId);

        setVoiceEnabled(getVoiceEnabled());

        setMessages(getChatHistory());
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, typingIndex]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && apiKey && !showSettings) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, apiKey, showSettings]);

    // Typewriter effect
    useEffect(() => {
        if (typingText === null) return;

        if (typingIndex < typingText.length) {
            typingTimerRef.current = window.setTimeout(() => {
                setTypingIndex(prev => prev + 1);
            }, 25); // ~25ms per character for Pokédex feel
        } else {
            // Typing complete — save full message
            const dexterMessage: ChatMessage = {
                role: 'model',
                content: typingText,
                timestamp: Date.now()
            };
            const finalMessages = [...messages, dexterMessage];
            setMessages(finalMessages);
            saveChatHistory(finalMessages);
            setTypingText(null);
            setTypingIndex(0);
        }

        return () => {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        };
    }, [typingText, typingIndex]);

    const handleSaveKey = () => {
        if (!keyInput.trim()) return;
        saveApiKey(keyInput.trim());
        setApiKeyState(keyInput.trim());
        setKeyInput('');
        setShowSettings(false); // Only close settings if they are entering the very first key
    };

    const handleSaveElevenLabsKey = () => {
        if (!elevenLabsInput.trim()) {
            removeElevenLabsKey();
            setElevenLabsKeyState(null);
            setElevenLabsInput('');
            return;
        }
        saveElevenLabsKey(elevenLabsInput.trim());
        setElevenLabsKeyState(elevenLabsInput.trim());
        setElevenLabsInput('');
    };

    const handleRemoveElevenLabs = () => {
        removeElevenLabsKey();
        setElevenLabsKeyState(null);
        setElevenLabsInput('');
    };

    const handleSaveVoiceId = () => {
        if (!voiceIdInput.trim()) return;
        saveElevenLabsVoiceId(voiceIdInput.trim());
        setVoiceIdState(voiceIdInput.trim());
    };

    const handleToggleVoice = () => {
        const newVal = !voiceEnabled;
        setVoiceEnabled(newVal);
        saveVoiceEnabled(newVal);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading || typingText !== null) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        saveChatHistory(updatedMessages);
        setInput('');
        setError(null);
        setIsLoading(true);

        try {
            const response = await sendToDexter(input.trim(), messages, selectedPokemon);

            if (elevenLabsKey && voiceEnabled) {
                // With ElevenLabs: typewriter effect + TTS
                setTypingText(response);
                setTypingIndex(0);
                setIsLoading(false);
                // Start TTS in parallel
                speakText(response, voiceId);
            } else {
                // Without ElevenLabs (or disabled): instant display
                const dexterMessage: ChatMessage = {
                    role: 'model',
                    content: response,
                    timestamp: Date.now()
                };
                const finalMessages = [...updatedMessages, dexterMessage];
                setMessages(finalMessages);
                saveChatHistory(finalMessages);
                setIsLoading(false);
            }
        } catch (err: any) {
            setIsLoading(false);
            if (err.message === 'NO_API_KEY') {
                setError('API key not configured.');
            } else if (err.message === 'INVALID_API_KEY') {
                setError('Invalid API key. Check settings.');
                setApiKeyState(null);
            } else if (err.message === 'RATE_LIMITED') {
                setError('Rate limited. Wait a moment.');
            } else {
                setError(`Error: ${err.message}`);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        clearChatHistory();
        setMessages([]);
        setTypingText(null);
        setTypingIndex(0);
    };

    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* Floating Poké Ball Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="dexter-bubble"
                    title="Ask Dexter"
                >
                    <div className="dexter-bubble-icon">
                        <div className="pokeball-top" />
                        <div className="pokeball-band">
                            <div className="pokeball-button" />
                        </div>
                        <div className="pokeball-bottom" />
                    </div>
                </button>
            )}

            {/* Expanded Chat Window */}
            {isOpen && (
                <div className="dexter-chat">
                    {/* Header */}
                    <div className="dexter-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="dexter-led" />
                            <span>DEXTER v2.5</span>
                            {elevenLabsKey && voiceEnabled && (
                                <span style={{ fontSize: '0.4rem', opacity: 0.7 }}>🔊</span>
                            )}
                            {elevenLabsKey && !voiceEnabled && (
                                <span style={{ fontSize: '0.4rem', opacity: 0.7 }}>🔇</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="dexter-header-btn"
                                title="Settings"
                                style={showSettings ? { background: 'rgba(255,255,255,0.2)' } : {}}
                            >
                                ⚙️
                            </button>
                            <button
                                onClick={handleClear}
                                className="dexter-header-btn"
                                title="Clear chat"
                            >
                                🗑️
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); setShowSettings(false); }}
                                className="dexter-header-btn"
                                title="Minimize"
                            >
                                ▼
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="dexter-settings">
                            <div className="dexter-settings-title">⚙ SYSTEM CONFIGURATION</div>

                            <div className="dexter-settings-group">
                                <label className="dexter-settings-label">
                                    Gemini API Key {apiKey ? '✅' : '❌'}
                                </label>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                    <input
                                        type="password"
                                        value={keyInput}
                                        onChange={(e) => setKeyInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                                        placeholder={apiKey ? '••••••••' : 'Enter key...'}
                                        className="dexter-key-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button onClick={handleSaveKey} className="dexter-send-btn">
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="dexter-settings-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="dexter-settings-label">
                                        ElevenLabs Key {elevenLabsKey ? (voiceEnabled ? '🔊' : '🔇') : '(optional)'}
                                    </label>
                                    {elevenLabsKey && (
                                        <button
                                            onClick={handleToggleVoice}
                                            className="dexter-header-btn"
                                            style={{ fontSize: '0.4rem', padding: '0.2rem 0.4rem' }}
                                        >
                                            {voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                    <input
                                        type="password"
                                        value={elevenLabsInput}
                                        onChange={(e) => setElevenLabsInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveElevenLabsKey()}
                                        placeholder={elevenLabsKey ? '••••••••' : 'Enter key...'}
                                        className="dexter-key-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button onClick={handleSaveElevenLabsKey} className="dexter-send-btn">
                                        Save
                                    </button>
                                </div>
                                {elevenLabsKey && (
                                    <>
                                        <button
                                            onClick={handleRemoveElevenLabs}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ff6666',
                                                fontSize: '0.35rem',
                                                cursor: 'pointer',
                                                marginTop: '0.2rem',
                                                fontFamily: 'inherit',
                                                alignSelf: 'flex-start'
                                            }}
                                        >
                                            Remove ElevenLabs key
                                        </button>

                                        <div style={{ marginTop: '0.4rem' }}>
                                            <label className="dexter-settings-label">
                                                Voice ID
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                <input
                                                    type="text"
                                                    value={voiceIdInput}
                                                    onChange={(e) => setVoiceIdInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveVoiceId()}
                                                    className="dexter-key-input"
                                                    style={{ flex: 1 }}
                                                />
                                                <button onClick={handleSaveVoiceId} className="dexter-send-btn">
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div style={{ fontSize: '0.3rem', color: '#666', marginTop: '0.2rem', lineHeight: 1.6 }}>
                                    Enables Pokédex voice + typewriter text effect
                                </div>
                            </div>

                            <div style={{ fontSize: '0.35rem', color: '#888', marginTop: '0.8rem', textAlign: 'center', lineHeight: 1.4 }}>
                                <strong>Privacy Notice:</strong> Keys are stored only in your browser's local storage.
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="dexter-send-btn"
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Messages Area */}
                    {!showSettings && (
                        <div className="dexter-messages">
                            {/* API Key Setup (first time) */}
                            {!apiKey ? (
                                <div className="dexter-setup">
                                    <div className="dexter-system-msg">
                                        DEXTER INITIALIZATION REQUIRED.
                                        <br /><br />
                                        Enter Gemini API key to activate
                                        Pokédex AI systems.
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
                                        <input
                                            type="password"
                                            value={keyInput}
                                            onChange={(e) => setKeyInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                                            placeholder="API Key..."
                                            className="dexter-key-input"
                                        />
                                        <button onClick={handleSaveKey} className="dexter-send-btn">
                                            ▶
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Welcome message */}
                                    {messages.length === 0 && !typingText && (
                                        <div className="dexter-msg dexter-msg-model">
                                            <div className="dexter-msg-content">
                                                DEXTER online. Pokédex AI systems activated.
                                                <br /><br />
                                                Database loaded: Pokémon FireRed &amp; LeafGreen.
                                                <br />
                                                Ready to scan and analyze.
                                                {selectedPokemon && (
                                                    <>
                                                        <br /><br />
                                                        Currently scanning: <strong>{selectedPokemon.name.toUpperCase()}</strong>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chat messages */}
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`dexter-msg dexter-msg-${msg.role}`}
                                        >
                                            <div
                                                className="dexter-msg-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: msg.role === 'model'
                                                        ? formatMessage(msg.content)
                                                        : msg.content.replace(/\n/g, '<br/>')
                                                }}
                                            />
                                        </div>
                                    ))}

                                    {/* Typewriter effect for current response */}
                                    {typingText !== null && (
                                        <div className="dexter-msg dexter-msg-model">
                                            <div
                                                className="dexter-msg-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: formatMessage(typingText.slice(0, typingIndex)) +
                                                        '<span class="dexter-cursor">▌</span>'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Loading indicator */}
                                    {isLoading && (
                                        <div className="dexter-msg dexter-msg-model">
                                            <div className="dexter-msg-content dexter-loading">
                                                Scanning database<span className="dexter-dots">...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error */}
                                    {error && (
                                        <div className="dexter-msg dexter-msg-error">
                                            <div className="dexter-msg-content">⚠ {error}</div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                    )}

                    {/* Input Area */}
                    {apiKey && !showSettings && (
                        <div className="dexter-input-area">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask Dexter..."
                                className="dexter-text-input"
                                disabled={isLoading || typingText !== null}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim() || typingText !== null}
                                className="dexter-send-btn"
                            >
                                ▶
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
