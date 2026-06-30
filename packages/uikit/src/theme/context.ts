import { createContext } from 'react';

/** 主题模式：浅色 / 深色。 */
export type ThemeMode = 'light' | 'dark';

export interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

/** 主题模式上下文——由 UIProvider 提供，useTheme 消费。 */
export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'light',
  setMode: () => {},
  toggle: () => {},
});
