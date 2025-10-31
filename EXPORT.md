# Export & Import

GeoNotes 98 exports your desk into a single self-contained HTML file—no external assets, no trackers. Think of it as a time capsule you can open in any browser.

## How export works

1. Choose **Export desk** in the header.
2. The app gathers:
   - Notes (title, content, timestamps, echo metadata)
   - Stickers (positions, rotation, z-index)
   - Desktop settings (theme, ambient toggle, clock preference)
   - Current theme pack (tokens + resolved asset URLs)
3. A static HTML file is generated with:
   - Inline CSS styled by your active theme
   - Embedded JSON payload for structured data
   - Vanilla JS renderer that lays out notes chronologically
4. In the desktop app, Tauri prompts for a save location. In the web build, a download starts automatically.

Export files follow the naming convention `geonotes-YYYY-MM-DD.html`.

## Importing a time capsule

The exported HTML includes the entire data payload. To re-import:

1. Open the file in a browser.
2. Copy the JSON from the “Raw data” section.
3. Paste into a new file and import via a planned importer (future work) or manually seed Dexie:

```ts
import { getDb } from '$lib/persistence/db';

const db = getDb();
const payload = /* paste JSON */;
await db.transaction('rw', db.notes, db.stickers, db.settings, async () => {
  await db.notes.clear();
  await db.stickers.clear();
  await db.settings.clear();
  await db.notes.bulkAdd(payload.notes);
  await db.stickers.bulkAdd(payload.stickers);
  for (const setting of payload.settings) {
    await db.settings.put(setting);
  }
});
```

An importer UI is on the roadmap; until then, the HTML file ensures nothing is lost.

## Tips for meaningful exports

- Export monthly or whenever the desk feels “full”.
- Add a short reflection at the top of a note before exporting (“What changed since this began?”).
- Share exports privately—they’re designed for intimate viewing, not social feeds.

GeoNotes 98 keeps ownership with you. The export is your narrative frozen in time, ready to revisit when you need perspective.
