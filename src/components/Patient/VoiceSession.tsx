'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Patient.module.css';

interface VoiceSessionProps {
    onEndSession: () => void;
    onSpeakingStateChange?: (isSpeaking: boolean) => void;
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

const VoiceSession: React.FC<VoiceSessionProps> = ({ onEndSession, onSpeakingStateChange }) => {
    const [barHeights, setBarHeights] = useState<number[]>([]);
    const [status, setStatus] = useState<'listening' | 'processing' | 'speaking'>('listening');
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const [error, setError] = useState<string | null>(null);

    // Waveform animation
    useEffect(() => {
        const interval = setInterval(() => {
            setBarHeights(Array.from({ length: 10 }, () => Math.random() * 30 + 10));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const requestMicrophoneAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Permission granted! Stop the stream immediately, we just needed the permission.
            stream.getTracks().forEach(track => track.stop());
            setError(null);
            // Now try starting recognition again
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) { /* ignore */ }
            }
        } catch (err: any) {
            console.error('Microphone permission denied:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Access Blocked. Click the Lock icon 🔒 in the URL bar and switch Microphone to "Allow".');
            } else {
                setError(`${err.name}: ${err.message}`);
            }
        }
    };

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
                setStatus('listening');
            };

            recognition.onaudiostart = () => console.log('Audio capturing started');
            recognition.onsoundstart = () => console.log('Sound detected');
            recognition.onspeechstart = () => console.log('Speech detected');

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const lastResult = event.results[event.results.length - 1];
                const text = lastResult[0].transcript;
                console.log('Recognition result:', text, 'isFinal:', lastResult.isFinal);

                // Show interim transcript
                setTranscript(text);

                if (lastResult.isFinal) {
                    handleUserSpeech(text);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setError('Access Blocked. Click the Lock icon 🔒 in the URL bar and switch Microphone to "Allow".');
                    setStatus('listening');
                } else if (event.error === 'no-speech') {
                    console.log('No speech detected, restarting...');
                } else {
                    setError(`Error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');
                // Restart if still in listening mode and no fatal error
                if (status === 'listening' && error !== 'Microphone access denied. Please allow access.') {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Ignore error if already started
                    }
                }
            };

            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch (e) {
                console.error(e);
            }
        } else {
            setError("Browser doesn't support speech recognition.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [status, error]);

    const handleUserSpeech = async (text: string) => {
        setStatus('processing');
        if (onSpeakingStateChange) onSpeakingStateChange(false);

        // Simulate thinking delay
        setTimeout(() => {
            const response = generateResponse(text);
            speakResponse(response);
        }, 1000);
    };

    const generateResponse = (text: string): string => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hello') || lowerText.includes('hi')) return "Hello there. It's so good to see you.";
        if (lowerText.includes('how are you')) return "I'm doing quite well, thank you. Just enjoying the view.";
        if (lowerText.includes('weather')) return "It looks like a beautiful day outside.";
        if (lowerText.includes('remember')) return "I have so many wonderful memories. Which one are you thinking of?";
        if (lowerText.includes('love you')) return "I love you too, very much.";
        return "That's interesting. Tell me more about that.";
    };

    const speakResponse = (text: string) => {
        setStatus('speaking');
        if (onSpeakingStateChange) onSpeakingStateChange(true);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        // Try to select a female voice if available
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
        if (femaleVoice) utterance.voice = femaleVoice;

        utterance.onend = () => {
            setStatus('listening');
            if (onSpeakingStateChange) onSpeakingStateChange(false);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) { /* ignore */ }
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className={styles.voiceSessionContainer}>
            <div className={styles.waveformContainer}>
                {barHeights.map((height, i) => (
                    <div
                        key={i}
                        className={styles.bar}
                        style={{
                            height: `${height}px`,
                            background: status === 'speaking' ? '#4ade80' : status === 'processing' ? '#fbbf24' : 'rgba(255,255,255,0.8)'
                        }}
                    />
                ))}
            </div>

            <p className={styles.statusText}>
                {error ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', maxWidth: '90%' }}>
                        <span style={{ color: '#ef4444', textAlign: 'center' }}>{error}</span>
                        <button
                            onClick={requestMicrophoneAccess}
                            style={{
                                background: '#4ade80', color: 'black', border: 'none',
                                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.8rem'
                            }}
                        >
                            Force Enable Microphone
                        </button>
                    </div>
                ) : (
                    <>
                        {status === 'listening' && "Listening..."}
                        {status === 'processing' && "Thinking..."}
                        {status === 'speaking' && "Speaking..."}
                    </>
                )}
            </p>
            {!error && transcript && <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem', maxWidth: '300px', textAlign: 'center' }}>"{transcript}"</p>}

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    className={styles.textInput}
                    placeholder="Or type a message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                                handleUserSpeech(target.value);
                                target.value = '';
                            }
                        }
                    }}
                />
            </div>

            <button className={styles.endButton} onClick={onEndSession}>
                End Session
            </button>
        </div>
    );
};

export default VoiceSession;
