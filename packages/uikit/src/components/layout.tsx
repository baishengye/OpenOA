import React, { type ReactNode } from 'react';
import { View, Separator } from 'tamagui';

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
