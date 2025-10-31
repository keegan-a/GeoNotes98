import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { ThemePack } from '$lib/types';

interface ThemeRegistryItem {
  id: string;
  name: string;
  source: string;
}

const builtinThemeUrl = new URL('../../assets/sample-pack/theme.json', import.meta.url).href;

const registryStore = writable<ThemeRegistryItem[]>([
  { id: 'sunset-desk', name: 'Sunset Desk', source: builtinThemeUrl }
]);

const currentThemeStore = writable<ThemePack | null>(null);
const currentSoundpackStore = writable<Record<string, HTMLAudioElement>>({});

const cache = new Map<string, ThemePack>();

const resolveUrl = (base: string, target: string) => new URL(target, base).href;

const resolveTokens = (base: string, tokens: Record<string, string>) => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    result[key] = value.replace(/url\((['\"]?)(\.\/[^)]+)\1\)/g, (_match, quote, rel) => {
      const resolved = resolveUrl(base, rel);
      const q = quote || '';
      return `url(${q}${resolved}${q})`;
    });
  }
  return result;
};

const buildPack = (base: string, pack: ThemePack): ThemePack => {
  const resolvedTokens = resolveTokens(base, pack.tokens);
  const stickers = pack.assets.stickers?.map((path) => resolveUrl(base, path));
  const icons = Object.fromEntries(
    Object.entries(pack.assets.icons ?? {}).map(([key, path]) => [key, resolveUrl(base, path)])
  );
  const soundEntries = Object.entries(pack.assets.soundpack ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  );
  const soundpack = Object.fromEntries(soundEntries.map(([key, path]) => [key, resolveUrl(base, path)]));

  return {
    ...pack,
    tokens: resolvedTokens,
    assets: {
      ...pack.assets,
      windowChrome: pack.assets.windowChrome ? resolveUrl(base, pack.assets.windowChrome) : undefined,
      icons,
      stickers,
      soundpack
    }
  };
};

const applyTheme = (theme: ThemePack) => {
  if (!browser) return;
  const root = document.documentElement;
  Object.entries(theme.tokens).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });
  root.dataset.theme = theme.id;
};

const loadSoundpack = async (theme: ThemePack) => {
  if (!browser) return {};
  const entries = Object.entries(theme.assets.soundpack ?? {});
  const result: Record<string, HTMLAudioElement> = {};
  await Promise.all(
    entries.map(async ([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      if (key === 'click') audio.volume = 0.3;
      if (key === 'save') audio.volume = 0.35;
      result[key] = audio;
      await new Promise((resolve) => {
        audio.addEventListener('canplaythrough', () => resolve(true), { once: true });
        audio.addEventListener('error', () => resolve(true), { once: true });
      });
    })
  );
  return result;
};

export const themeRegistry = { subscribe: registryStore.subscribe };
export const currentTheme = { subscribe: currentThemeStore.subscribe };
export const soundpackStore = { subscribe: currentSoundpackStore.subscribe };

export const registerTheme = (entry: ThemeRegistryItem) => {
  registryStore.update((items) => {
    if (items.some((item) => item.id === entry.id)) {
      return items;
    }
    return [...items, entry];
  });
};

export const loadThemePack = async (themeJsonPath: string) => {
  const response = await fetch(themeJsonPath);
  if (!response.ok) {
    throw new Error(`Unable to load theme at ${themeJsonPath}`);
  }
  const raw = (await response.json()) as ThemePack;
  const pack = buildPack(themeJsonPath, raw);
  cache.set(pack.id, pack);
  if (browser) {
    applyTheme(pack);
    const sounds = await loadSoundpack(pack);
    currentSoundpackStore.set(sounds);
  }
  currentThemeStore.set(pack);
  return pack;
};

export const loadThemeById = async (id: string) => {
  if (cache.has(id)) {
    const pack = cache.get(id)!;
    if (browser) {
      applyTheme(pack);
      const sounds = await loadSoundpack(pack);
      currentSoundpackStore.set(sounds);
    }
    currentThemeStore.set(pack);
    return pack;
  }

  let path: string | null = null;
  registryStore.update((items) => {
    const entry = items.find((item) => item.id === id);
    if (entry) {
      path = entry.source;
    }
    return items;
  });

  if (!path) {
    throw new Error(`Theme ${id} is not registered`);
  }

  return loadThemePack(path);
};

export const playSound = (name: string) => {
  if (!browser) return;
  currentSoundpackStore.update((sounds) => {
    const audio = sounds[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => undefined);
    }
    return sounds;
  });
};

registerTheme({ id: 'sunset-desk', name: 'Sunset Desk', source: builtinThemeUrl });
