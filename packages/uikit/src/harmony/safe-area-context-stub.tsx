/**
 * react-native-safe-area-context 的纯 RN 降级 stub（仅鸿蒙）—— 自包含在 @itc/uikit。
 *
 * 背景：uikit 以 tamagui 为基座，tamagui 依赖 react-native-safe-area-context。其鸿蒙
 * 移植包 (@react-native-oh-tpl/...) 的 generated C++ 用了 RN 0.76 已移除的 `butter::map`，
 * 与 RN 0.82 + RNOH 不兼容、无法编译。
 *
 * 降级策略（不破坏任何库、不降 RN、不 patch 移植包）：宿主 app 的 metro.config.harmony
 * 在 harmony 平台把 'react-native-safe-area-context' 重定向到本 stub（重定向规则必须在
 * app —— metro 是宿主打包器配置，库无法自声明平台级依赖替换）。iOS/Android 仍用真 native 包。
 *
 * 代价：鸿蒙 safe-area insets 用状态栏高度的近似固定值，不随刘海/折叠态动态变化，
 * 但 tamagui 组件（Dialog 等）能正常渲染、不崩。
 *
 * 注意：本文件不从 @itc/uikit 的 index 导出，是 internal 降级实现，业务看不到。
 */
import React, { type ComponentType, type ReactNode } from 'react';
import { StatusBar, View, type ViewProps } from 'react-native';

export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const INSETS: EdgeInsets = {
  top: StatusBar.currentHeight ?? 0,
  right: 0,
  bottom: 0,
  left: 0,
};
const FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const SafeAreaInsetsContext = React.createContext<EdgeInsets | null>(INSETS);
export const SafeAreaFrameContext = React.createContext<Rect | null>(FRAME);

export const initialWindowMetrics = { insets: INSETS, frame: FRAME };

export function SafeAreaProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function SafeAreaView(props: ViewProps & { edges?: unknown }) {
  const { edges: _edges, ...rest } = props;
  return <View {...rest} />;
}

export function useSafeAreaInsets(): EdgeInsets {
  return INSETS;
}
export function useSafeAreaFrame(): Rect {
  return FRAME;
}

export const SafeAreaConsumer = SafeAreaInsetsContext.Consumer;

export function withSafeAreaInsets<P>(Comp: ComponentType<P>) {
  return Comp;
}

// 兼容旧 API 名（部分库引用）。
export const SafeAreaContext = SafeAreaInsetsContext;
export const useSafeArea = useSafeAreaInsets;
