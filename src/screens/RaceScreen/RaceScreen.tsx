import { Timer } from '../../components/Timer/Timer';
import { LapCounter } from '../../components/LapCounter/LapCounter';
import { RegulationButton } from '../../components/RegulationButton/RegulationButton';
import { PenaltyIndicator } from '../../components/PenaltyIndicator/PenaltyIndicator';
import { TrackRenderer } from '../../components/TrackRenderer/TrackRenderer';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTrackById } from '../../data/tracks';
import { getSeasonByYear } from '../../data/seasons';
import {
  calculateLapInfo,
  calculateOverallProgress,
  calculateRemainingSec,
} from '../../engine/progressCalculator';
import {
  getRegulationState,
  getCooldownProgress,
  getCooldownRemainingSec,
  getActiveRegulationProgress,
  getActiveRegulationRemainingSec,
  getRemainingUses,
} from '../../engine/regulationsEngine';
import styles from './RaceScreen.module.css';

export function RaceScreen() {
  const session = useSessionStore((s) => s.session);
  const settings = useSettingsStore((s) => s.settings);

  if (!session) {
    return (
      <div className={styles.emptyState}>
        No active session. Start a race from the setup screen first.
      </div>
    );
  }

  const track = getTrackById(session.selectedTrackId);
  const ruleset = getSeasonByYear(session.seasonYear);

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
      </section>

      <Timer remainingSec={remainingSec} isPaused={session.state === 'paused'} />

      <section className={styles.regulationRow}>
        {ruleset.regulations.map((regulation) => {
          const state = getRegulationState(regulation.type, session, ruleset);
          const cooldownProgress = getCooldownProgress(regulation.type, session, regulation);
          const cooldownRemainingSec = getCooldownRemainingSec(regulation.type, session);
          const activeProgress =
            session.activeRegulation === regulation.type
              ? getActiveRegulationProgress(session, regulation)
              : 0;
          const activeRemainingSec =
            session.activeRegulation === regulation.type
              ? getActiveRegulationRemainingSec(session)
              : 0;
          const remainingUses = getRemainingUses(regulation.type, session, regulation);

          return (
            <RegulationButton
              key={regulation.type}
              icon={regulation.icon}
              label={regulation.label}
              accentColor={regulation.accentColor}
              state={state}
              cooldownProgress={cooldownProgress}
              cooldownRemainingSec={cooldownRemainingSec}
              activeProgress={activeProgress}
              activeRemainingSec={activeRemainingSec}
              remainingUses={remainingUses}
              onActivate={() => undefined}
            />
          );
        })}
      </section>

      <div className={styles.footerRow}>
        <div className={styles.strategy}>
          Strategy: {session.strategyNote || 'No strategy note set.'}
        </div>
        <button type="button" className={styles.abandonButton} disabled>
          Abandon
        </button>
      </div>

      {settings.showPenaltyFeed ? (
        <PenaltyIndicator events={session.events} maxItems={3} />
      ) : null}
    </div>
  );
}
