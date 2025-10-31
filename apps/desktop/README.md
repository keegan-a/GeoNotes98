# GeoNotes 98 Desktop

This is the SvelteKit + Tauri application that powers GeoNotes 98. It bundles a local-first Dexie database, theme system, sticker engine, and export pipeline inside a nostalgic desk interface.

## Install

```bash
npm install
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite in dev mode for the web experience (http://localhost:5173). |
| `npm run tauri:dev` | Launch Tauri shell + Vite with hot reload. |
| `npm run build` | Create a static build in `build/` (used by Tauri bundler). |
| `npm run tauri:build` | Compile the Rust shell and bundle installers. |
| `npm run lint` | ESLint across the project. |
| `npm run check` | `svelte-check` type analysis. |
| `npm run test` | Run Vitest unit tests. |

## Project layout

```
src/
├── app.postcss              # Tailwind layers + tokens
├── lib/
│   ├── assets/sample-pack   # Built-in theme pack
│   ├── components           # Desktop UI components
│   ├── features             # Themes, exporter, reflections
│   └── persistence          # Dexie stores for notes/stickers/settings
├── routes/+layout.svelte    # Global styles + head tags
└── routes/+page.svelte      # DesktopShell entry point
src-tauri/
├── Cargo.toml               # Rust dependencies
├── tauri.conf.json          # Build targets (Windows x64/ARM64, macOS, Linux)
└── src/main.rs              # Tauri entry point
```

## Development notes

- The Dexie database seeds friendly starter notes on first run.
- `runEchoSweep` duplicates notes older than 30 days (“echo mode”).
- Themes are hot-loaded via `loadThemePack` and persisted in IndexedDB.
- `exportToHtml` writes a self-contained HTML time capsule, using Tauri FS APIs when available.

See the repository root for design philosophy, asset workflow, and accessibility documentation.
