# Asset Creation Guide

Designing for GeoNotes 98 means embracing intentional imperfection. The desktop should feel handmade—tactile textures, soft gradients, and the occasional misaligned edge that suggests a human hand.

## 1. Philosophy for Assets

- **Texture beats gloss.** Layer subtle paper grain or gentle noise so the UI feels touched, not sterile.
- **Color stories matter.** Let each pack carry an emotional hue (sunset warmth, rainy-day teal, etc.). Keep palettes limited and harmonious.
- **Imperfect symmetry.** Slight misalignments or hand-drawn shapes make the interface feel personal.
- **Original work only.** Create assets yourself; no copyrighted imagery.

## 2. Asset Categories & Specs

| Asset            | Filename & Format                         | Notes |
|------------------|-------------------------------------------|-------|
| Wallpaper        | `wallpaper.webp`, 1920×1080 or larger     | Use WebP for size + quality. Keep compositions calm.
| Window chrome    | `window-chrome.png`, 9-slice, 24px gutter | Transparent PNG. Include subtle bevel/noise.
| Icons            | `icons/*.svg`                             | Export as clean SVGs with strokes, no raster effects.
| Stickers         | `stickers/*.png` or `.webp`               | Transparent backgrounds, 512×512 recommended.
| Cursors (opt.)   | `.cur` or `.png`                          | Optional flair for pointer changes.
| Sound pack       | `sounds/*.ogg` or `.wav`                  | Short UI blips (<0.5s). Keep volumes gentle.

> Repository note: the bundled **Sunset Desk** sample uses SVG artwork and base64-encoded audio data to keep this public repo free of binary blobs. When building your own pack, follow the specs above and replace the placeholders with your actual PNG/WebP graphics and `.ogg`/`.wav` cues.

## 3. Exporting from Photoshop & Illustrator

### Photoshop

1. Keep layers named (`chrome/outer`, `wallpaper/noise`, etc.).
2. Only flatten when necessary—preserve adjustment layers for future tweaks.
3. Export via **File → Export → Save for Web (Legacy)**.
   - PNG-24 with transparency for UI parts.
   - WebP for wallpapers (quality 80–90, metadata stripped).
4. Use smart objects to keep edges crisp when scaling.

### Illustrator

1. Label artboards and layers clearly.
2. Expand strokes and outline text before exporting.
3. Choose **File → Export → Export As → SVG**.
   - Uncheck “Responsive”.
   - Set “Decimals” to 2–3 to keep paths light.
4. For stickers, export to PNG/WebP via **File → Export → Export for Screens** with transparent backgrounds.

## 4. File Preparation & Compression

1. Compress PNG/WebP assets with [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app).
2. Keep files under `assets/your-pack/`.
3. Name everything lowercase-and-hyphenated (`sunset-halo.webp`, `note.svg`).
4. Test assets at 1× and 2× scale to ensure clarity.

## 5. Bundle Layout

```
assets/your-pack/
├── wallpaper.webp
├── window-chrome.png
├── icons/
│   ├── note.svg
│   └── sticker.svg
├── stickers/
│   ├── pattern-1.png
│   └── shape-2.webp
├── sounds/
│   ├── click.ogg
│   └── save.ogg
└── theme.json
```

`theme.json` describes the pack:

```json
{
  "id": "jazz-cup",
  "name": "Jazz Cup",
  "tokens": {
    "--desk-bg": "url('./wallpaper.webp') center/cover no-repeat",
    "--ink": "#241b2d",
    "--window-bg": "rgba(253, 252, 247, 0.92)",
    "--accent": "#a855f7"
  },
  "assets": {
    "windowChrome": "./window-chrome.png",
    "icons": {
      "note": "./icons/note.svg",
      "sticker": "./icons/sticker.svg"
    },
    "stickers": [
      "./stickers/pattern-1.png",
      "./stickers/shape-2.webp"
    ],
    "soundpack": {
      "click": "./sounds/click.ogg",
      "save": "./sounds/save.ogg"
    }
  }
}
```

## 6. Registering a Theme Pack

1. Place your asset folder anywhere inside `src/lib/assets/` (or ship it externally and provide a file picker).
2. In Svelte, register and load the pack:

```ts
import { loadThemePack } from '$lib/features/themes';

const themeUrl = new URL('$lib/assets/your-pack/theme.json', import.meta.url).href;
await loadThemePack(themeUrl);
```

3. To persist selection, call `updateSettings({ themeId: 'jazz-cup' })`.

GeoNotes 98 automatically resolves relative paths in `theme.json`, preloads sounds, and applies CSS tokens. Keep experimenting—each pack is a miniature mood.
