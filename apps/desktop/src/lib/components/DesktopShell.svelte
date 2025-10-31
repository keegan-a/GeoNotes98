<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import AmbientMessage from '$lib/components/AmbientMessage.svelte';
  import NoteWindow from '$lib/components/NoteWindow.svelte';
  import {
    createNote,
    deleteNote,
    ensureSeedData,
    notesStore,
    runEchoSweep,
    updateNote
  } from '$lib/persistence/notes';
  import {
    addSticker,
    removeSticker,
    stickersStore,
    updateSticker
  } from '$lib/persistence/stickers';
  import { desktopSettings, updateSettings } from '$lib/persistence/settings';
  import { currentTheme, loadThemeById, playSound, themeRegistry } from '$lib/features/themes';
  import { exportToHtml } from '$lib/features/exporter';
  import type { StickerRecord } from '$lib/types';

  let selectedNoteId: string | null = null;
  let statusMessage = 'Desk ready.';
  let echoMessage = '';
  let clock = new Date();
  let brightness = 1;
  let dragPreview: Record<string, { x: number; y: number }> = {};
  let dragContext: {
    id: string;
    startX: number;
    startY: number;
    pointerX: number;
    pointerY: number;
    rect: DOMRect;
  } | null = null;
  let board: HTMLDivElement | null = null;
  let audioContext: AudioContext | null = null;
  let clearStatusTimeout: ReturnType<typeof setTimeout> | null = null;
  let themeLoaded = false;
  let brightnessStyle = 'brightness(1)';
  let themeIcons: Record<string, string> = {};
  let stickerAssets: string[] = [];

  const computeBrightness = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 6 && hour < 11) return 1.05;
    if (hour >= 11 && hour < 17) return 1;
    if (hour >= 17 && hour < 21) return 0.9;
    return 0.82;
  };

  const formatClock = () => {
    const prefers24 = $desktopSettings.clock24h;
    const hours = clock.getHours();
    const minutes = clock.getMinutes().toString().padStart(2, '0');
    if (prefers24) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minutes}${period}`;
  };

  const ensureAudioContext = () => {
    if (!browser) return;
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
  };

  const playClockTick = () => {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.015, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.21);
  };

  const setStatus = (message: string, duration = 4000) => {
    statusMessage = message;
    if (clearStatusTimeout) clearTimeout(clearStatusTimeout);
    clearStatusTimeout = setTimeout(() => {
      statusMessage = '';
    }, duration);
  };

  const startDrag = (event: PointerEvent, sticker: StickerRecord) => {
    if (!board) return;
    const rect = board.getBoundingClientRect();
    dragContext = {
      id: sticker.id,
      startX: sticker.x,
      startY: sticker.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
      rect
    };
    dragPreview = { ...dragPreview, [sticker.id]: { x: sticker.x, y: sticker.y } };
    event.currentTarget && (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const updateDrag = (event: PointerEvent) => {
    if (!dragContext) return;
    const { rect, startX, startY, pointerX, pointerY, id } = dragContext;
    const deltaX = (event.clientX - pointerX) / rect.width;
    const deltaY = (event.clientY - pointerY) / rect.height;
    const x = Math.min(0.95, Math.max(0.05, startX + deltaX));
    const y = Math.min(0.95, Math.max(0.05, startY + deltaY));
    dragPreview = { ...dragPreview, [id]: { x, y } };
  };

  const endDrag = async () => {
    if (!dragContext) return;
    const { id } = dragContext;
    const preview = dragPreview[id];
    dragContext = null;
    if (preview) {
      await updateSticker(id, { x: preview.x, y: preview.y });
    }
    const { [id]: _, ...rest } = dragPreview;
    dragPreview = rest;
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (dragContext) {
      endDrag();
      event.currentTarget && (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    }
  };

  const applyThemeFromSettings = async () => {
    if (!browser) return;
    const themeId = $desktopSettings.themeId;
    if (!themeId) return;
    try {
      await loadThemeById(themeId);
      themeLoaded = true;
    } catch (error) {
      console.warn('Failed to load theme', error);
    }
  };

  const handleThemeChange = async (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    await updateSettings({ themeId: value });
    await loadThemeById(value);
    setStatus('Theme settled in.');
  };

  const handleSaveSound = () => {
    playSound('save');
    setStatus('Saved quietly.');
  };

  const handleNoteFocus = (id: string) => {
    selectedNoteId = id;
    playSound('click');
  };

  const addNewNote = async () => {
    const id = await createNote('New note');
    selectedNoteId = id;
    playSound('click');
    setStatus('Another layer added.');
  };

  const toggleAmbient = async () => {
    const next = !$desktopSettings.ambientMessages;
    await updateSettings({ ambientMessages: next });
    setStatus(next ? 'Ambient whispers restored.' : 'Ambient whispers paused.');
  };

  onMount(() => {
    if (!browser) return;
    void ensureSeedData().then(applyThemeFromSettings);
    void runEchoSweep().then((count) => {
      if (count > 0) {
        echoMessage = `Echo mode revisited ${count} note${count > 1 ? 's' : ''}. Would you write them differently now?`;
      }
    });

    const reflectionTimer = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() !== clock.getMinutes()) {
        ensureAudioContext();
        playClockTick();
      }
      clock = now;
      brightness = computeBrightness(now);
    }, 1000);

    brightness = computeBrightness(new Date());

    const pointerHandler = () => {
      ensureAudioContext();
    };
    window.addEventListener('pointerdown', pointerHandler, { once: true });

    const move = (event: PointerEvent) => updateDrag(event);
    const up = (event: PointerEvent) => handlePointerUp(event);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    return () => {
      clearInterval(reflectionTimer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  });

  onDestroy(() => {
    if (clearStatusTimeout) clearTimeout(clearStatusTimeout);
  });

  $: if (!themeLoaded && browser && $desktopSettings.themeId) {
    void applyThemeFromSettings();
  }

  $: brightnessStyle = `brightness(${brightness.toFixed(2)})`;
  $: themeIcons = ($currentTheme?.assets.icons) ?? {};
  $: stickerAssets = ($currentTheme?.assets.stickers) ?? [];
</script>

<div class="relative flex min-h-screen flex-col overflow-hidden">
  <div
    class="pointer-events-none absolute inset-0 bg-[color:var(--desk-bg,#f8f4e3)] transition-all duration-700"
    style={`filter:${brightnessStyle}`}
    aria-hidden="true"
  ></div>
  <main class="relative z-10 flex flex-1 flex-col">
    <header class="flex flex-wrap items-center justify-between gap-4 bg-white/60 px-6 py-4 backdrop-blur">
      <div class="flex items-center gap-3">
        <img src={themeIcons.note ?? ''} alt="Note icon" class="h-8 w-8" aria-hidden="true" />
        <div>
          <h1 class="font-display text-xl text-[color:var(--ink,#1f1b2c)]">GeoNotes 98</h1>
          <p class="text-xs text-[color:var(--ink,#1f1b2c)]/70">Geo-notes are yours alone. Create at your pace.</p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-sm text-[color:var(--ink,#1f1b2c)]">
        <div class="rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/60 px-3 py-1 shadow-sm">
          {formatClock()}
        </div>
        <AmbientMessage enabled={$desktopSettings.ambientMessages} />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/70 px-3 py-1 text-sm text-[color:var(--ink,#1f1b2c)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          type="button"
          on:click={addNewNote}
        >
          New note
        </button>
        <button
          class="rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/70 px-3 py-1 text-sm text-[color:var(--ink,#1f1b2c)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          type="button"
          on:click={() => void exportToHtml()}
        >
          Export desk
        </button>
        <button
          class="rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/70 px-3 py-1 text-sm text-[color:var(--ink,#1f1b2c)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          type="button"
          on:click={toggleAmbient}
        >
          {$desktopSettings.ambientMessages ? 'Pause ambient' : 'Resume ambient'}
        </button>
        <label class="sr-only" for="theme-select">Theme</label>
        <select
          id="theme-select"
          class="rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/80 px-3 py-1 text-sm text-[color:var(--ink,#1f1b2c)] shadow-sm focus:outline-none focus-visible:ring"
          on:change={handleThemeChange}
          bind:value={$desktopSettings.themeId}
        >
          {#each $themeRegistry as item}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
      </div>
    </header>

    <section class="relative flex flex-1 flex-col gap-6 overflow-hidden px-6 py-8">
      {#if statusMessage}
        <div class="self-center rounded-full bg-white/70 px-4 py-2 text-xs uppercase tracking-widest text-[color:var(--ink,#1f1b2c)] shadow-sm">
          {statusMessage}
        </div>
      {/if}
      {#if echoMessage}
        <div class="self-center rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/70 px-4 py-2 text-sm text-[color:var(--ink,#1f1b2c)] shadow-sm">
          {echoMessage}
        </div>
      {/if}
      <div class="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {#each $notesStore as note (note.id)}
          <NoteWindow
            {note}
            selected={note.id === selectedNoteId}
            on:focus={(event) => handleNoteFocus(event.detail.id)}
            on:save={async (event) => {
              await updateNote(event.detail.id, event.detail.changes);
            }}
            on:savesound={handleSaveSound}
            on:remove={async (event) => {
              await deleteNote(event.detail.id);
              setStatus('There\'s time to return.');
            }}
          />
        {/each}
      </div>
      <div class="relative mt-8 flex min-h-[220px] flex-col gap-3 rounded-2xl border border-[color:var(--accent-soft,#9ccfd8)] bg-white/60 p-4 shadow-inner" bind:this={board}>
        <div class="flex flex-wrap items-center gap-3">
          <img src={themeIcons.sticker ?? ''} alt="Sticker icon" class="h-6 w-6" aria-hidden="true" />
          <h2 class="font-semibold text-[color:var(--ink,#1f1b2c)]">Sticker drawer</h2>
          <p class="text-xs text-[color:var(--ink,#1f1b2c)]/70">They drift when idle. Add as many as you like.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          {#each stickerAssets as asset}
            <button
              type="button"
              class="rounded border border-[color:var(--accent-soft,#9ccfd8)] bg-white/70 px-2 py-1 text-xs text-[color:var(--ink,#1f1b2c)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              on:click={() => {
                void addSticker(asset);
                playSound('click');
              }}
            >
              Add sticker
            </button>
          {/each}
          {#if stickerAssets.length === 0}
            <p class="text-xs text-[color:var(--ink,#1f1b2c)]/70">Load a theme with stickers to decorate your desk.</p>
          {/if}
        </div>
        <div class="relative flex-1 overflow-hidden rounded-xl border border-dashed border-[color:var(--accent-soft,#9ccfd8)] bg-white/40">
          {#each $stickersStore as sticker (sticker.id)}
            {#key sticker.id}
              <div
                class={`group absolute flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center transition ${
                  dragContext && dragContext.id === sticker.id ? 'cursor-grabbing' : ''
                }`}
                style={`left:${((dragPreview[sticker.id]?.x ?? sticker.x) * 100).toFixed(2)}%;top:${((dragPreview[sticker.id]?.y ?? sticker.y) * 100).toFixed(2)}%;transform:translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale});`}
                on:pointerdown={(event) => startDrag(event, sticker)}
                on:pointermove={updateDrag}
                on:pointerup={handlePointerUp}
                aria-label="Sticker"
              >
                <img
                  src={sticker.asset}
                  alt="Desk sticker"
                  class={`pointer-events-none h-full w-full select-none rounded-xl border border-transparent object-contain ${
                    dragContext && dragContext.id === sticker.id ? '' : 'animate-drift'
                  }`}
                />
                <button
                  type="button"
                  class="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs text-[color:var(--ink,#1f1b2c)] shadow group-hover:flex"
                  aria-label="Remove sticker"
                  on:click={() => removeSticker(sticker.id)}
                >
                  ✕
                </button>
              </div>
            {/key}
          {/each}
        </div>
      </div>
    </section>
  </main>
</div>
