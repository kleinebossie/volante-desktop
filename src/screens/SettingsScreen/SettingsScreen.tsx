import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SEASONS } from '../../data/seasons';
import { TRACKS } from '../../data/tracks';
import { useSettingsStore } from '../../stores/settingsStore';
import type { PenaltyTrigger } from '../../types/regulations';
import styles from './SettingsScreen.module.css';

const DURATION_MIN = 1;
const DURATION_MAX = 600;
const IDLE_THRESHOLD_MIN = 10;
const IDLE_THRESHOLD_MAX = 3600;

const clampValue = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsScreen({ isOpen, onClose }: SettingsScreenProps) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [durationInput, setDurationInput] = useState(() =>
    String(settings.defaultDurationMin)
  );
  const [idleThresholdInput, setIdleThresholdInput] = useState(() =>
    String(settings.idleThresholdSec)
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDurationInput(String(settings.defaultDurationMin));
    setIdleThresholdInput(String(settings.idleThresholdSec));
  }, [isOpen, settings.defaultDurationMin, settings.idleThresholdSec]);

  const parseInteger = (value: string): number | null => {
    if (!/^\d+$/.test(value)) {
      return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  };

  const isDurationInvalid =
    durationInput !== '' &&
    (() => {
      const parsed = parseInteger(durationInput);
      return parsed === null || parsed < DURATION_MIN || parsed > DURATION_MAX;
    })();

  const isIdleThresholdInvalid =
    idleThresholdInput !== '' &&
    (() => {
      const parsed = parseInteger(idleThresholdInput);
      return (
        parsed === null ||
        parsed < IDLE_THRESHOLD_MIN ||
        parsed > IDLE_THRESHOLD_MAX
      );
    })();

  const saveDuration = (value: string): number | null => {
    const parsed = parseInteger(value);

    if (parsed === null) {
      return null;
    }

    const clamped = clampValue(parsed, DURATION_MIN, DURATION_MAX);

    if (clamped !== settings.defaultDurationMin) {
      void updateSettings({ defaultDurationMin: clamped });
    }

    return clamped;
  };

  const saveIdleThreshold = (value: string): number | null => {
    const parsed = parseInteger(value);

    if (parsed === null) {
      return null;
    }

    const clamped = clampValue(
      parsed,
      IDLE_THRESHOLD_MIN,
      IDLE_THRESHOLD_MAX
    );

    if (clamped !== settings.idleThresholdSec) {
      void updateSettings({ idleThresholdSec: clamped });
    }

    return clamped;
  };

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
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  step={1}
                  value={durationInput}
                  onChange={(event) => {
                    setDurationInput(event.target.value);
                  }}
                  onBlur={() => {
                    if (durationInput === '') {
                      setDurationInput(String(settings.defaultDurationMin));
                      return;
                    }

                    const clamped = saveDuration(durationInput);

                    if (clamped === null) {
                      if (settings.defaultDurationMin !== DURATION_MIN) {
                        void updateSettings({ defaultDurationMin: DURATION_MIN });
                      }
                      setDurationInput(String(DURATION_MIN));
                      return;
                    }

                    setDurationInput(String(clamped));
                  }}
                  aria-invalid={isDurationInvalid}
                />
                {isDurationInvalid ? (
                  <p className={styles.validationError} role="alert">
                    Enter a number between {DURATION_MIN} and {DURATION_MAX}.
                  </p>
                ) : null}

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
                  min={IDLE_THRESHOLD_MIN}
                  max={IDLE_THRESHOLD_MAX}
                  step={1}
                  value={idleThresholdInput}
                  onChange={(event) => {
                    setIdleThresholdInput(event.target.value);
                  }}
                  onBlur={() => {
                    if (idleThresholdInput === '') {
                      setIdleThresholdInput(String(settings.idleThresholdSec));
                      return;
                    }

                    const clamped = saveIdleThreshold(idleThresholdInput);

                    if (clamped === null) {
                      if (settings.idleThresholdSec !== IDLE_THRESHOLD_MIN) {
                        void updateSettings({ idleThresholdSec: IDLE_THRESHOLD_MIN });
                      }
                      setIdleThresholdInput(String(IDLE_THRESHOLD_MIN));
                      return;
                    }

                    setIdleThresholdInput(String(clamped));
                  }}
                  aria-invalid={isIdleThresholdInvalid}
                />
                {isIdleThresholdInvalid ? (
                  <p className={styles.validationError} role="alert">
                    Enter a number between {IDLE_THRESHOLD_MIN} and {IDLE_THRESHOLD_MAX}.
                  </p>
                ) : null}
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
