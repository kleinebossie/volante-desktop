# Volante — Roadmap (Post-v0.1)

> **Purpose of this file**: This file tracks the backlog of ideas, features, and improvements planned for Volante after the completion of v0.1. 
> 
> **Workflow Rule**: Pick ONE feature from this list, create a new git branch (`git checkout -b feature/[name]`), and have the AI implement it using the Day 2 prompt template in `PROMPT.md`.

---

## 🎯 High Priority (Next Up)

These features add significant value with relatively low architectural risk.

- [ ] **Sound Effects & Audio Cues**
  - Use Tauri's audio capabilities or HTML5 Audio.
  - Sounds for: Start session, Regulation activated, Cooldown complete, Penalty triggered, Session complete.
  - Needs a "Mute Sounds" toggle in the Settings screen.
- [ ] **System Tray Integration**
  - Allow the app to be minimized to the system tray.
  - Show remaining time in the tray tooltip or menu.
  - Quick actions from tray: Pause/Resume.
- [ ] **Global Hotkeys**
  - Register OS-level shortcuts to activate Boost or Overtake without tabbing back into the app.

## 🟡 Medium Priority

Features that require minor architectural extensions or new screens.

- [ ] **Analytics & Trends Dashboard**
  - Create a new "Stats" screen reading from `historyStore.ts`.
  - Show total deep work hours, most used regulations, most common penalties, and most frequent track.
  - Include a simple bar chart of the last 7 days.
- [ ] **Custom Tracks (User Imports)**
  - Allow users to drop their own SVG files into a specific folder to use as custom tracks.
  - Update `trackCatalog.ts` logic to load dynamically from the filesystem alongside the hardcoded tracks.
- [ ] **Stint Segmentation**
  - Divide a 60-minute session into three 20-minute "stints" (Opening, Mid, Final Push).
  - Show visual markers on the timer and give a notification when a new stint begins.

## 🟢 Low Priority / Nice-to-Have

Cosmetic or complex features.

- [ ] **Score/Ranking System**
  - Compute a "Driver Rating" based on sessions completed without penalties and successful use of Overtakes.
- [ ] **3D Track Renderer Experiment**
  - Replace the SVG `TrackRenderer.tsx` with a `React Three Fiber` canvas. 
  - Render a simple 3D ribbon for the track and a low-poly 3D car model.
- [ ] **Ghost Car (Personal Best)**
  - During a session on a familiar track, render a semi-transparent "ghost car" representing your average pace from past sessions on that track.

---

## 🏗️ Completed Features (v0.2+)

*(Move completed features here once merged into `main`)*

- _None yet_
