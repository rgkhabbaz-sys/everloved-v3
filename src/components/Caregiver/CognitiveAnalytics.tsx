'use client';

import React from 'react';
import styles from './Caregiver.module.css';
import CognitiveMetricCard from './CognitiveMetricCard';

const CognitiveAnalytics = () => {
    return (
        <div className={styles.grid}>
            {/* Card 1: Lexical Diversity */}
            <CognitiveMetricCard
                title="Lexical Diversity"
                value="0.72"
                subValue="Ratio"
                trend="Stable"
                insight="Measures vocabulary retention and verbal complexity over time."
                chartType="line"
                data={[0.7, 0.71, 0.72, 0.71, 0.73, 0.72, 0.72]}
                color="#60a5fa"
            />

            {/* Card 2: Semantic Coherence */}
            <CognitiveMetricCard
                title="Semantic Coherence"
                value="92%"
                subValue="Logical Flow"
                insight="Ability to maintain topic and logical sentence structure."
                chartType="bar-gauge"
                data={3} // High
                color="#4ade80"
            />

            {/* Card 3: Response Latency */}
            <CognitiveMetricCard
                title="Processing Speed"
                value="1.8s"
                subValue="Avg Delay"
                trend="↑ Slower"
                insight="Time taken to respond to Avatar prompts; indicates synaptic processing speed."
                chartType="sparkline"
                data={[1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8]}
                color="#fbbf24"
            />

            {/* Card 4: Emotional State Map */}
            <CognitiveMetricCard
                title="Emotional Valence"
                value="Calm"
                subValue="Positive"
                insight="Distinguishes between agitation (High Energy/Negative) and depression (Low Energy/Negative)."
                chartType="scatter"
                data={[
                    { x: 20, y: 30 }, { x: 40, y: 50 }, { x: 60, y: 40 }, { x: 50, y: 60 }, { x: 70, y: 30 }
                ]}
                color="#a78bfa"
            />

            {/* Card 5: Memory Recall Rate */}
            <CognitiveMetricCard
                title="Short-Term Recall"
                value="3/5"
                subValue="Prompts"
                insight="Success rate in session-based memory prompts."
                chartType="circle"
                data={60}
                color="#f472b6"
            />

            {/* Card 6: Disorientation Events */}
            <CognitiveMetricCard
                title="Confusion Episodes"
                value="4"
                subValue="Events Today"
                insight="Frequency of 'Where am I?' or identity confusion statements."
                chartType="vertical-bar"
                data={[20, 60, 20]} // Morning, Afternoon, Evening
                color="#ef4444"
            />

            {/* Card 7: Cognitive Stamina */}
            <CognitiveMetricCard
                title="Attention Span"
                value="12m 30s"
                subValue="Avg Session"
                insight="Duration of active engagement before focus is lost."
                chartType="histogram"
                data={[40, 60, 80, 50, 30, 20, 10]}
                color="#2dd4bf"
            />

            {/* Card 8: Speech Fluency */}
            <CognitiveMetricCard
                title="Verbal Fluency"
                value="85"
                subValue="Words/Min"
                trend="↓"
                insight="Speech motor control and processing speed."
                chartType="trend-line"
                data={[0.9, 0.88, 0.87, 0.86, 0.85, 0.84, 0.85]}
                color="#fb7185"
            />
        </div>
    );
};

export default CognitiveAnalytics;
