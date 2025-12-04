'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Moon, Activity, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import MetricCard from './MetricCard';
import styles from './Wellness.module.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.5
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 2.0,
            ease: "easeInOut" as const
        }
    }
};

const WellnessDashboard = () => {
    // Mock data for visualizations
    const heartRateData = [40, 45, 60, 55, 50, 65, 70, 60, 55, 50, 45, 40];
    const sleepData = [20, 30, 50, 80, 90, 85, 60, 40, 20, 10];
    const moodData = [60, 65, 70, 80, 75, 70, 65, 60, 65, 70];

    return (
        <div className={styles.container}>
            <div className={styles.backgroundWrapper}>
                <Image
                    src="/wellness-bg-new.jpg"
                    alt="Serene Waterfall Landscape"
                    fill
                    className={styles.backgroundImage}
                    priority
                />
                <div className={styles.overlay} />
            </div>

            <motion.div
                className={styles.dashboard}
                variants={container}
                initial="hidden"
                animate="show"
            >
                <header className={styles.header}>
                    <h1 className={styles.title}>Health & Wellness</h1>
                    <p className={styles.subtitle}>
                        Real-time monitoring of vital signs, sleep quality, and emotional well-being.
                    </p>
                </header>

                <div className={styles.grid}>
                    <motion.div variants={item}>
                        <MetricCard
                            title="Heart Rate"
                            value="72"
                            unit="BPM"
                            icon={Heart}
                            status="good"
                            statusText="Normal Range"
                            data={heartRateData}
                        />
                    </motion.div>

                    <motion.div variants={item}>
                        <MetricCard
                            title="Sleep Quality"
                            value="7.5"
                            unit="Hours"
                            icon={Moon}
                            status="good"
                            statusText="Restful Sleep"
                            data={sleepData}
                        />
                    </motion.div>

                    <motion.div variants={item}>
                        <MetricCard
                            title="Daily Activity"
                            value="2,450"
                            unit="Steps"
                            icon={Activity}
                            status="warning"
                            statusText="Below Target"
                            data={[20, 30, 40, 35, 25, 15, 10]}
                        />
                    </motion.div>

                    <motion.div variants={item}>
                        <MetricCard
                            title="Cognitive State"
                            value="Stable"
                            unit=""
                            icon={Brain}
                            status="neutral"
                            statusText="No significant changes"
                            data={moodData}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default WellnessDashboard;
