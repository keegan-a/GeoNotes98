<script lang="ts">
        import type { Snippet } from 'svelte';
        import '../app.css';
        import favicon from '$lib/assets/favicon.svg';

        export let children: Snippet;
</script>

<svelte:head>
        <link rel="icon" href={favicon} />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f4efe4" />
</svelte:head>

{@render children()}
