import React, { useMemo } from 'react';
import { TRACKS } from '../../data/tracks';
import styles from './TrackSelector.module.css';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

interface TrackSelectorProps {
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
}

export function TrackSelector({ selectedTrackId, onSelectTrack }: TrackSelectorProps) {
  const favoriteTrackIds = useSettingsStore((s) => s.settings.favoriteTrackIds);

  const orderedTracks = useMemo(() => {
    const favoriteSet = new Set(favoriteTrackIds);

    return [...TRACKS].sort((a, b) => {
      const aFav = favoriteSet.has(a.id);
      const bFav = favoriteSet.has(b.id);

      if (aFav === bFav) {
        return a.name.localeCompare(b.name);
      }

      return aFav ? -1 : 1;
    });
  }, [favoriteTrackIds]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Select Circuit</h3>
      <div className={styles.scrollArea}>
        {orderedTracks.map((track, index) => {
          const isSelected = track.id === selectedTrackId;
          const isFavorite = favoriteTrackIds.includes(track.id);

          return (
            <motion.button
              key={track.id}
              className={`${styles.trackCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelectTrack(track.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.15), ease: 'easeOut' }}
              style={{
                '--track-accent': track.accentColor,
              } as React.CSSProperties}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.flag}>{track.flagEmoji}</div>
                {isFavorite ? <span className={styles.favoriteBadge}>Favorite</span> : null}
              </div>
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
