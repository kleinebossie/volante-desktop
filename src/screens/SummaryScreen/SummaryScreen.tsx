import { useEffect, useMemo } from 'react';
import { SessionSummaryCard } from '../../components/SessionSummaryCard/SessionSummaryCard';
import { getSeasonByYear } from '../../data/seasons';
import { getTrackById } from '../../data/tracks';
import { calculateLapInfo } from '../../engine/progressCalculator';
import { useHistoryStore } from '../../stores/historyStore';
import { useSessionStore } from '../../stores/sessionStore';
import type { RegulationType } from '../../types/regulations';
import type { SessionEvent } from '../../types/session';
import { formatMMSS, formatPenalty } from '../../utils/formatTime';
import styles from './SummaryScreen.module.css';

interface RegulationUsageItem {
  type: RegulationType;
  label: string;
  icon: string;
  paceMultiplier: number;
  useCount: number;
  activeSec: number;
}

interface PenaltyTimelineItem {
  eventId: string;
  atSec: number;
  label: string;
  penaltySec: number;
}

function isRegulationType(value: unknown): value is RegulationType {
  return value === 'boost' || value === 'overtake' || value === 'drs';
}

function getMetadataString(event: SessionEvent, key: string): string | null {
  const value = event.metadata[key];
  return typeof value === 'string' ? value : null;
}

