'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import VoiceSession from '../components/Patient/VoiceSession';
import TherapyModes from '../components/Patient/TherapyModes';
import styles from './page.module.css';

import { motion } from 'framer-motion';

// Add type definition for SpeechRecognition if not available in TS
// Declaring this as any to avoid conflicts with lib.dom.d.ts which might define it differently
// We will just cast window to any locally where needed


export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state for API call
  const [mode, setMode] = useState('conversation');
  const [avatar, setAvatar] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('everloved_avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice features require Chrome or Safari.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Recognized speech:', transcript);
      await processSpeech(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access blocked. Please allow microphone access in your browser settings.');
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const processSpeech = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (data.text) {
        speakResponse(data.text);
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      speakResponse("I'm having a little trouble hearing you. Can you say that again?");
    } finally {
      setIsProcessing(false);
    }
  };
  const speakResponse = async (text: string) => {
    try {
      // Fetch audio from our server-side ElevenLabs endpoint
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error('TTS request failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        // Auto-restart listening for continuous conversation
        setTimeout(() => {
          handleStartListening();
        }, 200);
      };

      audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      setIsSpeaking(false);
      // Fallback or just restart listening?
      setTimeout(handleStartListening, 200);
    }
  };



  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      handleStartListening();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundWrapper}>
        <motion.div
          animate={{
            scale: isSpeaking ? 1.05 : 1.3, // Breathing effect when speaking
          }}
          transition={{
            duration: isSpeaking ? 4 : 35, // Faster cycle when speaking
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        >
          <Image
            src="/swiss-alps-bg.png"
            alt="Cheery Swiss Alps Landscape"
            fill
            priority
            className={styles.backgroundImage}
            quality={100}
          />
        </motion.div>
        <div className={styles.overlay} />
      </div>

      {/* Logo and Nav are now handled by global NavBar component */
        /* ANIMATED LOGO for Landing Page */
        <motion.div
          className={styles.logo}
          initial={{
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            scale: 1.5,
          }}
          animate={{
            top: "auto",
            bottom: "40px",
            left: "40px",
            x: "0%",
            y: "0%",
            scale: 1,
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ position: 'absolute', zIndex: 50 }}
        >
          everLoved
        </motion.div>}

      {/* Floating Avatar Box */}
      {avatar && (
        <motion.div
          className={styles.avatarBox}
          initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          transition={{
            duration: 2.0,
            ease: "easeOut"
          }}
        >
          <img
            src={avatar}
            alt="Loved One"
            className={`${styles.avatarImage} ${isSpeaking ? styles.avatarSpeaking : ''}`}
          />
        </motion.div>
      )}

      <div className={styles.content}>
        <div className={styles.frame}>
          {/* Voice Session Logic replaced with direct integration for consistency, 
              but referencing components if they have specific UI needs not covered here. 
              Given the prompt, we are pulling the logic UP to this page. */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div
              className={`${styles.micContainer} ${isListening ? styles.micActive : ''} ${isProcessing ? styles.processing : ''}`}
              onClick={toggleListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? { scale: [1, 1.1, 1] } : {}}
              transition={isListening ? { repeat: Infinity, duration: 2 } : {}}
            >
              <div className={`${styles.micIcon} ${isListening ? styles.micIconActive : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {/* Visual indicator for processing state */}
              {isProcessing && <div className={styles.processingRing} />}
              <div className={styles.micGlow} />
            </motion.div>

            <TherapyModes currentMode={mode} onModeSelect={setMode} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
