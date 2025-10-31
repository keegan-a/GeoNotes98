import { browser } from '$app/environment';
import Dexie, { type Table } from 'dexie';
import type { DesktopSettings, NoteRecord, SettingRecord, StickerRecord } from '$lib/types';

class GeoNotesDatabase extends Dexie {
  notes!: Table<NoteRecord, string>;
  stickers!: Table<StickerRecord, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('geonotes98');
    this.version(1).stores({
      notes: '&id, createdAt, updatedAt, echoParentId',
      stickers: '&id, zIndex',
      settings: '&key'
    });
  }
}

let clientDb: GeoNotesDatabase | null = null;

export const getDb = (): GeoNotesDatabase => {
  if (!browser) {
    throw new Error('IndexedDB is only available in the browser.');
  }

  if (!clientDb) {
    clientDb = new GeoNotesDatabase();
  }

  return clientDb;
};

export const defaultSettings: DesktopSettings = {
  themeId: 'sunset-desk',
  ambientMessages: true,
  clock24h: false
};
