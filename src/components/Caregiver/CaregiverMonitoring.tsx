'use client';

import React from 'react';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import styles from './Caregiver.module.css';

const CaregiverMonitoring = () => {
    return (
        <div className={styles.grid}>
            {/* Real-Time Transcripts */}
            <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                <div className={styles.cardHeader}>
                    <MessageSquare className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Live Transcript</h2>
                </div>
                <div className={styles.transcriptContainer}>
                    <div className={`${styles.message} ${styles.messagePatient}`}>
                        Where is my dog, Buster? I haven&apos;t seen him all day.
                    </div>
                    <div className={`${styles.message} ${styles.messageAvatar}`}>
                        Buster is playing in the garden, Mom. He&apos;s having a great time chasing butterflies. Do you remember when we got him?
                    </div>
                    <div className={`${styles.message} ${styles.messagePatient}`}>
                        Oh yes, he was such a small puppy.
                    </div>
                    <div className={`${styles.message} ${styles.messageAvatar}`}>
                        He was! And he loved sleeping in your old slipper.
                    </div>
                </div>
            </div>

            {/* Intervention Tools */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <AlertCircle className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Intervention</h2>
                </div>

                <div className={styles.formGroup}>
                    <button className={styles.emergencyButton}>
                        <AlertCircle size={20} />
                        Emergency Pause
                    </button>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Schedule Manager</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Clock size={16} color="var(--secondary)" />
                        <span style={{ color: 'var(--foreground)' }}>Active Hours: 9:00 AM - 8:00 PM</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Core Memory Input</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" className={styles.input} placeholder="e.g. Wedding 1960" />
                        <button className={styles.tabButton} style={{ background: 'rgba(255,255,255,0.1)' }}>Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaregiverMonitoring;
