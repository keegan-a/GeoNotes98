import { browser } from '$app/environment';
import { get } from 'svelte/store';
import type { ThemePack } from '$lib/types';
import { getDb } from '$lib/persistence/db';
import { currentTheme, playSound } from '$lib/features/themes';

const isTauri = () => typeof window !== 'undefined' && '__TAURI__' in window;

const buildHtml = (theme: ThemePack | null, payload: unknown) => {
  const data = JSON.stringify(payload);
  const themeMeta = theme
    ? `<style>body{background:${theme.tokens['--desk-bg'] ?? '#f8f4e3'};color:${
        theme.tokens['--ink'] ?? '#1f1b2c'
      }}</style>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>GeoNotes 98 Export</title>${themeMeta}</head><body><main><h1>GeoNotes 98 — Time Capsule</h1><p>This HTML file contains the notes, stickers, and settings you exported. Scroll down to read or copy the JSON payload.</p><section id="notes"></section><details><summary>Raw data</summary><pre id="payload"></pre></details><script>const payload=${data};const notesSection=document.getElementById('notes');const renderNote=(note)=>{const article=document.createElement('article');article.style.border='1px solid rgba(61,58,90,0.3)';article.style.padding='1rem';article.style.margin='1rem 0';const heading=document.createElement('h2');heading.textContent=note.title||'Untitled';article.appendChild(heading);const body=document.createElement('p');body.textContent=note.content;article.appendChild(body);const meta=document.createElement('small');meta.textContent=new Date(note.updatedAt).toLocaleString();article.appendChild(meta);return article;};payload.notes.forEach((note)=>notesSection.appendChild(renderNote(note)));document.getElementById('payload').textContent=JSON.stringify(payload,null,2);</script></main></body></html>`;
};

export const exportToHtml = async () => {
  if (!browser) return;
  const db = getDb();
  const [notes, stickers, settings] = await Promise.all([
    db.notes.toArray(),
    db.stickers.toArray(),
    db.settings.toArray()
  ]);
  const theme = get(currentTheme);

  const payload = {
    generatedAt: new Date().toISOString(),
    notes,
    stickers,
    settings,
    theme
  };

  const html = buildHtml(theme, payload);

  if (isTauri()) {
    const [{ save }, { writeTextFile }] = await Promise.all([
      // @ts-ignore - Resolved dynamically when running inside Tauri
      import('@tauri-apps/api/dialog'),
      // @ts-ignore - Resolved dynamically when running inside Tauri
      import('@tauri-apps/api/fs')
    ]);
    const target = await save({
      defaultPath: `geonotes-${new Date().toISOString().slice(0, 10)}.html`,
      filters: [{ name: 'HTML', extensions: ['html'] }]
    });
    if (target) {
      await writeTextFile(target, html);
    }
  } else {
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `geonotes-${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  playSound('save');
};
