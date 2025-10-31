<script lang="ts">
        import { onDestroy, onMount } from 'svelte';
        import DesktopShell from '$lib/components/DesktopShell.svelte';
        import NoteList from '$lib/components/NoteList.svelte';
        import NoteWindow from '$lib/components/NoteWindow.svelte';
        import StickerCanvas from '$lib/components/StickerCanvas.svelte';
        import StickerPalette from '$lib/components/StickerPalette.svelte';
        import ThemeDrawer from '$lib/components/ThemeDrawer.svelte';
        import TaskbarClock from '$lib/components/TaskbarClock.svelte';
        import WindowChrome from '$lib/components/WindowChrome.svelte';
        import { initDatabase } from '$lib/db';
        import { notes as notesStore, createNote, updateNote, deleteNote, ensureEchoesForAll } from '$lib/stores/notes';
        import { stickers as stickersStore, addSticker, updateSticker, removeSticker } from '$lib/stores/stickers';
        import {
                listAvailableThemes,
                loadThemePack,
                restoreThemeFromSettings,
                themeState
        } from '$lib/features/themes';
        import type { Note, Sticker, ThemePack, ThemeSoundpack } from '$lib/types';
        import { createBundle, downloadBundle, extractBundle, importBundle } from '$lib/features/exporter';
        import { Howl } from 'howler';

        let noteList: Note[] = [];
        let stickerList: Sticker[] = [];
        let availableThemes: ThemePack[] = [];
        let themeDrawerOpen = false;
        let selectedNoteId: string | null = null;
        let isSaving = false;
        let saveIndicator: string | null = null;
        let currentThemeId: string | null = null;
        let stickerPalette: string[] = [];

        let saveSound: Howl | null = null;
        let clickSound: Howl | null = null;

        $: currentNote = noteList.find((note) => note.id === selectedNoteId) ?? noteList[0] ?? null;
        $: if (!selectedNoteId && noteList.length) {
                selectedNoteId = noteList[0].id;
        }

        function configureSoundpack(soundpack: ThemeSoundpack | undefined) {
                saveSound?.unload();
                clickSound?.unload();
                if (!soundpack) {
                        saveSound = null;
                        clickSound = null;
                        return;
                }
                if (soundpack.save) {
                        saveSound = new Howl({ src: [soundpack.save], volume: 0.35 });
                }
                if (soundpack.click) {
                        clickSound = new Howl({ src: [soundpack.click], volume: 0.2 });
                }
        }

        async function persistNote(title: string, content: string) {
                isSaving = true;
                const safeTitle = title || 'Untitled note';
                if (!currentNote) {
                        const id = await createNote({ title: safeTitle, content });
                        selectedNoteId = id;
                } else {
                        await updateNote(currentNote.id, { title: safeTitle, content });
                }
                saveSound?.play();
                saveIndicator = 'Saved quietly.';
                setTimeout(() => {
                        saveIndicator = null;
                }, 3200);
                isSaving = false;
        }

        async function handleSave(event: CustomEvent<{ title: string; content: string }>) {
                await persistNote(event.detail.title, event.detail.content);
        }

        async function handleNewNote() {
                const id = await createNote({ title: 'New page', content: '' });
                selectedNoteId = id;
                clickSound?.play();
        }

        async function handleDeleteNote() {
                if (!currentNote) return;
                await deleteNote(currentNote.id);
                selectedNoteId = noteList.find((note) => note.id !== currentNote?.id)?.id ?? null;
        }

        async function handleStickerAdd(event: CustomEvent<{ asset: string; label: string }>) {
                await addSticker({
                        asset: event.detail.asset,
                        label: event.detail.label,
                        x: 80 + Math.random() * 240,
                        y: 60 + Math.random() * 200,
                        rotation: (Math.random() - 0.5) * 10,
                        scale: 0.9 + Math.random() * 0.3
                });
                clickSound?.play();
        }

        function handleStickerMove(id: string, position: { x: number; y: number }) {
                void updateSticker(id, position);
        }

        function handleStickerRemove(id: string) {
                void removeSticker(id);
        }

        async function handleExport() {
                const bundle = await createBundle();
                downloadBundle(bundle);
                saveIndicator = 'Time capsule ready.';
                setTimeout(() => (saveIndicator = null), 3200);
        }

        async function handleImport(file: File) {
                try {
                        const text = await file.text();
                        const bundle = extractBundle(text);
                        await importBundle(bundle);
                        await restoreThemeFromSettings();
                        saveIndicator = 'Archive restored.';
                } catch (error) {
                        console.error('Failed to import GeoNotes export', error);
                        saveIndicator = 'Import could not be completed.';
                } finally {
                        setTimeout(() => (saveIndicator = null), 3600);
                }
        }

        async function handleThemeChoice(event: CustomEvent<{ id: string }>) {
                await loadThemePack(event.detail.id);
                themeDrawerOpen = false;
        }

        function handleThemeRequest() {
                themeDrawerOpen = true;
        }

        function handleNoteSelect(event: CustomEvent<{ id: string }>) {
                selectedNoteId = event.detail.id;
        }

        function handleKeydown(event: KeyboardEvent) {
                if (event.ctrlKey || event.metaKey) {
                        const key = event.key.toLowerCase();
                        if (key === 'n') {
                                event.preventDefault();
                                void handleNewNote();
                        }
                }
        }

        let notesUnsubscribe: (() => void) | undefined;
        let stickersUnsubscribe: (() => void) | undefined;
        let themeUnsubscribe: (() => void) | undefined;

        onMount(async () => {
                await initDatabase();
                availableThemes = listAvailableThemes();
                await restoreThemeFromSettings();

                notesUnsubscribe = notesStore.subscribe((value) => {
                        noteList = value;
                        void ensureEchoesForAll(value);
                });
                stickersUnsubscribe = stickersStore.subscribe((value) => {
                        stickerList = value;
                });
                themeUnsubscribe = themeState.subscribe(($theme) => {
                        configureSoundpack($theme.current?.assets.soundpack);
                        currentThemeId = $theme.current?.id ?? null;
                        stickerPalette = $theme.current?.assets.stickers ?? [];
                });
                window.addEventListener('keydown', handleKeydown);
        });

        onDestroy(() => {
                notesUnsubscribe?.();
                stickersUnsubscribe?.();
                themeUnsubscribe?.();
                window.removeEventListener('keydown', handleKeydown);
        });
