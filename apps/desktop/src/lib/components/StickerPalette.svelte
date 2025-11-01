<script lang="ts">
        import { createEventDispatcher } from 'svelte';

        export let stickers: string[] = [];

        const dispatch = createEventDispatcher<{ select: { asset: string; label: string } }>();

        function handleSelect(asset: string, index: number) {
                dispatch('select', { asset, label: `Sticker ${index + 1}` });
        }
</script>

<div class="flex flex-wrap gap-3 p-4">
        {#each stickers as sticker, index (sticker)}
                <button
                        type="button"
                        class="group flex h-20 w-20 items-center justify-center rounded-lg border border-[#cfc5b6] bg-[#fffcf3]/90 shadow-sticker transition hover:-translate-y-1 hover:shadow-[4px_6px_0_rgba(39,33,60,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b8bff]/70"
                        onclick={() => handleSelect(sticker, index)}
                        aria-label={`Add sticker ${index + 1}`}
                >
                        <img src={sticker} alt="" class="max-h-14 max-w-14" loading="lazy" draggable={false} />
                </button>
        {:else}
                <p class="text-sm text-[#6f6874]">No stickers packed in this theme yet.</p>
        {/each}
</div>
