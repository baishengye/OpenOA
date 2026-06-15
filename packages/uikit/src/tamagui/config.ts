import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui, type TamaguiInternalConfig } from 'tamagui';

/**
 * 内部 tamagui 配置——仅供 UIProvider 使用，**绝不从 @itc/uikit 的 index 导出**。
 * 基于官方 v4 默认配置（含 light/dark themes、tokens、字体）。
 * 日后要换底层 / 自定义 tokens，只改这里。
 *
 * 显式注解 `TamaguiInternalConfig`：否则 createTamagui 的推断类型会引用 pnpm
 * 隔离的 @tamagui/web 路径，触发 TS2742（类型不可移植 / declaration 不可命名）。
 */
export const tamaguiConfig: TamaguiInternalConfig = createTamagui(defaultConfig);
