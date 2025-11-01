<script lang="ts">
        import { createEventDispatcher } from 'svelte';
        import WindowChrome from './WindowChrome.svelte';
        import type { ThemePack } from '$lib/types';

        export let themes: ThemePack[] = [];
        export let selectedId: string | null = null;
        export let open = false;

        const dispatch = createEventDispatcher<{ choose: { id: string }; close: void }>();

        function choose(id: string) {
                dispatch('choose', { id });
        }

        function closeDrawer(event: Event) {
                if (event.target === event.currentTarget) {
                        dispatch('close');
                }
        }

        function handleOverlayKey(event: KeyboardEvent) {
                if (event.key === 'Escape') {
                        dispatch('close');
                }
        }
</script>

{#if open}
        <div
                class="fixed inset-0 z-40 flex items-start justify-center bg-black/35 backdrop-blur-sm"
                role="button"
                tabindex="0"
                aria-label="Close theme drawer"
                onclick={closeDrawer}
                onkeydown={handleOverlayKey}
        >
                <div class="mt-12 w-full max-w-xl">
                        <WindowChrome title="Theme Drawer" ariaLabel="Theme selection" floating>
                                <div class="flex flex-col gap-4 p-6">
                                        <p class="text-sm text-[#4a425b]">
                                                Swap the atmosphere. Each palette keeps the handmade imperfections that make GeoNotes 98 feel lived-in.
                                        </p>
                                        <ul class="space-y-3">
                                                {#each themes as theme (theme.id)}
                                                        <li>
                                                                <button
                                                                        type="button"
                                                                        class={`flex w-full items-center justify-between rounded border px-4 py-3 text-left transition ${
                                                                                theme.id === selectedId
                                                                                        ? 'border-[#6b8bff] bg-white/90 shadow-inner'
                                                                                        : 'border-[#d2c9c0] bg-[#fffcf3]/90 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(39,33,60,0.35)]'
                                                                        }`}
                                                                        onclick={() => choose(theme.id)}
                                                                >
                                                                        <span>
                                                                                <span class="block font-semibold text-[#382f57]">{theme.name}</span>
                                                                                <span class="block text-xs uppercase tracking-[0.3em] text-[#8a8494]">{theme.id}</span>
                                                                        </span>
                                                                        <span class="h-6 w-6 rounded-full border border-[#52496a]" style={`background:${theme.tokens['--accent'] ?? '#6b8bff'}`}></span>
                                                                </button>
                                                        </li>
                                                {/each}
                                        </ul>
                                </div>
                        </WindowChrome>
                </div>
        </div>
{/if}
