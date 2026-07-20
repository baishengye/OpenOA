import React, { type ReactNode } from 'react';
import { Card as TCard, Avatar as TAvatar, Spinner as TSpinner, View, SizableText } from 'tamagui';
import type { ViewStyle } from 'react-native';

// ── Card ──────────────────────────────────────────────────────────────────────
export interface CardProps {
  children?: ReactNode;
  padding?: number;
  onPress?: () => void;
  /** 自定义背景色 */
  backgroundColor?: string;
  /** 自定义圆角 */
  borderRadius?: number;
  /** 自定义样式 */
  style?: ViewStyle;
}
/** 卡片容器（带边框 + 圆角） */
export function Card({ children, padding = 16, onPress, backgroundColor, borderRadius, style }: CardProps) {
  return (
    <TCard
      borderWidth={1}
      borderColor="$borderColor"
      padding={padding}
      borderRadius={borderRadius ?? '$4'}
      onPress={onPress}
      backgroundColor={backgroundColor}
      style={style}
    >
      {children}
    </TCard>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
export interface BadgeProps {
  children?: ReactNode;
  tone?: BadgeTone;
}
const BADGE_BG: Record<BadgeTone, string> = {
  info: '$blue9',
  success: '$green9',
  warning: '$yellow9',
  danger: '$red9',
  neutral: '$gray9',
};
/** 小角标 */
export function Badge({ children, tone = 'info' }: BadgeProps) {
  return (
    <View
      backgroundColor={BADGE_BG[tone]}
      paddingHorizontal={8}
      paddingVertical={2}
      borderRadius={999}
      alignSelf="flex-start"
    >
      <SizableText size="$1" color="#fff">
        {children}
      </SizableText>
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export interface AvatarProps {
  src?: string;
  size?: number;
  /** 无图时的占位文字（如姓名首字） */
  fallback?: string;
}
/** 头像（圆形）。有 src 显图，否则显 fallback 文字。 */
export function Avatar({ src, size = 40, fallback }: AvatarProps) {
  return (
    <TAvatar circular size={size}>
      {src ? <TAvatar.Image accessibilityLabel="avatar" src={src} /> : null}
      <TAvatar.Fallback backgroundColor="$gray6" alignItems="center" justifyContent="center">
        <SizableText size="$3">{fallback}</SizableText>
      </TAvatar.Fallback>
    </TAvatar>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}
/** 加载指示器 */
export function Spinner({ size = 'small', color }: SpinnerProps) {
  return <TSpinner size={size} color={color} />;
}
