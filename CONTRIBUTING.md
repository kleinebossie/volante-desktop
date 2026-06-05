# Contributing to Volante

Thank you for considering contributing to Volante! 🏎️ Whether it's a bug report, a feature suggestion, a code fix, or documentation — every contribution is welcome and appreciated.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please report unacceptable behavior to [joe.bos@hotmail.com](mailto:joe.bos@hotmail.com).

## How Can I Contribute?

### 🐛 Reporting Bugs

Found something broken? [Open a bug report](https://github.com/kleinebossie/volante-desktop/issues/new?template=bug_report.md) with:

- Your OS and version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

### ✨ Suggesting Features

Have an idea? [Start a discussion](https://github.com/kleinebossie/volante-desktop/discussions/categories/ideas) or [open a feature request](https://github.com/kleinebossie/volante-desktop/issues/new?template=feature_request.md).

### 🖥️ Testing on Other Platforms

If you're on **macOS or Windows**, your testing is incredibly valuable! Download the latest release and [file a platform report](https://github.com/kleinebossie/volante-desktop/issues/new?template=platform_report.md).

### 💻 Code Contributions

1. Check existing [issues](https://github.com/kleinebossie/volante-desktop/issues) for something to work on
2. Look for [`good first issue`](https://github.com/kleinebossie/volante-desktop/labels/good%20first%20issue) labels for easy starter tasks
3. Comment on the issue to claim it
4. Fork, code, and submit a PR

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Rust](https://rustup.rs/) v1.70+
- Platform dependencies: see [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Setup

```bash
git clone https://github.com/YOUR_FORK/volante-desktop.git
cd volante-desktop
npm install
npm run tauri dev
```

### Running Tests

```bash
npm run test # Run once
npm run test:watch # Watch mode
```

### Building

```bash
npm run tauri build # Full production build
```

## Project Structure

```
src/
├── components/ # Reusable UI components (each in its own folder)
├── screens/ # Full-page screen views (Setup, Race, Summary, Settings)
├── stores/ # Zustand state stores (session, settings, history)
├── engine/ # Core logic (timer, regulations, penalties, progress)
├── hooks/ # Custom React hooks
├── types/ # TypeScript type definitions
├── data/ # Static data (tracks, seasons)
└── utils/ # Pure utility functions

src-tauri/ # Rust backend (Tauri shell + plugins)
```

## Code Style

- **TypeScript**: Strict mode, no `any` types
- **CSS**: CSS Modules (one `.module.css` per component), use CSS variables from `index.css`
- **Components**: One component per file, functional components with hooks
- **State**: All global state via Zustand stores in `src/stores/`
- **Naming**: PascalCase for components, camelCase for functions/variables

## Pull Request Process

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature` or `fix/your-fix`
3. **Make your changes** — follow the code style above
4. **Test**: Run `npm run test` and `npm run build` to verify nothing is broken
5. **Commit** with a clear message: `feat: add sound effects` or `fix: track selector overflow`
6. **Push** and **open a PR** against the `main` branch
7. **Describe** your changes in the PR description

### PR Review

- I (Joe) review all PRs
- Small, focused PRs are preferred over large ones
- Be patient — I'm a solo maintainer and may take a few days to review

## Issue Guidelines

- **Search first** to avoid duplicates
- **One issue per problem** — don't bundle multiple bugs
- **Be specific** — include OS, version, steps to reproduce
- **Be kind** — we're all here to make the app better 🙂
