# Theme Architecture

GeoNotes 98 treats themes as living mood boards. Each theme pack defines CSS tokens, stickers, icons, and sounds in a single `theme.json`. The runtime loads these packs, resolves asset paths, applies variables, and preloads audio.

## Theme anatomy

```json
{
  "id": "sunset-desk",
  "name": "Sunset Desk",
  "tokens": {
    "--desk-bg": "url('./wallpaper.svg') center/cover no-repeat fixed",
    "--ink": "#2a1f35",
    "--window-bg": "rgba(253, 252, 247, 0.92)",
    "--accent": "#d182b0",
    "--accent-soft": "#9ccfd8"
  },
  "assets": {
    "windowChrome": "./window-chrome.svg",
    "icons": {
      "note": "./icons/note.svg",
      "sticker": "./icons/sticker.svg"
    },
    "stickers": [
      "./stickers/pattern-1.svg",
      "./stickers/shape-2.svg"
    ],
    "soundpack": {
      "click": "data:audio/wav;base64,...",
      "save": "data:audio/wav;base64,..."
    }
  }
}
```

> The bundled **Sunset Desk** theme ships with SVG artwork and inline base64 audio so the public repository contains only text files. When creating your own packs, replace these placeholders with full-resolution PNG/WebP graphics and `.ogg`/`.wav` files as described in [ASSET_CREATION.md](ASSET_CREATION.md).

### Tokens → CSS variables

Tokens map directly to `document.documentElement.style`. Use CSS variables prefixed with `--` to control:

- `--desk-bg` — wallpaper / background fill
- `--ink` — text color
- `--window-bg` — note window background
- `--accent` — highlight color
- `--accent-soft` — subtle tint for UI chrome
- Define any additional variables (`--button-shadow`, etc.) as needed.

The loader resolves relative URLs automatically (e.g. `url('./wallpaper.webp')` becomes an absolute bundle path).

### Assets

- `windowChrome`: optional PNG for 9-slice borders.
- `icons`: custom icons for the header / sticker drawer.
- `stickers`: image list used by the sticker drawer.
- `soundpack`: key/value map for UI audio cues. Supported keys include `click` and `save`, but any name can be played via `playSound('name')`.

## Loading themes

```ts
import { loadThemePack, loadThemeById, registerTheme } from '$lib/features/themes';

const packUrl = new URL('$lib/assets/sample-pack/theme.json', import.meta.url).href;
await loadThemePack(packUrl); // applies immediately
```

Registered themes appear in the settings dropdown:

```ts
registerTheme({ id: 'jazz-cup', name: 'Jazz Cup', source: packUrl });
```

To persist selection:

```ts
import { updateSettings } from '$lib/persistence/settings';
await updateSettings({ themeId: 'jazz-cup' });
await loadThemeById('jazz-cup');
```

## Styling tips

- Keep wallpapers calm—soft gradients, gentle patterns.
- Use slightly translucent windows so the wallpaper peeks through.
- Avoid pure black/white; lean into cozy off-whites and twilight blues.
- Ensure sufficient contrast (WCAG AA) for text vs. background.
- Pair soundpacks with visual tone (muted bells for cool palettes, warm clicks for sunset tones).

## Testing themes

1. Add your pack under `src/lib/assets/your-pack/`.
2. Run `npm run dev` or `npm run tauri:dev`.
3. Use the theme dropdown (top right) to switch.
4. Verify: wallpaper loads, stickers draggable, sounds play, tokens update live.

Themes are lightweight JSON files, so you can safely share them by zipping the folder or exporting to the HTML time capsule.
