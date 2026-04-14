/**
 * App.tsx — Root React component.
 *
 * Phase 3 responsibility:
 *   On first render, load user settings and session history from disk.
 *   The actual view router (Setup / Race / Summary screens) is added in Phase 10.
 *
 * Phase 0 placeholder UI is kept below so the app still shows something.
 */

import { useEffect } from "react";
import "./App.css";
import { useSettingsStore } from "./stores/settingsStore";
import { useHistoryStore } from "./stores/historyStore";

function App() {
  // -------------------------------------------------------------------------
  // Step 3.4 — Load persisted data on app start.
  // Both calls are fire-and-forget async operations. They read from disk and
  // update their respective Zustand stores once the data arrives.
  // Empty dependency array [] means this runs exactly once, when the app opens.
  // -------------------------------------------------------------------------
  useEffect(() => {
    useSettingsStore.getState().loadSettings();
    useHistoryStore.getState().loadHistory();
  }, []);

  // -------------------------------------------------------------------------
  // Phase 0 placeholder UI — replaced in Phase 10 with the real view router.
  // -------------------------------------------------------------------------
  return (
    <div className="app-shell">
      <div className="app-loading">
        <div className="app-logo">🏎</div>
        <h1 className="app-title">Deep Work F1</h1>
        <p className="app-subtitle">Focus. Race. Repeat.</p>
      </div>
    </div>
  );
}

export default App;
