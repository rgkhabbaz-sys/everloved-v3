import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './Wellness.module.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit: string;
    icon: LucideIcon;
    status: 'good' | 'warning' | 'neutral';
    statusText: string;
    data?: number[]; // Simple array for visualization
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon: Icon, status, statusText, data = [] }) => {
    const statusClass = status === 'good' ? styles.statusGood : status === 'warning' ? styles.statusWarning : '';

    return (
        <div className={`glass-panel ${styles.card}`}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <div className={styles.iconWrapper}>
                    <Icon size={24} />
                </div>
            </div>

            <div className={styles.valueContainer}>
                <span className={styles.value}>{value}</span>
                <span className={styles.unit}>{unit}</span>
            </div>

            <div className={`${styles.status} ${statusClass}`}>
                {statusText}
            </div>

            {data.length > 0 && (
                <div className={styles.visualization}>
                    {data.map((h, i) => (
                        <div
                            key={i}
                            className={styles.bar}
                            style={{ height: `${h}%`, color: status === 'good' ? '#4ade80' : status === 'warning' ? '#fbbf24' : '#fff' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MetricCard;