</script>

<DesktopShell
        onExport={handleExport}
        onImport={handleImport}
        onThemeRequest={handleThemeRequest}
        {saveIndicator}
>
        <svelte:fragment slot="footer-end">
                <TaskbarClock />
        </svelte:fragment>

        <ThemeDrawer
                themes={availableThemes}
                selectedId={currentThemeId}
                open={themeDrawerOpen}
                on:choose={handleThemeChoice}
                on:close={() => (themeDrawerOpen = false)}
        />

        <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
                <WindowChrome title="Note index" ariaLabel="Note index" widthClass="w-full" heightClass="h-full">
                        <div class="flex h-full flex-col justify-between">
                                <div class="flex-1 overflow-y-auto">
                                        <NoteList notes={noteList} selectedId={currentNote?.id ?? null} on:select={handleNoteSelect} />
                                </div>
                                <div class="border-t border-dashed border-[#d9d2c8] p-3 text-xs text-[#746d7a]">
                                        <p>Ctrl/Cmd + N → New note</p>
                                        <p>Ctrl/Cmd + S → Save quietly</p>
                                </div>
                        </div>
                </WindowChrome>
                <div class="flex flex-col gap-6">
                        <NoteWindow
                                note={currentNote}
                                isSaving={isSaving}
                                lastSavedLabel={saveIndicator}
                                on:save={handleSave}
                                on:new={handleNewNote}
                                on:delete={handleDeleteNote}
                        />
                        <div class="grid gap-6 md:grid-cols-2">
                                <WindowChrome title="Sticker desk" ariaLabel="Sticker desk">
                                        <StickerCanvas
                                                stickers={stickerList}
                                                onMove={handleStickerMove}
                                                onRemove={handleStickerRemove}
                                        />
                                </WindowChrome>
                                <WindowChrome title="Palette" ariaLabel="Sticker palette">
                                        <StickerPalette stickers={stickerPalette} on:select={handleStickerAdd} />
                                </WindowChrome>
                        </div>
                </div>
        </div>
</DesktopShell>
