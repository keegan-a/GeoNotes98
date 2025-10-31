# GeoNotes 98

GeoNotes 98 is a retro-inspired journaling desk built with SvelteKit, Tailwind CSS, Dexie, and Tauri. It invites quiet creation—notes, stickers, and gentle surprises live entirely on the user's machine. No feeds, no streaks, only the pleasure of layering thoughts in a caring space.

## Why it exists

GeoNotes 98 is a reminder that small acts of writing can be nourishing. The interface feels like opening a lovingly worn sketchbook: soft colors, imperfect textures, and subtle sounds that say "you're safe here." Creation is the metric; everything else stays out of the way.

## Quick start

### Prerequisites

- Node.js 18+
- npm 9+ (or pnpm / yarn if you prefer)
- Rust toolchain (stable) with Cargo
- Tauri prerequisites for your OS (see [BUILD.md](BUILD.md))

### Install and run the desktop app

```bash
cd apps/desktop
npm install
npm run tauri:dev
```

### Run the web experience only

```bash
cd apps/desktop
npm install
npm run dev
```

### Build distributables

```bash
cd apps/desktop
npm run tauri:build
```

The static web build lives in `apps/desktop/build` after `npm run build`.

## Repository structure

```
GeoNotes98/
├── README.md
├── ASSET_CREATION.md
├── BUILD.md
├── THEMES.md
├── DESIGN.md
├── ACCESSIBILITY.md
├── EXPORT.md
└── apps/
    └── desktop/         # SvelteKit + Tauri project
```

Inside `apps/desktop` you'll find:

- `src/lib/components` — desktop UI, note windows, ambient messaging.
- `src/lib/persistence` — Dexie data access (notes, stickers, settings).
- `src/lib/features` — theming, exporter, reflections.
- `src/lib/assets/sample-pack` — bundled theme + asset pack example (uses SVG + inline audio data so the repo stays text-only).
- `src-tauri` — Tauri 2 configuration and Rust entry point.

## Core ideas implemented

- **Local-first storage** with Dexie and IndexedDB. Notes, stickers, and preferences never leave the machine.
- **Theme loader** that understands `theme.json` packs and applies tokens, stickers, and soundpacks at runtime.
- **Ambient humane mechanics**: reflective prompts, drifting stickers, a gentle save sound, and an optional clock tick that waits for your first interaction.
- **Echo mode** duplicates notes after 30 days to invite reflection instead of pressuring productivity.
- **Export to HTML** packages the entire desk (notes, stickers, settings, current theme) into a single self-contained file.

## Documentation

- [ASSET_CREATION.md](ASSET_CREATION.md) — create wallpapers, stickers, and soundpacks.
- [BUILD.md](BUILD.md) — configure Rust, Node, and Tauri across macOS, Windows (x64 + ARM64), and Linux.
- [THEMES.md](THEMES.md) — understand the theming system and register packs.
- [DESIGN.md](DESIGN.md) — emotional and visual philosophy.
- [ACCESSIBILITY.md](ACCESSIBILITY.md) — keymap, ARIA strategy, and interaction rationale.
- [EXPORT.md](EXPORT.md) — export/import workflows and time-capsule structure.

GeoNotes 98 is MIT licensed. You are free to fork, remix, and layer your own meaning atop this desk.
