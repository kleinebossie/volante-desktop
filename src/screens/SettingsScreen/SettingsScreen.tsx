import { AnimatePresence, motion } from 'framer-motion';
import { SEASONS } from '../../data/seasons';
import { TRACKS } from '../../data/tracks';
import { useSettingsStore } from '../../stores/settingsStore';
import type { PenaltyTrigger } from '../../types/regulations';
import styles from './SettingsScreen.module.css';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsScreen({ isOpen, onClose }: SettingsScreenProps) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const togglePenaltyTrigger = (trigger: PenaltyTrigger) => {
    const nextTriggers = settings.defaultPenaltyTriggers.includes(trigger)
      ? settings.defaultPenaltyTriggers.filter((item) => item !== trigger)
      : [...settings.defaultPenaltyTriggers, trigger];

    void updateSettings({ defaultPenaltyTriggers: nextTriggers });
  };

  const toggleFavoriteTrack = (trackId: string) => {
    const nextFavoriteTrackIds = settings.favoriteTrackIds.includes(trackId)
      ? settings.favoriteTrackIds.filter((id) => id !== trackId)
      : [...settings.favoriteTrackIds, trackId];

    void updateSettings({ favoriteTrackIds: nextFavoriteTrackIds });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.header}>
              <h2 className={styles.title}>Settings</h2>
              <button type="button" className={styles.closeButton} onClick={onClose}>
                Close
              </button>
            </header>

            <div className={styles.content}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Session Defaults</h3>

                <label className={styles.fieldLabel} htmlFor="settings-duration">
                  Default session duration (minutes)
                </label>
                <input
                  id="settings-duration"
                  className={styles.input}
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={settings.defaultDurationMin}
                  onChange={(event) => {
                    const rawValue = Number(event.target.value);
                    const boundedValue = Math.min(
                      120,
                      Math.max(5, Number.isFinite(rawValue) ? rawValue : 5)
                    );
                    void updateSettings({ defaultDurationMin: boundedValue });
                  }}
                />

                <label className={styles.fieldLabel} htmlFor="settings-season">
                  Default season ruleset
                </label>
                <select
                  id="settings-season"
                  className={styles.select}
                  value={settings.defaultSeasonYear}
                  onChange={(event) =>
                    void updateSettings({ defaultSeasonYear: Number(event.target.value) })
                  }
                >
                  {SEASONS.map((season) => (
                    <option key={season.seasonYear} value={season.seasonYear}>
                      {season.seasonYear} Regulations
                    </option>
                  ))}
                </select>

                <label className={styles.toggleRow}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={settings.parcFermeDefault}
                    onChange={(event) =>
                      void updateSettings({ parcFermeDefault: event.target.checked })
                    }
                  />
                  Parc Ferme enabled by default
                </label>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Penalty Defaults</h3>

                <div className={styles.toggleGroup}>
                  {(['pause', 'unfocus', 'idle'] as PenaltyTrigger[]).map((trigger) => (
                    <label key={trigger} className={styles.toggleRow}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={settings.defaultPenaltyTriggers.includes(trigger)}
                        onChange={() => togglePenaltyTrigger(trigger)}
                      />
                      {trigger === 'unfocus'
                        ? 'App unfocus penalty'
                        : `${trigger[0].toUpperCase()}${trigger.slice(1)} penalty`}
                    </label>
                  ))}
                </div>

                <label className={styles.fieldLabel} htmlFor="settings-idle-threshold">
                  Idle threshold (seconds)
                </label>
                <input
                  id="settings-idle-threshold"
                  className={styles.input}
                  type="number"
                  min={30}
                  max={600}
                  step={5}
                  value={settings.idleThresholdSec}
                  onChange={(event) => {
                    const rawValue = Number(event.target.value);
                    const boundedValue = Math.min(
                      600,
                      Math.max(30, Number.isFinite(rawValue) ? rawValue : 30)
                    );
                    void updateSettings({ idleThresholdSec: boundedValue });
                  }}
                />
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Display</h3>
                <label className={styles.toggleRow}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={settings.showLapCounter}
                    onChange={(event) =>
                      void updateSettings({ showLapCounter: event.target.checked })
                    }
                  />
                  Show lap counter
                </label>
                <label className={styles.toggleRow}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={settings.showPenaltyFeed}
                    onChange={(event) =>
                      void updateSettings({ showPenaltyFeed: event.target.checked })
                    }
                  />
                  Show penalty feed
                </label>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Favorite Tracks</h3>
                <div className={styles.favoriteTracksGrid}>
                  {TRACKS.map((track) => (
                    <label key={track.id} className={styles.favoriteTrackItem}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={settings.favoriteTrackIds.includes(track.id)}
                        onChange={() => toggleFavoriteTrack(track.id)}
                      />
                      <span className={styles.trackName}>
                        {track.flagEmoji} {track.name}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
