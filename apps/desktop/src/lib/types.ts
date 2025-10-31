export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  echoParentId?: string;
  lastEchoCheck?: string;
}

export interface StickerRecord {
  id: string;
  asset: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export type ThemeTokens = Record<string, string>;

export interface ThemeSoundpack {
  click?: string;
  save?: string;
  [name: string]: string | undefined;
}

export interface ThemePack {
  id: string;
  name: string;
  tokens: ThemeTokens;
  assets: {
    windowChrome?: string;
    icons?: Record<string, string>;
    stickers?: string[];
    soundpack?: ThemeSoundpack;
  };
}

export interface DesktopSettings {
  themeId: string;
  ambientMessages: boolean;
  clock24h: boolean;
}
