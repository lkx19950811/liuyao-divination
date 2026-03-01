# LiuYao Divination

[中文](README_zh.md) | English

A desktop application for Liu Yao (Six Lines) divination prediction based on traditional Chinese I Ching theory.

**Tech Stack:** Electron + Vue 3 + TypeScript + SQLite

## Features

| Module | Features |
|--------|----------|
| Divination | Time-based, Number-based, Coin-tossing, Manual input |
| Interpretation | Hexagram display, Text interpretation, AI interpretation (optional) |
| History | Record saving, Search & filter, Export & backup |
| Knowledge Base | 64 Hexagrams guide, Bagua basics, Divination methods |
| Settings | Theme, Font, AI configuration, Data management |

## Quick Start

```bash
# Install dependencies
npm install

# Development mode (recommended)
npm run dev:full
```

## Build & Release

```bash
# 1. Kill running processes
taskkill /F /IM "LiuYao-Divination.exe" 2>$null
taskkill /F /IM "electron.exe" 2>$null

# 2. Clean old builds
Remove-Item -Path "release" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Build with admin privileges
npm run build:win
```

**Output:**
- `release/{version}/LiuYao-Divination-{version}-x64.exe` - Portable version, double-click to run

## AI Interpretation (Optional)

This app supports local AI interpretation based on Ollama:

1. Install [Ollama](https://ollama.ai) (version 0.6+ required)
2. Run `ollama pull huihui_ai/gemma3-abliterated:latest`
3. Enable AI feature in Settings and select model

## Tech Stack

Electron 29 | Vue 3 | Element Plus | Pinia | SQLite | TypeScript | Vite

## Project Structure

```
src/
├── main/           # Electron main process
├── renderer/       # Vue 3 frontend
└── shared/         # Shared code (types, utils, data)
```

See [docs/](docs/) for detailed documentation.

## Changelog

### v1.2.4 (2026-03-01)
- Added restart app feature for Ollama installation detection
- Added mirror acceleration for model download
- Fixed download progress lost when switching pages
- Removed unnecessary popup notifications
- Fixed TypeScript type errors
- Persisted download state in global store

### v1.2.3 (2026-03-01)
- Refactored AI settings UI with model management section
- Added model download progress bar with clean output
- Added domestic mirror sources (ModelScope, HF-Mirror, DaoCloud)
- Fixed history record detail not displaying
- Fixed Ollama connection status detection
- Fixed duplicate toast messages on model download

### v1.2.2 (2026-02-28)
- AI interpretation auto-saved to history
- "AI Interpretation" tag displayed in history list
- Optimized AI prompt for more detailed analysis
- Fixed white screen after build (resource path correction)
- Updated build process with process cleanup

### v1.2.1 (2026-02-28)
- Optimized Ollama download mirror sources
- Default to Cloudflare mirror for faster model download

### v1.2.0 (2026-02-28)
- AI interpretation with streaming output
- Support for DeepSeek-R1 thinking process display
- Collapsible thinking section with smaller font
- Markdown rendering for AI interpretation
- "Stop Generation" button to cancel anytime
- Cursor animation during generation

### v1.1.0 (2026-02-28)
- AI-powered interpretation (based on Ollama local model)
- AI settings page (model selection, temperature, max tokens)
- Native window appearance (frameless + custom title bar)
- Fixed lunar date display undefined issue
- Fixed menu navigation and date picker not responding

### v1.0.0 (2026-02-27)
- Four divination methods
- Complete interpretation functionality
- History management
- Knowledge base query
- System settings
- Data export & backup

## License

For educational and research purposes only.

## Author

**KasonLee-marker** - [GitHub](https://github.com/KasonLee-marker)
