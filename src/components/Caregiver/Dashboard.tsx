'use client';

import React, { useState } from 'react';
import PageTransition from '../UI/PageTransition';
import AvatarCreation from './AvatarCreation';
import CaregiverMonitoring from './CaregiverMonitoring';
import CognitiveAnalytics from './CognitiveAnalytics';
import styles from './Caregiver.module.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('monitoring');

    return (
        <PageTransition className={styles.dashboard}>
            <header className={styles.header}>
                <h1 className={styles.title}>Caregiver Command Center</h1>
                <p className={styles.subtitle}>Configure avatar, monitor interactions, and analyze well-being.</p>
            </header>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'configuration' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('configuration')}
                >
                    Avatar Configuration
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'monitoring' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('monitoring')}
                >
                    Monitoring Dashboard
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Cognitive Analytics
                </button>
            </div>

            {activeTab === 'configuration' && <AvatarCreation />}
            {activeTab === 'monitoring' && <CaregiverMonitoring />}
            {activeTab === 'analytics' && <CognitiveAnalytics />}
        </PageTransition>
    );
};

export default Dashboard;
