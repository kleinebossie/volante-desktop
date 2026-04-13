# Deep Work F1 project idea

Many free and paid deep work productivity apps already exist, some plain and some with some unique feature that makes them stand out. This project aims to be the latter, a product that is not only useful but also unique in its approach to deep work productivity.

This app will be Formula 1 themed, with various features resembling the sport. For example, when setting a timer, you can choose a certain _race track_ on the 2026 calendar. The _track map_ will then show up on screen, with an F1 car going across the track for the duration of the deep work timer. This is supposed to motivate the user to keep going and not give up.

Another feature could be a _strategy_ tab, where you specify what you will get done during the deep work timer. This is a slightly more unique version of the notebook feature that most apps already have.

This can easily be expanded and updated as the F1 regulations change. For example, the 2026 regulations allow for a _boost button_ and an _overtake button_ to be pressed. THis could be incorporated into the app by adding the buttons, which when pressed will speed the timer up two times. The user will be expected to work twice as hard during the boost/overtake phase.

The product will come in the form of a desktop app, and has to be cross-platform. It will be made by an unknowledgeable solo developer/vibe coder. This means that the architecture has to be super simple, minimal and safe. MVP time is not strictly defined so there is no rush.

This is my idea of a possible tech stack:

## System Architecture & Tech Stack

#### Use immediately

- IDE / AI Assistant: Visual Studio Code + GitHub Copilot
- Desktop Framework: Tauri v2
- UI Framework: React
- Frontend Language: TypeScript
- Frontend Build Tool: Vite

#### Use when needed

- Styling: Tailwind CSS
- UI/State Animations: Framer Motion

#### Defer until clearly needed

- Complex/3D Graphics: React Three Fiber (Three.js)
- Backend Language: Rust (for OS-level operations, system tray, hotkeys)

## Product Core

1. **Pre-race setup**
   - Pick track
   - Set session duration
   - Add short strategy note (with tasks or planning)
2. **Race session**
   - Car drives as many laps as needed to complete the session timer
   - Regulation mechanics available:
     - **Boost**: Temporary 2x timer pace for _N_ seconds with a cooldown
     - **Overtake**: One-time sprint window with stricter penalty if interrupted
     - **Stint**: Session segmented into phases (opening/mid/final push)
     - **Stewards**: Apply soft penalties for pauses/distractions
     - **Parc Ferme** Lock strategy note after session starts (optional)

## Product Architecture

- **UI Layer**: Screens and controls
- **Session Engine**: Timer + Race state machine
- **Regulations Engine**: Reusable rules and cooldowns
  - The regulations will either take a more _mechanical_ and _gamified_ approach (more impact on session) or a _cosmetic_ approach (less impact on session, more just visuals)
  - Ideally this can be specified in settings
- **Track renderer**: Path + car position interpolation
- **Persistance**: Local-first storage (sessions, settings, tracks)
- **Customizability**: The user should have as much freedom as possible to get whatever they might want from the app. This is key.
