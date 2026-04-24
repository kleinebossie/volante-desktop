import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TRACKS } from '../../data/tracks';
import styles from './TrackSelector.module.css';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

interface TrackSelectorProps {
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  hideScrollbar?: boolean;
}

export function TrackSelector({ selectedTrackId, onSelectTrack, hideScrollbar = false }: TrackSelectorProps) {
  const favoriteTrackIds = useSettingsStore((s) => s.settings.favoriteTrackIds);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startClientX: number;
    startThumbLeftPx: number;
    maxThumbLeftPx: number;
    maxScrollLeftPx: number;
  } | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    isScrollable: false,
    trackWidthPx: 0,
    thumbWidthPx: 0,
    thumbLeftPx: 0,
  });

  const orderedTracks = useMemo(() => {
    const favoriteSet = new Set(favoriteTrackIds);

    // Keep catalog order (2026 calendar order) while pinning favorites first.
    const favoriteTracks = TRACKS.filter((track) => favoriteSet.has(track.id));
    const nonFavoriteTracks = TRACKS.filter((track) => !favoriteSet.has(track.id));

    return [...favoriteTracks, ...nonFavoriteTracks];
  }, [favoriteTrackIds]);

  const updateScrollMetrics = useCallback(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea || hideScrollbar) {
      setScrollMetrics({
        isScrollable: false,
        trackWidthPx: 0,
        thumbWidthPx: 0,
        thumbLeftPx: 0,
      });
      return;
    }

    const trackWidthPx = scrollArea.clientWidth;
    const scrollWidthPx = scrollArea.scrollWidth;
    const maxScrollLeftPx = Math.max(0, scrollWidthPx - trackWidthPx);

    if (maxScrollLeftPx <= 0) {
      setScrollMetrics({
        isScrollable: false,
        trackWidthPx,
        thumbWidthPx: trackWidthPx,
        thumbLeftPx: 0,
      });
      return;
    }

    const minThumbWidthPx = 30;
    const thumbWidthPx = Math.max(minThumbWidthPx, (trackWidthPx / scrollWidthPx) * trackWidthPx);
    const maxThumbLeftPx = Math.max(1, trackWidthPx - thumbWidthPx);
    const thumbLeftPx = (scrollArea.scrollLeft / maxScrollLeftPx) * maxThumbLeftPx;

    setScrollMetrics({
      isScrollable: true,
      trackWidthPx,
      thumbWidthPx,
      thumbLeftPx,
    });
  }, [hideScrollbar]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    updateScrollMetrics();

    const onScroll = () => {
      updateScrollMetrics();
    };

    scrollArea.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollMetrics();
    });
    resizeObserver.observe(scrollArea);

    return () => {
      scrollArea.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollMetrics);
      resizeObserver.disconnect();
    };
  }, [updateScrollMetrics]);

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea || !scrollMetrics.isScrollable) {
      return;
    }

    const maxScrollLeftPx = Math.max(0, scrollArea.scrollWidth - scrollArea.clientWidth);
    const maxThumbLeftPx = Math.max(1, scrollMetrics.trackWidthPx - scrollMetrics.thumbWidthPx);

    dragStateRef.current = {
      startClientX: event.clientX,
      startThumbLeftPx: scrollMetrics.thumbLeftPx,
      maxThumbLeftPx,
      maxScrollLeftPx,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleThumbPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const scrollArea = scrollAreaRef.current;

    if (!dragState || !scrollArea) {
      return;
    }

    const deltaX = event.clientX - dragState.startClientX;
    const nextThumbLeftPx = Math.min(
      Math.max(0, dragState.startThumbLeftPx + deltaX),
      dragState.maxThumbLeftPx
    );

    const ratio = dragState.maxThumbLeftPx <= 0 ? 0 : nextThumbLeftPx / dragState.maxThumbLeftPx;
    scrollArea.scrollLeft = ratio * dragState.maxScrollLeftPx;
  };

  const handleThumbPointerUp = () => {
    dragStateRef.current = null;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Select Circuit</h3>
      <div className={styles.scrollViewport}>
        <div
          ref={scrollAreaRef}
          className={`${styles.scrollArea} ${hideScrollbar ? styles.scrollAreaHidden : ''}`}
        >
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

        {!hideScrollbar && scrollMetrics.isScrollable ? (
          <div className={styles.customScrollbar} aria-hidden="true">
            <div className={styles.customScrollbarTrack}>
              <div
                className={styles.customScrollbarThumb}
                style={{
                  width: `${scrollMetrics.thumbWidthPx}px`,
                  transform: `translateX(${scrollMetrics.thumbLeftPx}px)`,
                }}
                onPointerDown={handleThumbPointerDown}
                onPointerMove={handleThumbPointerMove}
                onPointerUp={handleThumbPointerUp}
                onPointerCancel={handleThumbPointerUp}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
