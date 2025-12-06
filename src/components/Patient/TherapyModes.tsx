'use client';

import React from 'react';
import { MessageCircle, Music, Wind, Video } from 'lucide-react';
import styles from './Patient.module.css';

interface TherapyModesProps {
    currentMode: 'clinical' | 'casual';
    onModeSelect: (mode: 'clinical' | 'casual') => void;
}

const TherapyModes: React.FC<TherapyModesProps> = ({ currentMode, onModeSelect }) => {
    const modes = [
        { id: 'clinical' as const, label: 'Clinical', icon: MessageCircle },
        { id: 'casual' as const, label: 'Casual', icon: Music },
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
