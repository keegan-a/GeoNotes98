<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { NoteRecord } from '$lib/types';

  export let note: NoteRecord;
  export let selected = false;

  const dispatch = createEventDispatcher<{
    focus: { id: string };
    save: { id: string; changes: Partial<NoteRecord> };
    remove: { id: string };
    savesound: { id: string };
  }>();

  let title = note.title;
  let content = note.content;
  let previousSignature = `${note.id}-${note.updatedAt}`;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  $: {
    const signature = `${note.id}-${note.updatedAt}`;
    if (signature !== previousSignature) {
      title = note.title;
      content = note.content;
      previousSignature = signature;
    }
  }

  const flushSave = () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    dispatch('save', { id: note.id, changes: { title, content } });
  };

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      flushSave();
      dispatch('savesound', { id: note.id });
    }, 800);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      flushSave();
      dispatch('savesound', { id: note.id });
    }
  };

  const handleFocus = () => {
    dispatch('focus', { id: note.id });
  };

  onDestroy(() => {
    if (saveTimer) clearTimeout(saveTimer);
  });
</script>

<article
  class={`note-window shadow-window flex h-80 w-80 flex-col overflow-hidden rounded-lg border border-[color:var(--accent-soft,#9ccfd8)] bg-[color:var(--window-bg,rgba(253,252,247,0.92))] transition-all duration-200 ${
    selected ? 'ring-2 ring-[color:var(--accent,#d182b0)]' : 'ring-0'
  }`}
  role="region"
  aria-label={`Note titled ${note.title || 'Untitled note'}`}
  on:focusin={handleFocus}
>
  <header class="flex items-center justify-between bg-[color:var(--accent-soft,#9ccfd8)]/50 px-3 py-2">
    <input
      class="w-full bg-transparent text-sm font-semibold text-[color:var(--ink,#1f1b2c)] outline-none focus:animate-glow"
      aria-label="Note title"
      bind:value={title}
      on:focus={handleFocus}
      on:keydown={handleKeydown}
      on:input={scheduleSave}
    />
    <button
      class="ml-2 rounded border border-[color:var(--accent-soft,#9ccfd8)] px-2 py-1 text-xs text-[color:var(--ink,#1f1b2c)] hover:bg-[color:var(--accent-soft,#9ccfd8)]/40 focus:outline-none focus-visible:ring focus-visible:ring-offset-1"
      type="button"
      on:click={() => dispatch('remove', { id: note.id })}
      aria-label="Delete note"
    >
      ✕
    </button>
  </header>
  <textarea
    class="flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed text-[color:var(--ink,#1f1b2c)] focus:outline-none"
    aria-label="Note content"
    bind:value={content}
    on:focus={handleFocus}
    on:keydown={handleKeydown}
    on:input={scheduleSave}
  ></textarea>
  <footer class="flex items-center justify-between border-t border-[color:var(--accent-soft,#9ccfd8)]/60 bg-white/30 px-3 py-1 text-[10px] uppercase tracking-widest text-[color:var(--ink,#1f1b2c)]/70">
    <span>{new Date(note.updatedAt).toLocaleString()}</span>
    <span>geo-notes</span>
  </footer>
</article>
