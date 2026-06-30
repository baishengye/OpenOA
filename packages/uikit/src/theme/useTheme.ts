import { useContext } from 'react';
import { useTheme as useTamaguiTheme } from 'tamagui';
import { ThemeModeContext, type ThemeMode } from './context';

/**
 * 封装的语义色——业务用这些字段，不直接碰 tamagui token。
 * 取自当前 tamagui 主题（随 light/dark 切换变化）。
 */
export interface ThemeColors {
  /** 页面背景 */
  background: string;
  /** 主文本色 */
  color: string;
  /** 次要文本色 */
  colorSecondary: string;
  /** 主题强调色（按钮等） */
  primary: string;
  /** 边框/分割线 */
  border: string;
}

export interface UseThemeResult {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  colors: ThemeColors;
}

/** 读取当前主题模式 + 语义色，并可切换主题。 */
export function useTheme(): UseThemeResult {
  const { mode, setMode, toggle } = useContext(ThemeModeContext);
  const t = useTamaguiTheme();

  const colors: ThemeColors = {
    background: t.background?.val ?? (mode === 'dark' ? '#1c1c1e' : '#ffffff'),
    color: t.color?.val ?? (mode === 'dark' ? '#ffffff' : '#1f2329'),
    colorSecondary: t.color05?.val ?? '#646a73',
    primary: t.blue10?.val ?? '#2563eb',
    border: t.borderColor?.val ?? (mode === 'dark' ? '#3a3a3c' : '#e5e6eb'),
  };

  return { mode, setMode, toggle, colors };
}
