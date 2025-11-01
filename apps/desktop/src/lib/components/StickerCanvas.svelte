<script lang="ts">
        import type { Sticker } from '$lib/types';

        export let stickers: Sticker[] = [];
        export let onMove: (id: string, position: { x: number; y: number }) => void;
        export let onRemove: (id: string) => void;

        function handlePointerDown(event: PointerEvent, sticker: Sticker) {
                event.preventDefault();
                const startX = event.clientX;
                const startY = event.clientY;
                const originX = sticker.x;
                const originY = sticker.y;

                function handlePointerMove(moveEvent: PointerEvent) {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;
                        onMove(sticker.id, { x: originX + deltaX, y: originY + deltaY });
                }

                function handlePointerUp(upEvent: PointerEvent) {
                        upEvent.preventDefault();
                        window.removeEventListener('pointermove', handlePointerMove);
                        window.removeEventListener('pointerup', handlePointerUp);
                }

                window.addEventListener('pointermove', handlePointerMove);
                window.addEventListener('pointerup', handlePointerUp, { once: true });
        }
</script>

<div class="relative h-full w-full overflow-hidden rounded-lg border border-dashed border-[#cfc5b6] bg-[#f7f3eb]/70">
        {#each stickers as sticker (sticker.id)}
                <article
                        role="group"
                        aria-label={`Sticker ${sticker.label}`}
                        class="absolute origin-center cursor-grab select-none rounded-lg p-2 transition-transform duration-300 ease-out hover:z-20"
                        style={`left:${sticker.x}px; top:${sticker.y}px; transform: rotate(${sticker.rotation}deg) scale(${sticker.scale}); animation: drift 16s ease-in-out infinite; animation-delay: -${sticker.driftSeed * 16}s;`}
                        onpointerdown={(event) => handlePointerDown(event, sticker)}
                >
                        <img src={sticker.asset} alt="" class="pointer-events-none block max-w-[140px]" draggable={false} />
                        <div class="mt-2 flex items-center justify-end gap-2">
                                <button
                                        type="button"
                                        class="rounded bg-white/80 px-2 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[#4c4666] shadow-sticker"
                                        onclick={() => onRemove(sticker.id)}
                                >
                                        Remove
                                </button>
                        </div>
                </article>
        {/each}
</div>
