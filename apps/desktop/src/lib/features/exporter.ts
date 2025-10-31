import { db, setSetting } from '$lib/db';
import type { ExportBundle, Note, Sticker } from '$lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
}

function isNote(value: unknown): value is Note {
        if (!isRecord(value)) return false;
        return (
                typeof value.id === 'string' &&
                typeof value.title === 'string' &&
                typeof value.content === 'string' &&
                typeof value.createdAt === 'number' &&
                typeof value.updatedAt === 'number'
        );
}

function isSticker(value: unknown): value is Sticker {
        if (!isRecord(value)) return false;
        return (
                typeof value.id === 'string' &&
                typeof value.label === 'string' &&
                typeof value.asset === 'string' &&
                typeof value.x === 'number' &&
                typeof value.y === 'number' &&
                typeof value.scale === 'number' &&
                typeof value.rotation === 'number' &&
                typeof value.driftSeed === 'number' &&
                typeof value.createdAt === 'number'
        );
}

function isExportBundle(value: unknown): value is ExportBundle {
        if (!isRecord(value)) return false;
        const { createdAt, notes, stickers, themeId } = value;
        const validTheme = themeId === null || typeof themeId === 'string';
        return (
                typeof createdAt === 'number' &&
                Array.isArray(notes) &&
                notes.every(isNote) &&
                Array.isArray(stickers) &&
                stickers.every(isSticker) &&
                validTheme
        );
}

function escapeHtml(content: string): string {
        return content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
}

export async function createBundle(): Promise<ExportBundle> {
        const [notes, stickers, themeSetting] = await Promise.all([
                db.notes.toArray(),
                db.stickers.toArray(),
                db.settings.get('themeId')
        ]);
        const themeId = typeof themeSetting?.value === 'string' ? themeSetting.value : null;
        return {
                createdAt: Date.now(),
                notes,
                stickers,
                themeId
        };
}

export function bundleToHtml(bundle: ExportBundle): string {
        const payload = JSON.stringify(bundle);
        const encoded = escapeHtml(payload);
        return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>GeoNotes 98 — time capsule</title>
<style>
body { font-family: 'IBM Plex Sans', system-ui, sans-serif; background: #f4efe4; color: #1f1a1d; margin: 2rem auto; max-width: 48rem; line-height: 1.6; padding: 0 1.5rem; }
h1 { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; margin-bottom: 1rem; }
article { background: rgba(255, 255, 255, 0.86); border: 1px solid rgba(51, 48, 75, 0.35); border-radius: 16px; padding: 1.5rem; box-shadow: 6px 6px 0 rgba(28, 26, 44, 0.12); }
code { background: rgba(31, 26, 38, 0.07); padding: 0.1rem 0.4rem; border-radius: 0.35rem; }
footer { margin-top: 2rem; font-size: 0.875rem; color: #6b6a72; }
</style>
</head>
<body>
<h1>GeoNotes 98 — Your Pocket of Time</h1>
<article>
<p>This export is a single HTML file containing your notes, stickers, and chosen theme identifier. You can re-import it into GeoNotes 98 by using the <strong>Import time capsule</strong> button inside the desktop.</p>
<p>If you simply want to read, scroll below. Each note is rendered in the order it was saved.</p>
${bundle.notes
        .map(
                (note) => `<section>
<h2>${escapeHtml(note.title || 'Untitled note')}</h2>
<p><em>Edited ${new Date(note.updatedAt).toLocaleString()}</em></p>
<pre>${escapeHtml(note.content)}</pre>
</section>`
        )
        .join('\n')}
</article>
<footer>Generated ${new Date(bundle.createdAt).toLocaleString()} — keep creating softly.</footer>
<script id="geonotes-export" type="application/json">${encoded}</script>
</body>
</html>`;
}

export function extractBundle(html: string): ExportBundle {
        const match = html.match(/<script id="geonotes-export" type="application\/json">([\s\S]*?)<\/script>/);
        if (!match) {
                throw new Error('Export payload not found.');
        }
        const parsed = JSON.parse(match[1]) as unknown;
        if (!isExportBundle(parsed)) {
                throw new Error('Export payload is invalid.');
        }
        return parsed;
}

export async function importBundle(bundle: ExportBundle) {
        await db.transaction('rw', db.notes, db.stickers, db.settings, async () => {
                await db.notes.clear();
                await db.stickers.clear();
                await db.notes.bulkAdd(bundle.notes ?? []);
                await db.stickers.bulkAdd(bundle.stickers ?? []);
                if (bundle.themeId) {
                        await setSetting('themeId', bundle.themeId);
                }
        });
}

export function downloadBundle(bundle: ExportBundle) {
        const html = bundleToHtml(bundle);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date(bundle.createdAt).toISOString().split('T')[0];
        link.download = `geonotes98-${timestamp}.html`;
        link.click();
        URL.revokeObjectURL(url);
}
