'use client';

import React from 'react';
import { MessageCircle, Music, Wind } from 'lucide-react';
import styles from './Patient.module.css';

interface TherapyModesProps {
    currentMode: string;
    onModeSelect: (mode: string) => void;
}

const TherapyModes: React.FC<TherapyModesProps> = ({ currentMode, onModeSelect }) => {
    const modes = [
        { id: 'conversation', label: 'Conversation', icon: MessageCircle },
        { id: 'music', label: 'Music', icon: Music },
        { id: 'meditation', label: 'Meditation', icon: Wind },
    ];

    return (
        <div className={styles.modesContainer}>
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    className={`${styles.modeButton} ${currentMode === mode.id ? styles.activeMode : ''}`}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent click events
                        onModeSelect(mode.id);
                    }}
                >
                    <mode.icon size={16} />
                    {mode.label}
                </button>
            ))}
        </div>
    );
};

export default TherapyModes;
