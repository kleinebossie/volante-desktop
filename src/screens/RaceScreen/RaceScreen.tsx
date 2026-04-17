import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timer } from '../../components/Timer/Timer';
import { LapCounter } from '../../components/LapCounter/LapCounter';
import { RegulationButton } from '../../components/RegulationButton/RegulationButton';
import { PenaltyIndicator } from '../../components/PenaltyIndicator/PenaltyIndicator';
import { TrackRenderer } from '../../components/TrackRenderer/TrackRenderer';
import { getPenaltyAmount, isPenaltyEnabled } from '../../engine/penaltyDetector';
import {
  calculateInterruptionPenalty,
  getRegulationConfig,
} from '../../engine/regulationsEngine';
import { usePenaltyDetection } from '../../hooks/usePenaltyDetection';
import { useRegulations } from '../../hooks/useRegulations';
import { useTimer } from '../../hooks/useTimer';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTrackById } from '../../data/tracks';
import {
  calculateLapInfo,
  calculateOverallProgress,
  calculateRemainingSec,
} from '../../engine/progressCalculator';
import styles from './RaceScreen.module.css';

export function RaceScreen() {
  useTimer();
  usePenaltyDetection();

  const session = useSessionStore((s) => s.session);
  const pauseSession = useSessionStore((s) => s.pauseSession);
  const resumeSession = useSessionStore((s) => s.resumeSession);
  const abandonSession = useSessionStore((s) => s.abandonSession);
  const applyPenalty = useSessionStore((s) => s.applyPenalty);
  const deactivateRegulation = useSessionStore((s) => s.deactivateRegulation);
  const addEvent = useSessionStore((s) => s.addEvent);
  const settings = useSettingsStore((s) => s.settings);
  const { ruleset, regulations, activate } = useRegulations();
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  if (!session) {
    return (
      <div className={styles.emptyState}>
        No active session. Start a race from the setup screen first.
      </div>
    );
  }

  const track = getTrackById(session.selectedTrackId);

  if (!track || !ruleset) {
    return (
      <div className={styles.emptyState}>
        Session configuration is incomplete. Please go back to setup and start again.
      </div>
    );
  }

  const lapInfo = calculateLapInfo(
    session.effectiveProgressSec,
    session.targetDurationSec,
    track.lapTimeFactor
  );
  const overallProgress = calculateOverallProgress(
    session.effectiveProgressSec,
    session.targetDurationSec
  );
  const remainingSec = calculateRemainingSec(
    session.effectiveProgressSec,
    session.targetDurationSec
  );
  const latestPenaltyEventId = useMemo(() => {
    for (let i = session.events.length - 1; i >= 0; i -= 1) {
      const event = session.events[i];
      if (event.type === 'penalty_applied' || event.type === 'regulation_interrupted') {
        return event.id;
      }
    }
    return null;
  }, [session.events]);
  const [showPenaltyFlash, setShowPenaltyFlash] = useState(false);

  useEffect(() => {
    if (!latestPenaltyEventId) return;

    setShowPenaltyFlash(true);
    const timeoutId = window.setTimeout(() => {
      setShowPenaltyFlash(false);
    }, 520);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [latestPenaltyEventId]);

  const handlePauseResume = () => {
    if (session.state === 'running') {
      if (isPenaltyEnabled('pause', session.enabledPenaltyTriggers)) {
        let penaltySec = getPenaltyAmount('pause', ruleset.penaltyConfig);

        if (session.activeRegulation) {
          const regulationConfig = getRegulationConfig(session.activeRegulation, ruleset);
          if (regulationConfig) {
            penaltySec = calculateInterruptionPenalty(
              penaltySec,
              regulationConfig.interruptionPenaltyMultiplier
            );

            addEvent({
              type: 'regulation_interrupted',
              metadata: {
                regulationType: session.activeRegulation,
                trigger: 'pause',
                penaltySec,
              },
            });
            deactivateRegulation();
          }
        }

        applyPenalty('pause', penaltySec);
      }

      pauseSession();
      return;
    }

    if (session.state === 'paused') {
      resumeSession();
    }
  };

  const handleConfirmAbandon = () => {
    setShowAbandonConfirm(false);
    abandonSession();
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        {settings.showLapCounter ? (
          <LapCounter currentLap={lapInfo.currentLap} totalLaps={lapInfo.totalLaps} />
        ) : (
          <span className={styles.topSpacer} />
        )}

        <div className={styles.progressWrap}>
          <span className={styles.progressLabel}>Progress</span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${overallProgress})` }}
            />
          </div>
          <span className={styles.progressValue}>{Math.round(overallProgress * 100)}%</span>
        </div>
      </header>

      <section className={styles.trackPanel}>
        <TrackRenderer
          pathD={track.svgPathD}
          lapProgress={lapInfo.lapProgress}
          accentColor={track.accentColor}
        />

        <AnimatePresence>
          {showPenaltyFlash ? (
            <motion.div
              className={styles.penaltyFlash}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.42, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.52, ease: 'easeOut' }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {session.state === 'paused' ? (
            <motion.div
              className={styles.pauseOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className={styles.pauseTitle}>Session Paused</div>
              <div className={styles.pauseHint}>Take a breath, then resume your race.</div>
              <button
                type="button"
                className={styles.resumeOverlayButton}
                onClick={handlePauseResume}
              >
                ▶ Resume Race
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <Timer remainingSec={remainingSec} isPaused={session.state === 'paused'} />

      <section className={styles.regulationRow}>
        {regulations.map((regulation) => {
          const buttonState =
            session.state !== 'running' && regulation.state === 'available'
              ? 'locked'
              : regulation.state;

          return (
            <RegulationButton
              key={regulation.type}
              icon={regulation.config.icon}
              label={regulation.config.label}
              accentColor={regulation.config.accentColor}
              state={buttonState}
              cooldownProgress={regulation.cooldownProgress}
              cooldownRemainingSec={regulation.cooldownRemainingSec}
              activeProgress={regulation.activeProgress}
              activeRemainingSec={regulation.activeRemainingSec}
              remainingUses={regulation.remainingUses}
              onActivate={() => activate(regulation.type)}
            />
          );
        })}

        <button
          type="button"
          className={styles.pauseButton}
          onClick={handlePauseResume}
        >
          {session.state === 'paused' ? '▶ Resume' : '⏸ Pause'}
        </button>
      </section>

      <div className={styles.footerRow}>
        <div className={styles.strategy}>
          Strategy: {session.strategyNote || 'No strategy note set.'}
        </div>
        <button
          type="button"
          className={styles.abandonButton}
          onClick={() => setShowAbandonConfirm(true)}
        >
          Abandon
        </button>
      </div>

      {settings.showPenaltyFeed ? (
        <PenaltyIndicator events={session.events} maxItems={3} />
      ) : null}

      <AnimatePresence>
        {showAbandonConfirm ? (
          <motion.div
            className={styles.confirmBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              className={styles.confirmDialog}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className={styles.confirmTitle}>Abandon this race?</div>
              <div className={styles.confirmBody}>
                Your current session progress will be marked as abandoned.
              </div>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setShowAbandonConfirm(false)}
                >
                  Keep Racing
                </button>
                <button
                  type="button"
                  className={styles.confirmDanger}
                  onClick={handleConfirmAbandon}
                >
                  Abandon
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
