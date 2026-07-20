import React, { type ReactNode } from 'react';
import { SizableText } from 'tamagui';
import type { TextStyle } from 'react-native';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

export interface TextProps {
  children?: ReactNode;
  /** 文本层级，决定字号/字重 */
  variant?: TextVariant;
  /** 覆盖颜色（语义色字符串或色值）；不传则跟随主题 */
  color?: string;
  numberOfLines?: number;
  textAlign?: 'left' | 'center' | 'right';
  /** 自定义字号 */
  fontSize?: number;
  /** 自定义字重 */
  fontWeight?: TextStyle['fontWeight'];
  /** 自定义行高 */
  lineHeight?: number;
  /** 自定义样式，优先级高于其他文本属性 */
  style?: TextStyle;
}

const SIZE = { h1: '$9', h2: '$7', h3: '$6', body: '$4', caption: '$2' } as const;
const WEIGHT = { h1: '700', h2: '600', h3: '600', body: '400', caption: '400' } as const;

/** 文本。variant 控制层级，颜色默认跟随主题。 */
export function Text({
  children,
  variant = 'body',
  color,
  numberOfLines,
  textAlign,
  fontSize,
  fontWeight,
  lineHeight,
  style,
}: TextProps) {
  return (
    <SizableText
      size={SIZE[variant]}
      fontWeight={fontWeight ?? WEIGHT[variant]}
      color={color}
      numberOfLines={numberOfLines}
      textAlign={textAlign}
      fontSize={fontSize}
      lineHeight={lineHeight}
      style={style}
    >
      {children}
    </SizableText>
  );
}
