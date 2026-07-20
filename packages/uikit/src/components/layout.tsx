import React, { type ReactNode } from 'react';
import { View, Separator } from 'tamagui';
import type { ViewStyle } from 'react-native';

export type Align = 'flex-start' | 'center' | 'flex-end' | 'stretch';
export type Justify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around';

export interface StackProps {
  children?: ReactNode;
  gap?: number;
  padding?: number;
  flex?: number;
  align?: Align;
  justify?: Justify;
  backgroundColor?: string;
  borderRadius?: number;
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
  /** 最大宽度 */
  maxWidth?: number | string;
  /** 溢出处理 */
  overflow?: 'visible' | 'hidden' | 'scroll';
  /** 内联样式 */
  style?: ViewStyle;
}

function base(p: StackProps) {
  return {
    gap: p.gap,
    padding: p.padding,
    flex: p.flex,
    alignItems: p.align,
    justifyContent: p.justify,
    backgroundColor: p.backgroundColor,
    borderRadius: p.borderRadius,
    width: p.width,
    height: p.height,
    maxWidth: p.maxWidth,
    overflow: p.overflow,
    style: p.style,
  };
}

/** 纵向堆叠容器 */
export function YStack({ children, ...p }: StackProps) {
  return (
    <View flexDirection="column" {...base(p)}>
      {children}
    </View>
  );
}

/** 横向堆叠容器 */
export function XStack({ children, ...p }: StackProps) {
  return (
    <View flexDirection="row" {...base(p)}>
      {children}
    </View>
  );
}

/** 通用容器（YStack 别名） */
export const Stack = YStack;

export interface DividerProps {
  vertical?: boolean;
}

/** 分割线 */
export function Divider({ vertical }: DividerProps) {
  return <Separator vertical={vertical} />;
}