function getMetadataNumber(event: SessionEvent, key: string): number | null {
  const value = event.metadata[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function extractRegulationType(event: SessionEvent): RegulationType | null {
  const raw = getMetadataString(event, 'regulationType');
  return isRegulationType(raw) ? raw : null;
}

function titleCase(value: string): string {
  if (value.length === 0) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

export function SummaryScreen() {
  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clearSession);
  const createSession = useSessionStore((s) => s.createSession);
  const addSession = useHistoryStore((s) => s.addSession);

  const finalizedSession =
    session && (session.state === 'completed' || session.state === 'abandoned')
      ? session
      : null;
  const track = finalizedSession ? getTrackById(finalizedSession.selectedTrackId) : undefined;
  const ruleset = finalizedSession ? getSeasonByYear(finalizedSession.seasonYear) : undefined;

  useEffect(() => {
    if (!finalizedSession) return;

    void addSession(finalizedSession);
  }, [addSession, finalizedSession]);

  const lapInfo = useMemo(() => {
    if (!finalizedSession || !track) {
      return { currentLap: 0, totalLaps: 0, lapProgress: 0 };
    }

    return calculateLapInfo(
      finalizedSession.effectiveProgressSec,
      finalizedSession.targetDurationSec,
      track.lapTimeFactor
    );
  }, [finalizedSession, track]);

  const regulationUsage = useMemo<RegulationUsageItem[]>(() => {
    if (!finalizedSession || !ruleset) {
      return [];
    }

    const usageMap = new Map<RegulationType, { useCount: number; activeSec: number }>();
    const activeStart = new Map<RegulationType, number>();

    ruleset.regulations.forEach((regulation) => {
      usageMap.set(regulation.type, { useCount: 0, activeSec: 0 });
    });

    const timeline = [...finalizedSession.events].sort((a, b) => a.timestamp - b.timestamp);
    const sessionEndTime = finalizedSession.completedAt ?? Date.now();

    for (const event of timeline) {
      if (event.type === 'regulation_activate') {
        const type = extractRegulationType(event);
        if (!type || !usageMap.has(type)) continue;

        const current = usageMap.get(type);
        if (!current) continue;

        current.useCount += 1;
        activeStart.set(type, event.timestamp);
      }

      if (event.type === 'regulation_deactivate' || event.type === 'regulation_interrupted') {
        const type = extractRegulationType(event);
        if (!type || !usageMap.has(type)) continue;

        const startedAt = activeStart.get(type);
        const current = usageMap.get(type);
        if (startedAt === undefined || !current) continue;

        current.activeSec += Math.max(0, (event.timestamp - startedAt) / 1000);
        activeStart.delete(type);
      }
    }

    // If a session ends while a regulation is still active, count time until session end.
    activeStart.forEach((startedAt, type) => {
      const current = usageMap.get(type);
      if (!current) return;
      current.activeSec += Math.max(0, (sessionEndTime - startedAt) / 1000);
    });

    return ruleset.regulations.map((regulation) => {
      const usage = usageMap.get(regulation.type);
      return {
        type: regulation.type,
        label: regulation.label,
        icon: regulation.icon,
        paceMultiplier: regulation.paceMultiplier,
        useCount: usage?.useCount ?? 0,
        activeSec: usage?.activeSec ?? 0,
      };
    });
  }, [finalizedSession, ruleset]);

  const penaltyTimeline = useMemo<PenaltyTimelineItem[]>(() => {
    if (!finalizedSession || !ruleset) {
      return [];
    }

    const items: PenaltyTimelineItem[] = [];

    const timeline = [...finalizedSession.events].sort((a, b) => a.timestamp - b.timestamp);

    for (const event of timeline) {
      if (event.type === 'penalty_applied') {
        const penaltySec = getMetadataNumber(event, 'penaltySec') ?? 0;
        const trigger = getMetadataString(event, 'trigger') ?? 'unknown';

        items.push({
          eventId: event.id,
          atSec: Math.max(0, (event.timestamp - finalizedSession.createdAt) / 1000),
          label: `${titleCase(trigger)} penalty`,
          penaltySec,
        });
      }

      if (event.type === 'regulation_interrupted') {
        const type = extractRegulationType(event);
        const penaltySec = getMetadataNumber(event, 'penaltySec') ?? 0;
        const rule = ruleset.regulations.find((regulation) => regulation.type === type);
        const label = rule ? `${rule.label} interrupted` : 'Regulation interrupted';

        items.push({
          eventId: event.id,
          atSec: Math.max(0, (event.timestamp - finalizedSession.createdAt) / 1000),
          label,
          penaltySec,
        });
      }
    }

    return items;
  }, [finalizedSession, ruleset]);

  const strategyNotes = useMemo(() => {
    if (!finalizedSession) {
      return [];
    }

    return finalizedSession.strategyNote
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [finalizedSession]);

  const sessionRows = finalizedSession ? [
    {
      label: 'Duration',
      value: `${formatMMSS(finalizedSession.targetDurationSec)} target / ${formatMMSS(finalizedSession.elapsedWallTimeSec)} wall`,
    },
    {
      label: 'Laps',
      value: `${lapInfo.currentLap}/${lapInfo.totalLaps} completed`,
      tone: 'success' as const,
    },
    {
      label: 'Effective',
      value: `${formatMMSS(finalizedSession.effectiveProgressSec)} after pace modifiers`,
    },
    {
      label: 'Penalties',
      value: `${formatPenalty(-finalizedSession.totalPenaltySec)} total`,
      tone: finalizedSession.totalPenaltySec > 0 ? ('danger' as const) : ('default' as const),
    },
  ] : [];

  const handleBackToSetup = () => {
    clearSession();
  };

  const handleRaceAgain = () => {
    if (!finalizedSession) return;

    createSession({
      trackId: finalizedSession.selectedTrackId,
      seasonYear: finalizedSession.seasonYear,
      durationSec: finalizedSession.targetDurationSec,
      strategyNote: finalizedSession.strategyNote,
      parcFerme: finalizedSession.parcFermeEnabled,
      penaltyTriggers: finalizedSession.enabledPenaltyTriggers,
    });
  };

  if (!session) {
    return (
      <div className={styles.emptyState}>
        No finished session found. Start a race first.
      </div>
    );
  }

  if (!finalizedSession) {
    return (
      <div className={styles.emptyState}>
        Summary is available after a session is completed or abandoned.
      </div>
    );
  }

  if (!track || !ruleset) {
    return (
      <div className={styles.emptyState}>
        Could not load track or season data for this session.
      </div>
    );
  }

  const statusLabel = finalizedSession.state === 'completed' ? 'Race Complete' : 'Race Abandoned';
  const statusIcon = finalizedSession.state === 'completed' ? '🏁' : '🚫';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.statusIcon}>{statusIcon}</div>
        <h1 className={styles.title}>{statusLabel}</h1>
        <p className={styles.subtitle}>
          {track.flagEmoji} {track.name} · {ruleset.label}
        </p>
      </header>

      <SessionSummaryCard title="Session Overview" rows={sessionRows} />

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Regulation Usage</h2>
        <div className={styles.list}>
          {regulationUsage.map((entry) => (
            <div key={entry.type} className={styles.listItem}>
              <div className={styles.listItemLabel}>
                <span className={styles.listItemIcon}>{entry.icon}</span>
                <span>{entry.label}</span>
              </div>
              <div className={styles.listItemValue}>
                used {entry.useCount}x · total {formatMMSS(entry.activeSec)} at {entry.paceMultiplier.toFixed(1)}x
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Penalty Timeline</h2>
        <div className={styles.list}>
          {penaltyTimeline.length > 0 ? (
            penaltyTimeline.map((entry) => (
              <div key={entry.eventId} className={styles.listItem}>
                <div className={styles.listItemLabel}>{formatMMSS(entry.atSec)} · {entry.label}</div>
                <div className={`${styles.listItemValue} ${styles.penaltyValue}`}>
                  {formatPenalty(-entry.penaltySec)}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyHint}>No penalties during this session. Clean race.</div>
          )}
        </div>
      </section>

      <section className={styles.strategyPanel}>
        <h2 className={styles.panelTitle}>Strategy</h2>
        {strategyNotes.length > 0 ? (
          <ul className={styles.strategyList}>
            {strategyNotes.map((item, index) => (
              <li key={`${item}-${index}`} className={styles.strategyItem}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.strategyText}>No strategy note was set.</p>
        )}
      </section>

      <footer className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={handleBackToSetup}>
          Back to Setup
        </button>
        <button type="button" className={styles.primaryButton} onClick={handleRaceAgain}>
          Race Again
        </button>
      </footer>
    </div>
  );
}
