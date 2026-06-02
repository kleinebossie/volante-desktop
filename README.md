# 🏎️ Volante

Volante is a cross-platform desktop productivity app that uses Formula 1 race mechanics to make deep-work focus sessions more engaging and harder to abandon.

Instead of a boring countdown timer, you pick a real F1 circuit. Your timer becomes a "race", and a car physically drives around the track map for the duration of your session.

![Volante](https://via.placeholder.com/800x450.png?text=Volante+Screenshot) *(Replace with actual screenshot)*

## ✨ Features

- **24 Real F1 Circuits:** Choose from the full 2026 calendar (Bahrain, Monaco, Silverstone, etc.).
- **Live Track Visualization:** Watch your car progress around the actual SVG path of the track as your timer ticks down.
- **Race Regulations:** Use "Boost", "Overtake", and "DRS" buttons. These speed up your timer, but demand proportionally harder effort from you.
- **Strict Penalties:** The "Stewards" are watching. Pausing the timer, alt-tabbing to other apps, or going idle will result in time penalties that reduce your effective progress.
- **Strategy Notes:** Set a "Parc Fermé" locked intention before you start, so you know exactly what you are focusing on.
- **Local First:** 100% offline. All session history and settings are saved locally on your machine. Zero tracking.

## 📦 Installation

Head over to the [Releases page](../../releases/latest) to download the installer for your operating system:

- **Windows**: Download the `.msi` or `.exe` installer.
- **macOS**: Download the `.dmg` or `.app.tar.gz`.
- **Linux**: Download the `.AppImage` or `.deb`.

## 🛠️ Tech Stack

Built for speed, safety, and a tiny footprint:
- **Core Shell**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand
- **Styling**: Vanilla CSS Modules (No heavy utility frameworks)
- **Animations**: Framer Motion

## 🚀 Development Setup

If you want to build the app from source or contribute:

### Prerequisites
1. [Node.js](https://nodejs.org/) (v20 or higher)
2. [Rust](https://rustup.rs/) (v1.94 or higher)
3. OS-specific build dependencies (see [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Running Locally

```bash
# Clone the repository
git clone https://github.com/kleinebossie/volante-desktop.git
cd volante-desktop

# Install frontend dependencies
npm install

# Start the development server and desktop app
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```
The compiled binaries will be located in `src-tauri/target/release/bundle/`.

## 📄 Architecture & Development

The codebase is structured into modular React components, custom hooks, and state stores. If you are extending the application:
- Core session logic and calculators are located in `src/engine/`.
- Screen views are found in `src/screens/`.
- Shared state is managed via Zustand stores in `src/stores/`.


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Disclaimer: This app is not affiliated with, endorsed by, or sponsored by Formula One World Championship Limited or any of its affiliates. "F1" and "FORMULA 1" are trademarks of Formula One Licensing BV.*
