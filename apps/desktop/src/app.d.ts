// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
        namespace App {
                // interface Error {}
                // interface Locals {}
                // interface PageData {}
                // interface PageState {}
                // interface Platform {}
        }
}

declare module '@tauri-apps/api/dialog' {
        export interface SaveDialogOptions {
                defaultPath?: string;
                filters?: { name: string; extensions: string[] }[];
        }

        export function save(options: SaveDialogOptions): Promise<string | null>;
}

declare module '@tauri-apps/api/fs' {
        export function writeTextFile(path: string, contents: string): Promise<void>;
}

export {};
