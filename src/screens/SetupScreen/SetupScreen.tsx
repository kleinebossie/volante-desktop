import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useHistoryStore } from '../../stores/historyStore';
import { TrackSelector } from '../../components/TrackSelector/TrackSelector';
import { DurationPicker } from '../../components/DurationPicker/DurationPicker';
import { StrategyNote } from '../../components/StrategyNote/StrategyNote';
import { SEASONS } from '../../data/seasons';
import { SettingsScreen } from '../SettingsScreen/SettingsScreen';
import { PenaltyTrigger } from '../../types/regulations';
import { formatMMSS } from '../../utils/formatTime';
import styles from './SetupScreen.module.css';

export function SetupScreen() {
  const createSession = useSessionStore((s) => s.createSession);
  const startSession = useSessionStore((s) => s.startSession);
  const setupSession = useSessionStore((s) =>
    s.session && s.session.state === 'setup' ? s.session : null
  );
  const settings = useSettingsStore(s => s.settings);
  const settingsLoaded = useSettingsStore(s => s.isLoaded);
  const pastSessions = useHistoryStore(s => s.sessions);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [durationMin, setDurationMin] = useState<number>(settings.defaultDurationMin);
  const [seasonYear, setSeasonYear] = useState<number>(settings.defaultSeasonYear);
  const [strategyNote, setStrategyNote] = useState<string>('');
  const [parcFerme, setParcFerme] = useState<boolean>(settings.parcFermeDefault);
  const [penaltyTriggers, setPenaltyTriggers] = useState<PenaltyTrigger[]>(settings.defaultPenaltyTriggers);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!settingsLoaded || setupSession) {
      return;
    }

    setDurationMin(settings.defaultDurationMin);
  }, [
    settings.defaultDurationMin,
    settingsLoaded,
    setupSession,
  ]);

  useEffect(() => {
    if (!settingsLoaded || setupSession) {
      return;
    }

    setSeasonYear(settings.defaultSeasonYear);
  }, [settings.defaultSeasonYear, settingsLoaded, setupSession]);

  useEffect(() => {
    if (!settingsLoaded || setupSession) {
      return;
    }

    setParcFerme(settings.parcFermeDefault);
  }, [settings.parcFermeDefault, settingsLoaded, setupSession]);

  useEffect(() => {
    if (!settingsLoaded || setupSession) {
      return;
    }

    setPenaltyTriggers(settings.defaultPenaltyTriggers);
  }, [settings.defaultPenaltyTriggers, settingsLoaded, setupSession]);

  useEffect(() => {
    if (!setupSession) {
      return;
    }

    setSelectedTrackId(setupSession.selectedTrackId);
    setDurationMin(Math.max(5, Math.round(setupSession.targetDurationSec / 60)));
    setSeasonYear(setupSession.seasonYear);
    setStrategyNote(setupSession.strategyNote);
    setParcFerme(setupSession.parcFermeEnabled);
    setPenaltyTriggers(setupSession.enabledPenaltyTriggers);
  }, [setupSession]);

  const togglePenalty = (trigger: PenaltyTrigger) => {
    setPenaltyTriggers(prev => 
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const handleStartRace = () => {
    if (!selectedTrackId) return;

    createSession({
      trackId: selectedTrackId,
      seasonYear,
      durationSec: durationMin * 60,
      strategyNote,
      parcFerme,
      penaltyTriggers,
    });
    
    startSession();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.appTitle}>Deep Work F1</h1>
        <button
          type="button"
          className={styles.settingsButton}
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️ Settings
        </button>
      </header>

      <div className={styles.content}>
        <TrackSelector 
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
        />

        <div className={styles.row}>
          <DurationPicker 
            durationMin={durationMin}
            onChange={setDurationMin}
          />

          <div className={styles.seasonPicker}>
            <label className={styles.label}>Season</label>
            <select 
              className={styles.select}
              value={seasonYear}
              onChange={(e) => setSeasonYear(Number(e.target.value))}
            >
              {SEASONS.map(s => (
                <option key={s.seasonYear} value={s.seasonYear}>
                  {s.seasonYear} Regulations
                </option>
              ))}
            </select>
          </div>
        </div>

        <StrategyNote 
          note={strategyNote}
          onChangeNote={setStrategyNote}
          parcFerme={parcFerme}
          onChangeParcFerme={setParcFerme}
        />

        <div className={styles.penaltySection}>
          <label className={styles.label}>Penalty Triggers</label>
          <div className={styles.toggles}>
            {(['pause', 'unfocus', 'idle'] as PenaltyTrigger[]).map(trigger => (
              <label key={trigger} className={styles.toggleLabel}>
                <input 
                  type="checkbox"
                  className={styles.checkbox}
                  checked={penaltyTriggers.includes(trigger)}
                  onChange={() => togglePenalty(trigger)}
                />
                <span className={styles.toggleText}>
                  {trigger === 'unfocus' ? 'App Unfocus' : trigger.charAt(0).toUpperCase() + trigger.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <motion.button
          className={styles.startButton}
          disabled={!selectedTrackId}
          onClick={handleStartRace}
          whileHover={selectedTrackId ? { scale: 1.01, y: -1 } : undefined}
          whileTap={selectedTrackId ? { scale: 0.99, y: 0 } : undefined}
        >
          🏁 START RACE
        </motion.button>

        {pastSessions.length > 0 && (
          <div className={styles.recentSessions}>
            <h3 className={styles.recentTitle}>Recent Sessions</h3>
            <div className={styles.recentList}>
              {pastSessions.slice(0, 3).map(session => (
                <motion.div
                  key={session.id}
                  className={styles.recentCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  whileHover={{ y: -2 }}
                >
                  <div className={styles.recentDate}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                  <div className={styles.recentStats}>
                    {formatMMSS(session.effectiveProgressSec)} / {formatMMSS(session.targetDurationSec)}
                  </div>
                  <div className={styles.recentState}>
                    {session.state === 'completed' ? '🏁 Completed' : '🚫 Abandoned'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SettingsScreen isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
