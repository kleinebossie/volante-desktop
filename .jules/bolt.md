## 2024-06-10 - React Performance
**Learning:** React re-renders components continuously if connected to high-frequency state updates like a timer or track progress. The 60 FPS update causes parent components (like `RaceScreen`) to re-render, subsequently cascading into children.
**Action:** Use `React.memo` on small, static presentation components (`Timer`, `LapCounter`) to prevent them from re-rendering unless their specific props change, significantly reducing unnecessary render work for 60fps loops.
