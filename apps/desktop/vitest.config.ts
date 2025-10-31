import { sveltekit } from '@sveltejs/kit/vite';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit() as unknown as PluginOption],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom'
  }
});
