import React from 'react';
import { TRACKS } from '../../data/tracks';
import styles from './TrackSelector.module.css';
import { motion } from 'framer-motion';

interface TrackSelectorProps {
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
}

export function TrackSelector({ selectedTrackId, onSelectTrack }: TrackSelectorProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Select Circuit</h3>
      <div className={styles.scrollArea}>
        {TRACKS.map(track => {
          const isSelected = track.id === selectedTrackId;
          return (
            <motion.button
              key={track.id}
              className={`${styles.trackCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelectTrack(track.id)}
              style={{
                '--track-accent': track.accentColor,
              } as React.CSSProperties}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.flag}>{track.flagEmoji}</div>
              <div className={styles.details}>
                <div className={styles.country}>{track.countryName}</div>
                <div className={styles.name}>{track.name}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
