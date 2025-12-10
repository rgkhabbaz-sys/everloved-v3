'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Patient.module.css';
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { Mic } from 'lucide-react';

interface VoiceSessionProps {
    onEndSession: () => void;
    onSpeakingStateChange?: (isSpeaking: boolean) => void;
    activeProfile: any;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: () => void;
    onaudiostart: () => void;
    onsoundstart: () => void;
    onspeechstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: Event) => void;
    onend: () => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: {
            new(): SpeechRecognition;
        };
    }
}

const VoiceSession: React.FC<VoiceSessionProps> = ({ onEndSession, onSpeakingStateChange, activeProfile }) => {
    // Session State
    const [isSessionActive, setIsSessionActive] = useState(false);

    // UI States
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [debugLogs, setDebugLogs] = useState<string[]>([]); // Flight Recorder
    const [error, setError] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const addLog = (msg: string) => {
        setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    // VAD Hook
    const vad = useMicVAD({
        startOnLoad: false,
        redemptionMs: 500,
        workletURL: "/vad.worklet.bundle.min.js",
        modelURL: "/silero_vad_legacy.onnx",
        onnxWASMPaths: {
            'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm',
            'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
            'ort-wasm.wasm': '/ort-wasm.wasm',
            'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm'
        },
        onSpeechStart: () => {
            if (!isSessionActive) return;
            addLog("VAD: Speech Started");
            console.log("VAD: Speech Started");
            // BARGE-IN: Stop any current speech
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (onSpeakingStateChange) onSpeakingStateChange(false);

            setStatus('listening');

            // Trigger Speech Recognition
            try {
                if (recognitionRef.current && status !== 'processing') {
                    recognitionRef.current.start();
                    addLog("STT: Started listening");
                }
            } catch (e) {
                // Ignore overlapping start errors
            }
        },
        onSpeechEnd: (audio: Float32Array) => {
            if (!isSessionActive) return;
            addLog("VAD: Speech Ended");
            console.log("VAD: Speech Ended");
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                addLog("STT: Stopped listening");
            }
        },
        onVADMisfire: () => {
            console.log("VAD: Misfire (noise)");
        }
    } as any);

    // --- SESSION CONTROL ---

    const handleStartSession = useCallback(() => {
        setIsSessionActive(true);
        setStatus('listening');
        vad.start();
        setError(null);
    }, [vad]);

    const handleEndSession = useCallback(() => {
        setIsSessionActive(false);
        setStatus('idle');
        vad.pause();

        // Stop all media
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (recognitionRef.current) recognitionRef.current.stop();
    }, [vad]);


    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                console.log('Speech recognition started');
                setError(null);
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const lastResult = event.results[event.results.length - 1];
                const text = lastResult[0].transcript;
                setTranscript(text);

                if (lastResult.isFinal) {
                    console.log("Final Result:", text);
                    addLog(`STT Final: "${text}"`);
                    handleUserSpeech(text);
                }
            };

            recognition.onerror = (event: any) => {
                addLog(`STT Error: ${event.error}`);
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.error('Speech recognition error', event.error);
                }
                if (event.error === 'not-allowed') {
                    setError('Microphone access blocked.');
                }
            };

            recognitionRef.current = recognition;
        } else {
            setError("Browser doesn't support speech recognition.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (audioRef.current) audioRef.current.pause();
        };
    }, []);

    const handleUserSpeech = async (text: string) => {
        if (!text.trim() || !isSessionActive) return;

        setStatus('processing');
        setIsThinking(true);
        if (onSpeakingStateChange) onSpeakingStateChange(false);

        saveToTranscript('patient', text);
        addLog("API: Sending to Gemini...");

        try {
            // Call Gemini API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    profile: activeProfile // Pass the profile
                }),
            });

            const data = await response.json();

            if (isSessionActive && data.text) {
                saveToTranscript('avatar', data.text);
                setAiResponse(data.text);
                addLog("API: Success. Text received.");
                setIsThinking(false);
                await speakResponse(data.text);
            } else {
                setIsThinking(false);
                setStatus('listening');
            }

        } catch (error: any) {
            console.error("API Error:", error);
            addLog(`API Fail: ${error.message || 'Unknown'}`);
            setIsThinking(false);
            setStatus('listening');
        }
    };

    const saveToTranscript = (sender: 'patient' | 'avatar', text: string) => {
        const newMessage = { sender, text, timestamp: new Date().toISOString() };
        const existing = localStorage.getItem('everloved_transcript');
        const transcript = existing ? JSON.parse(existing) : [];
        const updated = [...transcript, newMessage];
        localStorage.setItem('everloved_transcript', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const speakResponse = async (text: string) => {
        if (!isSessionActive) return;

        // Smart Pausing: Stop listening while WE speak
        vad.pause();

        setStatus('speaking');
        if (onSpeakingStateChange) onSpeakingStateChange(true);

        try {
            const gender = activeProfile?.gender || 'female';
            const response = await fetch('/api/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, gender }),
            });

            if (!response.ok) throw new Error("TTS Failed");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                if (isSessionActive) {
                    setStatus('listening');
                    if (onSpeakingStateChange) onSpeakingStateChange(false);
                    vad.start(); // Smart Resume
                }
            };

            // Handle if audio fails to play
            audio.onerror = () => {
                console.warn("Audio playback failed, attempting fallback...");
                playFallbackTTS(text);
            };

            await audio.play();

        } catch (err) {
            console.error("TTS Error:", err);
            console.log("Attempting Fallback TTS...");
            playFallbackTTS(text);
        }
    };

    const playFallbackTTS = (text: string) => {
        if (!isSessionActive) return;

        // Ensure we stop any existing speech first
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a decent voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
            setStatus('speaking');
            if (onSpeakingStateChange) onSpeakingStateChange(true);
        };

        utterance.onend = () => {
            if (isSessionActive) {
                setStatus('listening');
                if (onSpeakingStateChange) onSpeakingStateChange(false);
                vad.start();
            }
        };

        utterance.onerror = (e) => {
            console.error("Fallback TTS Error:", e);
            // Final fail-safe: return to listening
            setStatus('listening');
            if (onSpeakingStateChange) onSpeakingStateChange(false);
            vad.start();
        };

        window.speechSynthesis.speak(utterance);
    };


    return (
        <div className={styles.voiceSessionContainer}>
            {/* IDLE STATE: Start Button */}
            {!isSessionActive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%', zIndex: 20 }}>
                    <button
                        onClick={handleStartSession}
                        className={styles.startButton}
                    >
                        <Mic size={32} />
                    </button>
                    {error && <span className={styles.errorMessage} style={{ marginTop: '1rem' }}>{error}</span>}
                </div>
            )}

            {/* ACTIVE SESSION UI */}
            {isSessionActive && (
                <>
                    {/* Ripple Animations */}
                    <div className={styles.rippleContainer}>
                        {status === 'speaking' && (
                            <motion.div
                                className={styles.rippleSpeaking}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                        {isThinking && (
                            <motion.div
                                className={styles.rippleProcessing}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                        {vad.userSpeaking && !isThinking && (
                            <motion.div
                                className={styles.rippleListening} // Red/Pulse for User Speaking
                                style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                        {!vad.userSpeaking && !isThinking && status === 'listening' && (
                            <motion.div
                                className={styles.rippleListening} // Green/Calm
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                    </div>

                    {/* Status Text */}
                    <p className={styles.statusText}>
                        {vad.loading ? (
                            <span className={styles.statusLabel}>Loading...</span>
                        ) : (
                            <span className={styles.statusLabel}>
                                {vad.userSpeaking ? "I'm listening..." :
                                    isThinking ? "Thinking..." :
                                        status === 'speaking' ? "Speaking..." :
                                            "Listening..."}
                            </span>
                        )}
                    </p>

                    {/* Transcript Feedback */}
                    {!error && (
                        <div className={styles.transcriptContainer}>
                            {transcript && <p className={styles.transcriptText}>You: "{transcript}"</p>}
                            {aiResponse && <p className={styles.transcriptText} style={{ color: '#60a5fa', marginTop: '0.5rem' }}>AI: "{aiResponse}"</p>}
                        </div>
                    )}

                    {/* DEBUG LOGS */}
                    <div style={{ marginTop: '1rem', width: '100%', fontSize: '0.7rem', color: '#888', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                        {debugLogs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            className={styles.endButton}
                            onClick={handleEndSession}
                            style={{
                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                color: '#fca5a5',
                                background: 'rgba(239, 68, 68, 0.1)'
                            }}
                        >
                            End Conversation
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default VoiceSession;
