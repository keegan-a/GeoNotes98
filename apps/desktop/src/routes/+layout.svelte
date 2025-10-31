<script lang="ts">
  import '../app.postcss';
  import favicon from '$lib/assets/favicon.svg';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta
    name="description"
    content="GeoNotes 98 — a retro desktop for mindful journaling, sketching, and quietly joyful creation."
  />
</svelte:head>

{@render children()}
