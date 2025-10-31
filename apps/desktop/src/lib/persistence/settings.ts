import { browser } from '$app/environment';
import { liveQuery } from 'dexie';
import { writable } from 'svelte/store';
import type { DesktopSettings } from '$lib/types';
import { defaultSettings, getDb } from './db';

const settingsStore = writable<DesktopSettings>(defaultSettings);

if (browser) {
  liveQuery(async () => {
    const record = await getDb().settings.get('desktop');
    return (record?.value as DesktopSettings | undefined) ?? defaultSettings;
  }).subscribe((value) => settingsStore.set(value));
}

export const desktopSettings = { subscribe: settingsStore.subscribe };

export const updateSettings = async (value: Partial<DesktopSettings>) => {
  if (!browser) return;
  const merged = { ...defaultSettings, ...(await getCurrentSettings()), ...value };
  await getDb().settings.put({ key: 'desktop', value: merged });
  settingsStore.set(merged);
};

const getCurrentSettings = async (): Promise<DesktopSettings> => {
  if (!browser) return defaultSettings;
  const record = await getDb().settings.get('desktop');
  return (record?.value as DesktopSettings | undefined) ?? defaultSettings;
};
