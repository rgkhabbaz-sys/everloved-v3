'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import VoiceSession from '../components/Patient/VoiceSession';
import TherapyModes from '../components/Patient/TherapyModes';
import styles from './page.module.css';

import Link from 'next/link';
import { Heart, Settings, BookOpen, Activity } from 'lucide-react';

import { motion } from 'framer-motion';

const MotionLink = motion(Link);

const navItems = [
  { name: 'Patient Comfort', path: '/', icon: Heart },
  { name: 'Caregiver Control', path: '/caregiver', icon: Settings },
  { name: 'New Science', path: '/science', icon: BookOpen },
  { name: 'Health & Wellness', path: '/wellness', icon: Activity },
];

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
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.3 }}
          transition={{
            duration: 35,
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

      {/* Logo */}
      <motion.div
        className={styles.logo}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        EverLoved
      </motion.div>

      {/* Vertical Sidebar Navigation */}
      <nav className={styles.sidebar}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path === '/';

          return (
            <MotionLink
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
              initial={{ opacity: 0, x: 250 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.5 + (index * 0.2),
                duration: 2.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={styles.iconWrapper}>
                <Icon size={24} />
              </div>
              <span className={styles.linkText}>{item.name}</span>
            </MotionLink>
          );
        })}
      </nav>

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
          {/* Voice Session Logic */}
          {isListening && (
            <VoiceSession
              onEndSession={toggleListening}
              onSpeakingStateChange={setIsSpeaking}
            />
          )}

          {!isListening && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.div
                className={`${styles.micContainer} ${isListening ? styles.micActive : ''}`}
                onClick={toggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              </motion.div>

              <TherapyModes currentMode={mode} onModeSelect={setMode} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
