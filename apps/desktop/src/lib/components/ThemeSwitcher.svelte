<script lang="ts">
  import { onMount } from 'svelte';

  type ThemeId = 'theme-teal95' | 'theme-xp-bliss' | 'theme-jazzcup';

  const themes: { id: ThemeId; label: string; description: string }[] = [
    { id: 'theme-teal95', label: 'Teal 95', description: 'Warm neutrals with teal chrome' },
    { id: 'theme-xp-bliss', label: 'XP Bliss', description: 'Blue glass gradients inspired by XP' },
    { id: 'theme-jazzcup', label: 'Jazz Cup', description: 'Vibrant purple & teal throwback' }
  ];

  const THEME_CLASSES = themes.map((theme) => theme.id);
  const FALLBACK_THEME: ThemeId = 'theme-teal95';
  const DB_NAME = 'geonotes-preferences';
  const STORE_NAME = 'ui';
  const THEME_KEY = 'theme';

  const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

  let selectedTheme: ThemeId = FALLBACK_THEME;
  let initialized = false;
  let statusMessage = '';

  function applyTheme(theme: ThemeId) {
    if (!isClient) return;
    const root = document.documentElement;
    // Remove previous theme classes to prevent stacking conflicting variables.
    root.classList.remove(...THEME_CLASSES);
    if (!root.classList.contains(theme)) {
      root.classList.add(theme);
    }
  }

  function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!isClient || !('indexedDB' in window)) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }

      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Unknown IndexedDB error'));
    });
  }

  async function readPersistedTheme(): Promise<ThemeId | undefined> {
    try {
      const db = await openDatabase();
      return await new Promise<ThemeId | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(THEME_KEY);
        request.onsuccess = () => resolve(request.result as ThemeId | undefined);
        request.onerror = () => reject(request.error ?? new Error('Unable to read theme'));
        tx.oncomplete = () => db.close();
      });
    } catch (error) {
      console.warn('ThemeSwitcher failed to read saved theme:', error);
      statusMessage = 'Theme preference not saved (offline mode).';
      return undefined;
    }
  }

  async function persistTheme(theme: ThemeId) {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(theme, THEME_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error('Unable to persist theme'));
        tx.oncomplete = () => db.close();
      });
      statusMessage = '';
    } catch (error) {
      console.warn('ThemeSwitcher failed to persist theme:', error);
      statusMessage = 'Unable to persist theme preference.';
    }
  }

  onMount(async () => {
    if (!isClient) return;
    const saved = await readPersistedTheme();
    if (saved && THEME_CLASSES.includes(saved)) {
      selectedTheme = saved;
    }
    applyTheme(selectedTheme);
    initialized = true;
  });

  $: if (initialized && isClient) {
    applyTheme(selectedTheme);
    persistTheme(selectedTheme);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedTheme = (target.value as ThemeId) ?? FALLBACK_THEME;
  }
</script>

<div class="theme-switcher" aria-live="polite">
  <label class="theme-switcher__label" for="theme-select">Theme</label>
  <select id="theme-select" class="theme-switcher__select" on:change={handleChange} bind:value={selectedTheme}>
    {#each themes as theme}
      <option value={theme.id} title={theme.description}>
        {theme.label}
      </option>
    {/each}
  </select>
  {#if statusMessage}
    <p class="theme-switcher__status">{statusMessage}</p>
  {/if}
</div>

<style>
  .theme-switcher {
    display: flex;
    flex-direction: column;
    gap: var(--gn-space-1);
    color: rgb(var(--gn-color-text));
    font-size: 0.875rem;
    min-width: 180px;
  }

  .theme-switcher__label {
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .theme-switcher__select {
    appearance: none;
    background: rgb(var(--gn-color-surface-elevated));
    border: 1px solid rgb(var(--gn-color-border));
    border-radius: var(--gn-radius-soft);
    padding: calc(var(--gn-space-1)) calc(var(--gn-space-3));
    box-shadow: var(--gn-shadow-button);
    color: inherit;
    line-height: 1.3;
    transition: box-shadow var(--gn-motion-duration-fast) var(--gn-motion-ease-standard),
      transform var(--gn-motion-duration-fast) var(--gn-motion-ease-standard);
  }

  .theme-switcher__select:focus {
    outline: 2px solid rgb(var(--gn-color-border-strong));
    outline-offset: 2px;
    box-shadow: var(--gn-shadow-window-active);
  }

  .theme-switcher__select:hover {
    transform: translateY(-1px);
  }

  .theme-switcher__status {
    margin: 0;
    font-size: 0.75rem;
    color: rgb(var(--gn-color-text-soft));
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-switcher__select {
      transition: none;
    }
    .theme-switcher__select:hover {
      transform: none;
    }
  }
</style>
