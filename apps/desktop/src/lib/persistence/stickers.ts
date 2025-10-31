import { browser } from '$app/environment';
import { nanoid } from 'nanoid';
import { liveQuery } from 'dexie';
import { readable } from 'svelte/store';
import type { StickerRecord } from '$lib/types';
import { getDb } from './db';

export const stickersStore = readable<StickerRecord[]>([], (set) => {
  if (!browser) {
    set([]);
    return () => undefined;
  }

  const subscription = liveQuery(() => getDb().stickers.toArray()).subscribe((stickers) => set(stickers));
  return () => subscription.unsubscribe();
});

export const addSticker = async (asset: string) => {
  if (!browser) return;
  const db = getDb();
  const id = nanoid();
  const existing = await db.stickers.toArray();
  const maxZ = existing.reduce((acc, sticker) => Math.max(acc, sticker.zIndex), 0);
  await db.stickers.put({
    id,
    asset,
    x: 0.2 + Math.random() * 0.6,
    y: 0.2 + Math.random() * 0.6,
    scale: 1,
    rotation: (Math.random() - 0.5) * 10,
    zIndex: maxZ + 1
  });
};

export const updateSticker = async (id: string, changes: Partial<StickerRecord>) => {
  if (!browser) return;
  await getDb().stickers.update(id, changes);
};

export const removeSticker = async (id: string) => {
  if (!browser) return;
  await getDb().stickers.delete(id);
};
