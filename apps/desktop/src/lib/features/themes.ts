import { browser } from '$app/environment';
import { getSetting, setSetting } from '$lib/db';
import type { ThemePack, ThemeSoundpack, ThemeState, ThemeTokens } from '$lib/types';
import { writable } from 'svelte/store';

interface ThemeManifestModule {
        default: ThemePack;
}

interface ThemeResource {
        manifest: ThemePack;
        baseHref: string;
        normalizedPath: string;
}

const manifestModules = import.meta.glob<ThemeManifestModule>('../assets/**/theme.json', { eager: true });

const registry: ThemeResource[] = Object.entries(manifestModules).map(([path, module]) => {
        const manifest = module.default;
        const normalizedPath = `/src/lib/${path.replace('../', '')}`;
        const themeUrl = new URL(path.replace('../', './'), import.meta.url);
        const baseHref = new URL('./', themeUrl).href;
        return { manifest, baseHref, normalizedPath };
});

function resolveAsset(baseHref: string, input: string): string {
        const cleaned = input.replace(/^\.\//, '');
        return new URL(cleaned, baseHref).href;
}

function resolveTokens(baseHref: string, tokens: ThemeTokens): ThemeTokens {
        const resolved: ThemeTokens = {};
        const urlPattern = /url\(([^)]+)\)/g;
        for (const [key, value] of Object.entries(tokens)) {
                if (typeof value === 'string') {
                        const replaced = value.replace(urlPattern, (_full: string, match: string) => {
                                const cleaned = match.trim().replace(/^['"]|['"]$/g, '');
                                if (/^(data:|https?:)/.test(cleaned)) {
                                        return `url('${cleaned}')`;
                                }
                                const resolvedUrl = resolveAsset(baseHref, cleaned);
                                return `url('${resolvedUrl}')`;
                        });
                        resolved[key] = replaced;
                }
        }
        return resolved;
}

function normalizeKey(identifier: string): string {
        if (identifier.startsWith('/src/lib/')) {
                return identifier;
        }
        const matched = registry.find((entry) => entry.manifest.id === identifier);
        if (matched) {
                return matched.normalizedPath;
        }
        return identifier;
}

export const themeState = writable<ThemeState>({});

export async function applyTheme(theme: ThemePack) {
        if (!browser) return;
        const root = document.documentElement;
        const resolvedTokens = theme.tokens;
        for (const [key, value] of Object.entries(resolvedTokens)) {
                root.style.setProperty(key, value);
        }
        if (theme.assets.windowChrome) {
                root.style.setProperty('--window-chrome', `url('${theme.assets.windowChrome}')`);
        }
        await setSetting('themeId', theme.id);
        themeState.set({ current: theme, paletteName: theme.name });
}

export function listAvailableThemes(): ThemePack[] {
        return registry.map((entry) => ({ ...entry.manifest }));
}

export async function loadThemePack(identifier: string): Promise<ThemePack | null> {
        const normalized = normalizeKey(identifier);
        const entry = registry.find(
                (candidate) => candidate.normalizedPath === normalized || candidate.manifest.id === identifier
        );
        if (!entry) {
                console.warn(`Theme ${identifier} was not found.`);
                return null;
        }

        const resolvedTokens = resolveTokens(entry.baseHref, entry.manifest.tokens);
        const windowChrome = entry.manifest.assets.windowChrome
                ? resolveAsset(entry.baseHref, entry.manifest.assets.windowChrome)
                : undefined;
        const stickers = entry.manifest.assets.stickers?.map((asset) => resolveAsset(entry.baseHref, asset)) ?? [];
        let soundpack: ThemeSoundpack | undefined;
        if (entry.manifest.assets.soundpack) {
                const resolvedSounds: ThemeSoundpack = {};
                for (const [key, rel] of Object.entries(entry.manifest.assets.soundpack) as Array<[
                        keyof ThemeSoundpack,
                        string | undefined
                ]>) {
                        if (!rel) continue;
                        resolvedSounds[key] = resolveAsset(entry.baseHref, rel);
                }
                soundpack = resolvedSounds;
        }

        const theme: ThemePack = {
                ...entry.manifest,
                tokens: resolvedTokens,
                assets: {
                        ...entry.manifest.assets,
                        windowChrome,
                        stickers,
                        soundpack
                }
        };
        await applyTheme(theme);
        return theme;
}

export async function restoreThemeFromSettings() {
        const storedId = await getSetting<string>('themeId', registry[0]?.manifest.id ?? '');
        if (!storedId) return;
        await loadThemePack(storedId);
}
