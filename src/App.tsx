/**
 * App.tsx — Root React component.
 *
 * Phase 3 responsibility:
 *   On first render, load user settings and session history from disk.
 *
 * Phase 5 Step 5.6 — HARDCODED TESTING:
 *   Temporarily renders TrackRenderer with an animated lapProgress
 *   value that cycles 0 → 1 over 10 seconds, then wraps back to 0.
 *   This verifies car movement before wiring to real session state.
 *
 *   Remove this test UI in Phase 10 when the real view router is built.
 *
 * The actual view router (Setup / Race / Summary screens) is added in Phase 10.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import "./App.css";
import { useSettingsStore } from "./stores/settingsStore";
import { useHistoryStore } from "./stores/historyStore";
import { TrackRenderer } from "./components/TrackRenderer/TrackRenderer";

// ─────────────────────────────────────────────────────────────────────────────
// Step 5.6 — Pick a track path to test with.
// We use Silverstone — a well-known track shape — as the visual reference.
// Import its SVG path D from the generated track paths file.
// ─────────────────────────────────────────────────────────────────────────────
import { TRACK_PATHS } from "./data/tracks/trackPaths";

/**
 * Silverstone layout key in the trackPaths map.
 * Check trackCatalog.ts for layoutId values.
 */
const TEST_TRACK_LAYOUT_ID = "silverstone-8" as const;
const TEST_ACCENT_COLOR = "#00d26a"; // green — good contrast on dark background

/** How long one full lap takes in the test animation (milliseconds) */
const TEST_LAP_DURATION_MS = 10_000; // 10 seconds per lap

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  // ── Persistence loading (Phase 3.4) ───────────────────────────────────────
  useEffect(() => {
    useSettingsStore.getState().loadSettings();
    useHistoryStore.getState().loadHistory();
  }, []);

  // ── Phase 5.6: Animated lapProgress ──────────────────────────────────────
  /**
   * `lapProgress` is a number from 0.0 to 1.0.
   * 0.0 = car is at the start/finish line
   * 1.0 = car has completed one full lap (and we wrap back to 0)
   *
   * We animate this using requestAnimationFrame so it updates at ~60fps,
   * giving the car smooth movement around the track.
   */
  const [lapProgress, setLapProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback((timestamp: number) => {
    // Record the start time on the first frame
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    // How many milliseconds have elapsed since we started?
    const elapsed = timestamp - startTimeRef.current;

    // Convert elapsed time into a 0–1 progress fraction that loops.
    // `% TEST_LAP_DURATION_MS` makes it cycle: 0ms→10000ms, then wraps
    const cycleMs = elapsed % TEST_LAP_DURATION_MS;
    const progress = cycleMs / TEST_LAP_DURATION_MS;

    setLapProgress(progress);

    // Schedule the next frame
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Start the animation loop
    rafRef.current = requestAnimationFrame(animate);

    // Cleanup: cancel the animation frame when the component unmounts
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  // ── Resolve test track path ───────────────────────────────────────────────
  const testPathD = TRACK_PATHS[TEST_TRACK_LAYOUT_ID];

  if (!testPathD) {
    return (
      <div className="app-shell">
        <div className="app-loading">
          <div className="app-logo">⚠️</div>
          <h1 className="app-title">Track Not Found</h1>
          <p className="app-subtitle">
            Layout ID &quot;{TEST_TRACK_LAYOUT_ID}&quot; not in TRACK_PATHS.
            Check trackPaths.ts for valid keys.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render — Phase 5.6 test UI
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Page title */}
      <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
        <h1
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Phase 5 · Track Renderer Test
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            marginTop: "4px",
          }}
        >
          Silverstone · lap {(lapProgress * 100).toFixed(1)}% · 10s/lap
        </p>
      </div>

      {/* Track renderer — fills available space */}
      <div
        style={{
          flex: 1,
          maxWidth: "560px",
          maxHeight: "560px",
          margin: "0 auto",
          padding: "16px",
          width: "100%",
        }}
      >
        <TrackRenderer
          pathD={testPathD}
          lapProgress={lapProgress}
          accentColor={TEST_ACCENT_COLOR}
          showDebugLabel={true}
        />
      </div>

      {/* Footer note */}
      <div
        style={{
          textAlign: "center",
          padding: "8px 0 16px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--color-text-secondary)",
        }}
      >
        Car animates from 0% → 100% in 10 s, then resets.
        ✅ If the red car moves smoothly around the circuit, Phase 5 is complete.
      </div>
    </div>
  );
}

export default App;
