<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  import { randomReflection } from '$lib/features/messages/reflections';

  export let enabled = true;

  let message = randomReflection();
  let visible = true;
  let timer: ReturnType<typeof setInterval> | null = null;
  let swapTimeout: ReturnType<typeof setTimeout> | null = null;

  const startCycle = () => {
    timer = setInterval(() => {
      visible = false;
      swapTimeout = setTimeout(() => {
        message = randomReflection();
        visible = true;
      }, 1200);
    }, 45000);
  };

  onMount(() => {
    if (enabled) {
      startCycle();
    }
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
    if (swapTimeout) clearTimeout(swapTimeout);
  });

  $: if (enabled) {
    if (!timer) {
      startCycle();
    }
  } else {
    visible = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (swapTimeout) {
      clearTimeout(swapTimeout);
      swapTimeout = null;
    }
  }
</script>

<div class="pointer-events-none select-none text-sm text-[color:var(--ink,#1f1b2c)]" aria-live="polite">
  {#if enabled && visible}
    <div
      class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm backdrop-blur"
      transition:fade={{ duration: 900 }}
    >
      <span aria-hidden="true">✶</span>
      <span>{message}</span>
    </div>
  {/if}
</div>
