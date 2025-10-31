import { browser } from '$app/environment';
import { nanoid } from 'nanoid';
import { liveQuery } from 'dexie';
import { readable } from 'svelte/store';
import type { NoteRecord } from '$lib/types';
import { defaultSettings, getDb } from './db';

const colors = ['#fefcf7', '#f7ede2', '#e0f2f1', '#f3e8ff'];

export const notesStore = readable<NoteRecord[]>([], (set) => {
  if (!browser) {
    set([]);
    return () => undefined;
  }

  const subscription = liveQuery(() => getDb().notes.orderBy('updatedAt').reverse().toArray()).subscribe((notes) => {
    set(notes);
  });

  return () => subscription.unsubscribe();
});

export const getNote = async (id: string) => {
  if (!browser) return null;
  return getDb().notes.get(id);
};

export const createNote = async (title = 'Untitled note'): Promise<string> => {
  if (!browser) return '';
  const now = new Date().toISOString();
  const id = nanoid();
  const record: NoteRecord = {
    id,
    title,
    content: '',
    createdAt: now,
    updatedAt: now,
    color: colors[Math.floor(Math.random() * colors.length)]
  };
  await getDb().notes.put(record);
  return id;
};

export const updateNote = async (id: string, changes: Partial<NoteRecord>) => {
  if (!browser) return;
  await getDb().notes.update(id, {
    ...changes,
    updatedAt: new Date().toISOString()
  });
};

export const deleteNote = async (id: string) => {
  if (!browser) return;
  await getDb().notes.delete(id);
};

export const runEchoSweep = async (): Promise<number> => {
  if (!browser) return 0;
  const db = getDb();
  const now = new Date();
  const threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const originals = await db.notes.filter((note) => !note.echoParentId).toArray();
  let created = 0;

  await Promise.all(
    originals.map(async (note) => {
      const lastEcho = note.lastEchoCheck ? new Date(note.lastEchoCheck) : null;
      if (lastEcho && lastEcho > threshold) {
        return;
      }
      const createdAt = new Date(note.createdAt);
      if (createdAt > threshold) {
        return;
      }

      const echoId = nanoid();
      await db.notes.put({
        ...note,
        id: echoId,
        title: `${note.title || 'Untitled'} — echo`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        echoParentId: note.id
      });
      created += 1;

      await db.notes.update(note.id, { lastEchoCheck: now.toISOString() });
    })
  );
  return created;
};

export const ensureSeedData = async () => {
  if (!browser) return;
  const db = getDb();
  const existing = await db.notes.count();
  if (existing === 0) {
    await db.notes.bulkAdd([
      {
        id: nanoid(),
        title: 'Welcome to GeoNotes 98',
        content:
          'This desk is yours. Jot notes, doodle, leave reminders. GeoNotes 98 keeps everything local so thoughts stay personal.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: colors[0]
      },
      {
        id: nanoid(),
        title: 'Remember',
        content: 'Notes are like seeds—some bloom later. Leave them be. Return when you feel the pull.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: colors[1]
      }
    ]);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({ key: 'desktop', value: defaultSettings });
  }
};
