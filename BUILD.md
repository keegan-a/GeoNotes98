# Build & Platform Guide

GeoNotes 98 ships as a Tauri 2 desktop app with a SvelteKit frontend. This guide walks through environment setup for macOS, Windows (x64 + ARM64), and Linux.

## 1. Common prerequisites

1. **Install Rust (stable)**
   ```bash
   curl https://sh.rustup.rs -sSf | sh
   rustup default stable
   ```
2. **Install Node.js 18+** (use [fnm](https://github.com/Schniz/fnm), [nvm](https://github.com/nvm-sh/nvm), or installers).
3. **Install package manager** (npm 9+, pnpm 9+, or yarn 4+).
4. **Install Tauri prerequisites**
   - macOS: Xcode Command Line Tools (`xcode-select --install`).
   - Windows: Visual Studio Build Tools (Desktop development with C++), WebView2 Runtime.
   - Linux: system libraries (`libgtk-3`, `webkit2gtk`, `libayatana-appindicator3`, `openssl`). See [Tauri docs](https://tauri.app/start/prerequisites/).

## 2. Clone & install

```bash
git clone https://github.com/your-org/GeoNotes98.git
cd GeoNotes98/apps/desktop
npm install
```

## 3. Development workflow

- **Web only**: `npm run dev`
- **Desktop dev**: `npm run tauri:dev`
- **Lint & tests**: `npm run lint`, `npm run check`, `npm run test`

`npm run tauri:dev` automatically runs Vite (`npm run dev -- --host`) alongside the Tauri shell.

## 4. Production builds

```bash
npm run build        # generates static client in build/
npm run tauri:build  # compiles Rust + bundles installers
```

Artifacts live in `src-tauri/target/{platform}/release/`.

## 5. Platform specifics

### macOS (Intel & Apple Silicon)

1. Install Command Line Tools (`xcode-select --install`).
2. Ensure Rust targets: `rustup target add aarch64-apple-darwin x86_64-apple-darwin`.
3. Build universal binary:
   ```bash
   npm run tauri:build
   ```
   Tauri produces universal `.app` and `.dmg` bundles.

### Windows (x64 + ARM64)

1. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with:
   - MSVC v143 toolset
   - Windows 11 SDK
   - C++ CMake tools for Windows
2. Install [WebView2 Evergreen Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).
3. Add Rust targets:
   ```powershell
   rustup target add x86_64-pc-windows-msvc aarch64-pc-windows-msvc
   ```
4. Build both architectures:
   ```powershell
   # x64
   npm run tauri:build

   # ARM64
   set RUSTFLAGS=--cfg=tauri_custom_target
   set TAURI_CONFIG="%cd%\src-tauri\tauri.conf.json"
   cargo tauri build --target aarch64-pc-windows-msvc
   ```
   The NSIS bundle (configured in `tauri.conf.json`) emits installers for x64 and ARM64.

### Linux (Debian/Ubuntu/Fedora)

Install system libraries:

```bash
# Debian / Ubuntu
sudo apt update
sudo apt install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev openssl libssl-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel libappindicator-gtk3-devel openssl-devel
```

Build with:

```bash
npm run tauri:build
```

## 6. Continuous integration suggestions

- Cache `~/.cargo`, `node_modules`, and `.svelte-kit`.
- Run `npm run check && npm run test` for TypeScript + unit tests.
- For release builds, run `npm run tauri:build` on dedicated runners per OS.

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| `tauri` command not found | Ensure `npm run tauri` executes via local dependency (`@tauri-apps/cli`). |
| WebView2 errors on Windows | Install Evergreen runtime or ensure system WebView2 is updated. |
| `GLIBC` errors on Linux | Build on the oldest supported distro or containerize with Tauri's official Docker image. |
| Missing `build/` folder | Run `npm run build` (uses `adapter-static`) before `npm run tauri:build`. |

With the environment ready you can ship installers that mirror the playful, mindful space of GeoNotes 98.
