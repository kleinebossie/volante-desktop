import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SEASONS } from '../../data/seasons';
import { TRACKS } from '../../data/tracks';
import { useSettingsStore } from '../../stores/settingsStore';
import type { PenaltyTrigger } from '../../types/regulations';
import type { UserSettings } from '../../types/settings';
import styles from './SettingsScreen.module.css';

const DURATION_MIN = 5;
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

  const [boostRelativeInput, setBoostRelativeInput] = useState(() =>
    String(settings.boostRelativePercent)
  );
  const [boostMinInput, setBoostMinInput] = useState(() =>
    String(Math.floor(settings.boostAbsoluteSec / 60))
  );
  const [boostSecInput, setBoostSecInput] = useState(() =>
    String(settings.boostAbsoluteSec % 60)
  );

  const [overtakeRelativeInput, setOvertakeRelativeInput] = useState(() =>
    String(settings.overtakeRelativePercent)
  );
  const [overtakeMinInput, setOvertakeMinInput] = useState(() =>
    String(Math.floor(settings.overtakeAbsoluteSec / 60))
  );
  const [overtakeSecInput, setOvertakeSecInput] = useState(() =>
    String(settings.overtakeAbsoluteSec % 60)
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDurationInput(String(settings.defaultDurationMin));
    setIdleThresholdInput(String(settings.idleThresholdSec));

    setBoostRelativeInput(String(settings.boostRelativePercent));
    setBoostMinInput(String(Math.floor(settings.boostAbsoluteSec / 60)));
    setBoostSecInput(String(settings.boostAbsoluteSec % 60));

    setOvertakeRelativeInput(String(settings.overtakeRelativePercent));
    setOvertakeMinInput(String(Math.floor(settings.overtakeAbsoluteSec / 60)));
    setOvertakeSecInput(String(settings.overtakeAbsoluteSec % 60));
  }, [
    isOpen,
    settings.defaultDurationMin,
    settings.idleThresholdSec,
    settings.boostRelativePercent,
    settings.boostAbsoluteSec,
    settings.overtakeRelativePercent,
    settings.overtakeAbsoluteSec,
    settings.regulationDurationType,
  ]);

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

  const parseMinSec = (mStr: string, sStr: string): number | null => {
    const m = mStr === '' ? 0 : parseInteger(mStr);
    const s = sStr === '' ? 0 : parseInteger(sStr);
    if (m === null || s === null) {
      return null;
    }
    return m * 60 + s;
  };

  const isBoostRelativeInvalid =
    boostRelativeInput !== '' &&
    (() => {
      const parsed = parseInteger(boostRelativeInput);
      const overtakeParsed = parseInteger(overtakeRelativeInput);
      return (
        parsed === null ||
        parsed < 1 ||
        (overtakeParsed !== null && parsed > overtakeParsed)
      );
    })();

  const isOvertakeRelativeInvalid =
    overtakeRelativeInput !== '' &&
    (() => {
      const parsed = parseInteger(overtakeRelativeInput);
      const boostParsed = parseInteger(boostRelativeInput);
      return (
        parsed === null ||
        (boostParsed !== null && parsed < boostParsed) ||
        parsed > 50
      );
    })();

  const isBoostAbsoluteInvalid =
    (boostMinInput !== '' || boostSecInput !== '') &&
    (() => {
      const totalSec = parseMinSec(boostMinInput, boostSecInput);
      const overtakeSec = parseMinSec(overtakeMinInput, overtakeSecInput);
      if (totalSec === null) {
        return true;
      }
      return (
        totalSec < 1 ||
        (overtakeSec !== null && totalSec > overtakeSec)
      );
    })();

  const isOvertakeAbsoluteInvalid =
    (overtakeMinInput !== '' || overtakeSecInput !== '') &&
    (() => {
      const totalSec = parseMinSec(overtakeMinInput, overtakeSecInput);
      const boostSec = parseMinSec(boostMinInput, boostSecInput);
      if (totalSec === null) {
        return true;
      }
      return (
        (boostSec !== null && totalSec < boostSec) ||
        totalSec > 300 * 60
      );
    })();

  const saveBoostRelative = (valueStr: string) => {
    const parsed = parseInteger(valueStr);
    if (parsed === null) {
      setBoostRelativeInput(String(settings.boostRelativePercent));
      return;
    }
    const clampedBoost = clampValue(parsed, 1, 50);
    const updates: Partial<UserSettings> = { boostRelativePercent: clampedBoost };
    if (clampedBoost > settings.overtakeRelativePercent) {
      updates.overtakeRelativePercent = clampedBoost;
      setOvertakeRelativeInput(String(clampedBoost));
    }
    void updateSettings(updates);
    setBoostRelativeInput(String(clampedBoost));
  };

  const saveOvertakeRelative = (valueStr: string) => {
    const parsed = parseInteger(valueStr);
    if (parsed === null) {
      setOvertakeRelativeInput(String(settings.overtakeRelativePercent));
      return;
    }
    const clampedOvertake = clampValue(parsed, 1, 50);
    const updates: Partial<UserSettings> = { overtakeRelativePercent: clampedOvertake };
    if (clampedOvertake < settings.boostRelativePercent) {
      updates.boostRelativePercent = clampedOvertake;
      setBoostRelativeInput(String(clampedOvertake));
    }
    void updateSettings(updates);
    setOvertakeRelativeInput(String(clampedOvertake));
  };

  const saveBoostAbsolute = (minStr: string, secStr: string) => {
    const totalSec = parseMinSec(minStr, secStr);
    if (totalSec === null) {
      setBoostMinInput(String(Math.floor(settings.boostAbsoluteSec / 60)));
      setBoostSecInput(String(settings.boostAbsoluteSec % 60));
      return;
    }
    const clampedBoost = clampValue(totalSec, 1, 300 * 60);
    const updates: Partial<UserSettings> = { boostAbsoluteSec: clampedBoost };
    if (clampedBoost > settings.overtakeAbsoluteSec) {
      updates.overtakeAbsoluteSec = clampedBoost;
      setOvertakeMinInput(String(Math.floor(clampedBoost / 60)));
      setOvertakeSecInput(String(clampedBoost % 60));
    }
    void updateSettings(updates);
    setBoostMinInput(String(Math.floor(clampedBoost / 60)));
    setBoostSecInput(String(clampedBoost % 60));
  };

  const saveOvertakeAbsolute = (minStr: string, secStr: string) => {
    const totalSec = parseMinSec(minStr, secStr);
    if (totalSec === null) {
      setOvertakeMinInput(String(Math.floor(settings.overtakeAbsoluteSec / 60)));
      setOvertakeSecInput(String(settings.overtakeAbsoluteSec % 60));
      return;
    }
    const clampedOvertake = clampValue(totalSec, 1, 300 * 60);
    const updates: Partial<UserSettings> = { overtakeAbsoluteSec: clampedOvertake };
    if (clampedOvertake < settings.boostAbsoluteSec) {
      updates.boostAbsoluteSec = clampedOvertake;
      setBoostMinInput(String(Math.floor(clampedOvertake / 60)));
      setBoostSecInput(String(clampedOvertake % 60));
    }
    void updateSettings(updates);
    setOvertakeMinInput(String(Math.floor(clampedOvertake / 60)));
    setOvertakeSecInput(String(clampedOvertake % 60));
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
                <h3 className={styles.sectionTitle}>Boost/DRS & Overtake Durations</h3>
                
                <div className={styles.tabGroup}>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${
                      settings.regulationDurationType === 'relative' ? styles.activeTab : ''
                    }`}
                    onClick={() => void updateSettings({ regulationDurationType: 'relative' })}
                  >
                    Relative (%)
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${
                      settings.regulationDurationType === 'absolute' ? styles.activeTab : ''
                    }`}
                    onClick={() => void updateSettings({ regulationDurationType: 'absolute' })}
                  >
                    Absolute (Min)
                  </button>
                </div>
                
                <div className={styles.gridTwoColumns}>
                  {/* Boost Mode Column */}
                  <div className={styles.gridColumn}>
                    <span className={styles.fieldLabel}>Boost/DRS Duration</span>

                    {settings.regulationDurationType === 'relative' ? (
                      <>
                        <div className={styles.numberInputWithUnit}>
                          <input
                            className={styles.input}
                            type="number"
                            min={1}
                            max={50}
                            step={1}
                            value={boostRelativeInput}
                            onChange={(e) => setBoostRelativeInput(e.target.value)}
                            onBlur={() => saveBoostRelative(boostRelativeInput)}
                            aria-invalid={isBoostRelativeInvalid}
                          />
                          <span className={styles.unitLabel}>%</span>
                        </div>
                        {isBoostRelativeInvalid ? (
                          <p className={styles.validationError} role="alert">
                            Enter a percentage between 1% and the Overtake percentage.
                          </p>
                        ) : (
                          <span className={styles.subLabel}>
                            Range: 1% to {settings.overtakeRelativePercent}%
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div className={styles.durationFieldsRow}>
                          <div className={styles.numberInputWithUnit}>
                            <input
                              className={styles.input}
                              type="number"
                              min={0}
                              max={300}
                              step={1}
                              value={boostMinInput}
                              onChange={(e) => setBoostMinInput(e.target.value)}
                              onBlur={() => saveBoostAbsolute(boostMinInput, boostSecInput)}
                              aria-invalid={isBoostAbsoluteInvalid}
                            />
                            <span className={styles.unitLabel}>m</span>
                          </div>
                          <div className={styles.numberInputWithUnit}>
                            <input
                              className={styles.input}
                              type="number"
                              min={0}
                              max={59}
                              step={1}
                              value={boostSecInput}
                              onChange={(e) => setBoostSecInput(e.target.value)}
                              onBlur={() => saveBoostAbsolute(boostMinInput, boostSecInput)}
                              aria-invalid={isBoostAbsoluteInvalid}
                            />
                            <span className={styles.unitLabel}>s</span>
                          </div>
                        </div>
                        {isBoostAbsoluteInvalid ? (
                          <p className={styles.validationError} role="alert">
                            Must be between 1 second and the Overtake duration.
                          </p>
                        ) : (
                          <span className={styles.subLabel}>
                            Limit: Up to {Math.floor(settings.overtakeAbsoluteSec / 60)}m {settings.overtakeAbsoluteSec % 60}s
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Overtake Mode Column */}
                  <div className={styles.gridColumn}>
                    <span className={styles.fieldLabel}>Overtake Mode Duration</span>

                    {settings.regulationDurationType === 'relative' ? (
                      <>
                        <div className={styles.numberInputWithUnit}>
                          <input
                            className={styles.input}
                            type="number"
                            min={1}
                            max={50}
                            step={1}
                            value={overtakeRelativeInput}
                            onChange={(e) => setOvertakeRelativeInput(e.target.value)}
                            onBlur={() => saveOvertakeRelative(overtakeRelativeInput)}
                            aria-invalid={isOvertakeRelativeInvalid}
                          />
                          <span className={styles.unitLabel}>%</span>
                        </div>
                        {isOvertakeRelativeInvalid ? (
                          <p className={styles.validationError} role="alert">
                            Enter a percentage between the Boost percentage and 50%.
                          </p>
                        ) : (
                          <span className={styles.subLabel}>
                            Range: {settings.boostRelativePercent}% to 50%
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div className={styles.durationFieldsRow}>
                          <div className={styles.numberInputWithUnit}>
                            <input
                              className={styles.input}
                              type="number"
                              min={0}
                              max={300}
                              step={1}
                              value={overtakeMinInput}
                              onChange={(e) => setOvertakeMinInput(e.target.value)}
                              onBlur={() => saveOvertakeAbsolute(overtakeMinInput, overtakeSecInput)}
                              aria-invalid={isOvertakeAbsoluteInvalid}
                            />
                            <span className={styles.unitLabel}>m</span>
                          </div>
                          <div className={styles.numberInputWithUnit}>
                            <input
                              className={styles.input}
                              type="number"
                              min={0}
                              max={59}
                              step={1}
                              value={overtakeSecInput}
                              onChange={(e) => setOvertakeSecInput(e.target.value)}
                              onBlur={() => saveOvertakeAbsolute(overtakeMinInput, overtakeSecInput)}
                              aria-invalid={isOvertakeAbsoluteInvalid}
                            />
                            <span className={styles.unitLabel}>s</span>
                          </div>
                        </div>
                        {isOvertakeAbsoluteInvalid ? (
                          <p className={styles.validationError} role="alert">
                            Must be between the Boost duration and 300 minutes.
                          </p>
                        ) : (
                          <span className={styles.subLabel}>
                            Range: {Math.floor(settings.boostAbsoluteSec / 60)}m {settings.boostAbsoluteSec % 60}s to 300m
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
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
