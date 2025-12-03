'use client';

import React from 'react';
import { Activity, Repeat, HeartPulse } from 'lucide-react';
import styles from './Caregiver.module.css';

const CognitiveAnalytics = () => {
    return (
        <div className={styles.grid}>
            {/* Agitation Tracker */}
            <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                <div className={styles.cardHeader}>
                    <Activity className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Agitation Levels (24h)</h2>
                </div>
                <div className={styles.chartContainer}>
                    {[30, 45, 20, 60, 80, 50, 30, 20, 40, 35, 25, 20, 15, 30, 40, 50, 45, 30, 20, 15, 10, 20, 30, 25].map((height, i) => (
                        <div key={i} className={styles.chartBar} style={{ height: `${height}%` }} title={`Hour ${i}: ${height}%`} />
                    ))}
                </div>
            </div>

            {/* Sentiment & Looping */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <HeartPulse className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Emotional State</h2>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Current Status</label>
                    <div className={styles.sentimentIndicator}>
                        <div className={`${styles.sentimentDot} ${styles.sentimentGrounded}`} />
                        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Grounded</span>
                    </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                    <div className={styles.cardHeader} style={{ marginBottom: '0.5rem', border: 'none', padding: 0 }}>
                        <Repeat className={styles.cardIcon} size={20} />
                        <h3 className={styles.label} style={{ margin: 0 }}>Looping Frequency</h3>
                    </div>
                    <div className={styles.statValue}>12</div>
                    <p className={styles.statLabel}>Repetitive questions today</p>
                </div>
            </div>
        </div>
    );
};

export default CognitiveAnalytics;
