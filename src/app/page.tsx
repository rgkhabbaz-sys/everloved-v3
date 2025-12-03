'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import VoiceSession from '../components/Patient/VoiceSession';
import TherapyModes from '../components/Patient/TherapyModes';
import styles from './page.module.css';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState('conversation');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('everloved_avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  const toggleListening = () => {
    console.log('toggleListening called, current state:', isListening);
    setIsListening(!isListening);
    setIsSpeaking(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundWrapper}>
        <Image
          src="/patient-bg.jpg"
          alt="Serene Greek Island Landscape"
          fill
          priority
          className={styles.backgroundImage}
          quality={100}
        />
        <div className={styles.overlay} />
      </div>

      {/* Floating Avatar Box */}
      {avatar && (
        <div className={styles.avatarBox}>
          <img
            src={avatar}
            alt="Loved One"
            className={`${styles.avatarImage} ${isSpeaking ? styles.avatarSpeaking : ''}`}
          />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.frame}>
          {/* Voice Session Logic */}
          {isListening && (
            <VoiceSession
              onEndSession={toggleListening}
              onSpeakingStateChange={setIsSpeaking}
            />
          )}

          {!isListening && (
            <>
              <div
                className={`${styles.micContainer} ${isListening ? styles.micActive : ''}`}
                onClick={toggleListening}
              >
                <div className={`${styles.micIcon} ${isListening ? styles.micIconActive : ''}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.micGlow} />
              </div>

              <TherapyModes currentMode={mode} onModeSelect={setMode} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
