import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { SetupScreen } from './screens/SetupScreen/SetupScreen';
import { RaceScreen } from './screens/RaceScreen/RaceScreen';
import { SummaryScreen } from './screens/SummaryScreen/SummaryScreen';
import { useHistoryStore } from './stores/historyStore';
import { useSessionStore } from './stores/sessionStore';
import { useSettingsStore } from './stores/settingsStore';

type AppView = 'setup' | 'race' | 'summary';

const SCREEN_TRANSITION = {
  initial: { opacity: 0, y: 10, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.995 },
};

const SCREEN_TRANSITION_CONFIG = {
  duration: 0.24,
  ease: 'easeOut' as const,
};

function getCurrentView(sessionState: ReturnType<typeof useSessionStore.getState>['session']): AppView {
  if (!sessionState || sessionState.state === 'setup') {
    return 'setup';
  }

  if (sessionState.state === 'running' || sessionState.state === 'paused') {
    return 'race';
  }

  return 'summary';
}

function App() {
  const session = useSessionStore((s) => s.session);

  useEffect(() => {
    void useSettingsStore.getState().loadSettings();
    void useHistoryStore.getState().loadHistory();
  }, []);

  const currentView = getCurrentView(session);

  return (
    <div className="appShell">
      <AnimatePresence mode="wait" initial={false}>
        {currentView === 'setup' ? (
          <motion.main
            key="setup"
            className="appView"
            initial={SCREEN_TRANSITION.initial}
            animate={SCREEN_TRANSITION.animate}
            exit={SCREEN_TRANSITION.exit}
            transition={SCREEN_TRANSITION_CONFIG}
          >
            <SetupScreen />
          </motion.main>
        ) : null}

        {currentView === 'race' ? (
          <motion.main
            key="race"
            className="appView"
            initial={SCREEN_TRANSITION.initial}
            animate={SCREEN_TRANSITION.animate}
            exit={SCREEN_TRANSITION.exit}
            transition={SCREEN_TRANSITION_CONFIG}
          >
            <RaceScreen />
          </motion.main>
        ) : null}

        {currentView === 'summary' ? (
          <motion.main
            key="summary"
            className="appView"
            initial={SCREEN_TRANSITION.initial}
            animate={SCREEN_TRANSITION.animate}
            exit={SCREEN_TRANSITION.exit}
            transition={SCREEN_TRANSITION_CONFIG}
          >
            <SummaryScreen />
          </motion.main>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default App;
