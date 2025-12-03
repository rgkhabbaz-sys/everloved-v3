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
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
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
            startSession();
        } catch (err: any) {
            console.error('Microphone permission denied:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Access Blocked. Click the Lock icon 🔒 in the URL bar and switch Microphone to "Allow".');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No microphone found. Please check that your microphone is plugged in and selected in System Settings.');
            } else {
                setError(`${err.name}: ${err.message}`);
            }
        }
    };

    const startSession = () => {
        setStatus('listening');
        setError(null);
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
                    setStatus('idle');
                } else if (event.error === 'no-speech') {
                    console.log('No speech detected, restarting...');
                } else if (event.error === 'audio-capture') {
                    setError('No microphone found. Please check that your microphone is plugged in and selected in System Settings.');
                    setStatus('idle');
                } else {
                    setError(`Error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');
                // We handle restarts manually in the flow, or here if it ended unexpectedly
            };

            recognitionRef.current = recognition;
        } else {
            setError("Browser doesn't support speech recognition.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []); // Empty dependency array - run once on mount

    // Effect to handle status-based recognition control
    useEffect(() => {
        if (!recognitionRef.current) return;

        if (status === 'listening' && !error) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Already started or other non-fatal error
            }
        } else {
            recognitionRef.current.stop();
        }
    }, [status, error]);

    const handleUserSpeech = async (text: string) => {
        setStatus('processing');
        if (onSpeakingStateChange) onSpeakingStateChange(false);

        // Save user message to transcript
        saveToTranscript('patient', text);

        // Simulate thinking delay
        setTimeout(() => {
            const response = generateResponse(text);
            saveToTranscript('avatar', response);
            speakResponse(response);
        }, 1000);
    };

    const saveToTranscript = (sender: 'patient' | 'avatar', text: string) => {
        const newMessage = { sender, text, timestamp: new Date().toISOString() };
        const existing = localStorage.getItem('everloved_transcript');
        const transcript = existing ? JSON.parse(existing) : [];
        const updated = [...transcript, newMessage];
        localStorage.setItem('everloved_transcript', JSON.stringify(updated));
        // Dispatch event for other tabs/components to pick up
        window.dispatchEvent(new Event('storage'));
    };

    const generateResponse = (text: string): string => {
        const lowerText = text.toLowerCase();

        // Load boundaries
        const savedBoundaries = localStorage.getItem('everloved_boundaries');
        const boundaries = savedBoundaries ? JSON.parse(savedBoundaries) : {};

        // Check Boundaries
        if (boundaries.blockTravel && (lowerText.includes('go home') || lowerText.includes('travel') || lowerText.includes('ticket') || lowerText.includes('airport'))) {
            return "We are safe right here. Look at the beautiful view. Why don't we just relax for a while?";
        }

        if (boundaries.blockAlive && (lowerText.includes('alive') || lowerText.includes('dead') || lowerText.includes('died'))) {
            return "I am right here with you. That is what matters most.";
        }

        if (boundaries.redirectConfusion && (lowerText.includes('who are you') || lowerText.includes('where am i'))) {
            return "You are in a safe place, and I am here to keep you company. You are loved.";
        }

        // Standard Responses
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
        };

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className={styles.voiceSessionContainer}>
            {status === 'idle' && !error ? (
                <button
                    onClick={startSession}
                    className={styles.startButton}
                >
                    Start Conversation
                </button>
            ) : (
                <>
                    {/* Soft Ripple Animation for Active State */}
                    <div className={styles.rippleContainer}>
                        {status === 'speaking' && <div className={styles.rippleSpeaking} />}
                        {status === 'processing' && <div className={styles.rippleProcessing} />}
                        {status === 'listening' && <div className={styles.rippleListening} />}
                    </div>

                    <p className={styles.statusText}>
                        {error ? (
                            <div className={styles.errorContainer}>
                                <span className={styles.errorMessage}>{error}</span>
                                <button
                                    onClick={requestMicrophoneAccess}
                                    className={styles.retryButton}
                                >
                                    Force Enable Microphone
                                </button>
                            </div>
                        ) : (
                            <span className={styles.statusLabel}>
                                {status === 'listening' && "Listening..."}
                                {status === 'processing' && "Thinking..."}
                                {status === 'speaking' && "Speaking..."}
                            </span>
                        )}
                    </p>
                    {!error && transcript && (
                        <div className={styles.transcriptContainer}>
                            <p className={styles.transcriptText}>"{transcript}"</p>
                        </div>
                    )}

                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            className={styles.textInput}
                            placeholder="Type a message..."
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
                </>
            )}

            <button className={styles.endButton} onClick={onEndSession}>
                End Session
            </button>
        </div>
    );
};

export default VoiceSession;
