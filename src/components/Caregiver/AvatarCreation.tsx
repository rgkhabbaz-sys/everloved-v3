'use client';

import React, { useState, useRef } from 'react';
import { Upload, Mic, Shield, Check, X } from 'lucide-react';
import styles from './Caregiver.module.css';
import { motion } from 'framer-motion';

const AvatarCreation = () => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [voiceStyle, setVoiceStyle] = useState('gentle');
    const [tones, setTones] = useState({ calm: true, jovial: true, authoritative: false });
    const [identity, setIdentity] = useState({ name: '', relationship: '' });
    const [boundaries, setBoundaries] = useState({ blockTravel: true, blockAlive: true, redirectConfusion: true });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load saved photos on mount
    React.useEffect(() => {
        const savedPhotos = localStorage.getItem('everloved_photos');
        if (savedPhotos) {
            const parsedPhotos = JSON.parse(savedPhotos);
            setPhotos(parsedPhotos);

            // Try to find the selected avatar in the list
            const savedAvatar = localStorage.getItem('everloved_avatar');
            if (savedAvatar) {
                const index = parsedPhotos.indexOf(savedAvatar);
                if (index !== -1) {
                    setSelectedPhotoIndex(index);
                }
            }
        }
    }, []);

    const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    try {
                        const originalBase64 = event.target!.result as string;
                        const compressedBase64 = await compressImage(originalBase64);

                        setPhotos(prev => {
                            const newPhotos = [...prev, compressedBase64];
                            try {
                                localStorage.setItem('everloved_photos', JSON.stringify(newPhotos));
                            } catch (err) {
                                console.error('Error saving photos list:', err);
                                setSaveMessage('Error: Storage full');
                            }
                            return newPhotos;
                        });
                        // Auto-select the first photo if none is selected
                        if (selectedPhotoIndex === null) {
                            setSelectedPhotoIndex(0);
                        }
                    } catch (error) {
                        console.error('Error compressing image:', error);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Save to localStorage
        console.log('Saving configuration...', { selectedPhotoIndex, photosLength: photos.length });

        try {
            if (selectedPhotoIndex === -1) {
                console.log('Clearing avatar from localStorage (No Photo selected)');
                localStorage.removeItem('everloved_avatar');
            } else if (selectedPhotoIndex !== null && photos[selectedPhotoIndex]) {
                console.log('Saving avatar to localStorage:', photos[selectedPhotoIndex].substring(0, 50) + '...');
                localStorage.setItem('everloved_avatar', photos[selectedPhotoIndex]);
            } else {
                console.warn('No avatar selected or photo not found');
            }

            // Save boundaries
            localStorage.setItem('everloved_boundaries', JSON.stringify(boundaries));
            console.log('Saved boundaries:', boundaries);

            // Simulate API call
            setTimeout(() => {
                setIsSaving(false);
                setSaveMessage('Configuration saved successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
            }, 1500);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            setIsSaving(false);
            setSaveMessage('Error saving! Image might be too large.');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const toggleTone = (tone: keyof typeof tones) => {
        setTones(prev => ({ ...prev, [tone]: !prev[tone] }));
    };

    const toggleBoundary = (boundary: keyof typeof boundaries) => {
        setBoundaries(prev => ({ ...prev, [boundary]: !prev[boundary] }));
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => {
            const newPhotos = prev.filter((_, i) => i !== index);
            localStorage.setItem('everloved_photos', JSON.stringify(newPhotos));
            return newPhotos;
        });
        if (selectedPhotoIndex === index) {
            setSelectedPhotoIndex(null);
            localStorage.removeItem('everloved_avatar'); // Remove selection if deleted
        }
        if (selectedPhotoIndex !== null && selectedPhotoIndex > index) setSelectedPhotoIndex(selectedPhotoIndex - 1);
    };

    return (
        <div className={styles.grid}>
            {/* Photo Upload */}
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1.0, ease: "easeInOut" }}
            >
                <div className={styles.cardHeader}>
                    <Upload className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Photo Upload</h2>
                </div>
                <div
                    className={styles.uploadZone}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />
                    <Upload size={48} />
                    <p>Drag & drop or click to upload</p>
                    <button className={styles.tabButton} style={{ background: 'rgba(255,255,255,0.1)', marginTop: '0.5rem' }}>
                        Choose Files
                    </button>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Supports JPG, PNG</p>
                </div>

                {photos.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <p className={styles.label}>Select Primary Avatar:</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* No Photo Option */}
                            <div
                                style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    cursor: 'pointer',
                                    border: selectedPhotoIndex === -1 ? '3px solid #4ade80' : '2px solid rgba(255,255,255,0.2)',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.2)',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}
                                onClick={() => setSelectedPhotoIndex(-1)}
                            >
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>No<br />Photo</span>
                                {selectedPhotoIndex === -1 && (
                                    <div style={{
                                        position: 'absolute', bottom: -8, right: -8,
                                        background: '#4ade80', color: 'black',
                                        borderRadius: '50%', width: '20px', height: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {photos.map((photo, index) => (
                                <div
                                    key={index}
                                    style={{
                                        position: 'relative',
                                        width: '80px',
                                        height: '80px',
                                        cursor: 'pointer',
                                        border: selectedPhotoIndex === index ? '3px solid #4ade80' : '2px solid transparent',
                                        borderRadius: '10px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => setSelectedPhotoIndex(index)}
                                >
                                    <img
                                        src={photo}
                                        alt={`Upload ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    {selectedPhotoIndex === index && (
                                        <div style={{
                                            position: 'absolute', bottom: -8, right: -8,
                                            background: '#4ade80', color: 'black',
                                            borderRadius: '50%', width: '20px', height: '20px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                                        style={{
                                            position: 'absolute', top: -5, right: -5,
                                            background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none',
                                            borderRadius: '50%', width: '20px', height: '20px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Voice Engine */}
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.0, ease: "easeInOut" }}
            >
                <div className={styles.cardHeader}>
                    <Mic className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Voice Engine</h2>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Voice Style</label>
                    <select
                        className={styles.select}
                        value={voiceStyle}
                        onChange={(e) => setVoiceStyle(e.target.value)}
                    >
                        <option value="warm">Warm & Comforting</option>
                        <option value="gentle">Gentle & Soft</option>
                        <option value="slow">Slow-paced & Clear</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Tone Anchors</label>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={tones.calm}
                                onChange={() => toggleTone('calm')}
                            /> Calm
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={tones.jovial}
                                onChange={() => toggleTone('jovial')}
                            /> Jovial
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={tones.authoritative}
                                onChange={() => toggleTone('authoritative')}
                            /> Authoritative
                        </label>
                    </div>
                </div>
            </motion.div>

            {/* Safety Settings */}
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1.0, ease: "easeInOut" }}
            >
                <div className={styles.cardHeader}>
                    <Shield className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>Safety Settings</h2>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Identity Configuration</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Name (e.g. Martha)"
                        style={{ marginBottom: '0.5rem' }}
                        value={identity.name}
                        onChange={(e) => setIdentity(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Relationship (e.g. Mother)"
                        value={identity.relationship}
                        onChange={(e) => setIdentity(prev => ({ ...prev, relationship: e.target.value }))}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Boundaries</label>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={boundaries.blockTravel}
                                onChange={() => toggleBoundary('blockTravel')}
                            /> Block travel promises
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={boundaries.blockAlive}
                                onChange={() => toggleBoundary('blockAlive')}
                            /> Block &quot;being alive&quot; claims
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={boundaries.redirectConfusion}
                                onChange={() => toggleBoundary('redirectConfusion')}
                            /> Redirect confusion
                        </label>
                    </div>
                </div>
            </motion.div>

            {/* Save Button */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                {saveMessage && (
                    <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={16} /> {saveMessage}
                    </span>
                )}
                <button
                    className={styles.tabButton}
                    style={{ background: 'var(--foreground)', color: 'var(--background)', fontWeight: 600 }}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};

export default AvatarCreation;
