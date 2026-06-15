import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from './tamagui/config';
import { ThemeModeContext, type ThemeMode } from './theme/context';

export interface UIProviderProps {
  children: ReactNode;
  /** 初始主题模式，默认 'light'。 */
  defaultMode?: ThemeMode;
}

/**
 * UI 根 Provider：注入主题（tamagui 在内部）+ 管理 light/dark 切换。
 * 业务只需在 App 根包一层 `<UIProvider>`，看不到 tamagui。
 */
export function UIProvider({ children, defaultMode = 'light' }: UIProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const toggle = useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    [],
  );
  const ctx = useMemo(() => ({ mode, setMode, toggle }), [mode, toggle]);

  return (
    <SafeAreaProvider>
      <ThemeModeContext.Provider value={ctx}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={mode}>
          {children}
        </TamaguiProvider>
      </ThemeModeContext.Provider>
    </SafeAreaProvider>
  );
}
