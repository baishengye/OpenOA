import React, { type ReactNode } from 'react';
import { SizableText } from 'tamagui';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

export interface TextProps {
  children?: ReactNode;
  /** 文本层级，决定字号/字重 */
  variant?: TextVariant;
  /** 覆盖颜色（语义色字符串或色值）；不传则跟随主题 */
  color?: string;
  numberOfLines?: number;
  textAlign?: 'left' | 'center' | 'right';
}

const SIZE = { h1: '$9', h2: '$7', h3: '$6', body: '$4', caption: '$2' } as const;
const WEIGHT = { h1: '700', h2: '600', h3: '600', body: '400', caption: '400' } as const;

/** 文本。variant 控制层级，颜色默认跟随主题。 */
export function Text({ children, variant = 'body', color, numberOfLines, textAlign }: TextProps) {
  return (
    <SizableText
      size={SIZE[variant]}
      fontWeight={WEIGHT[variant]}
      color={color}
      numberOfLines={numberOfLines}
      textAlign={textAlign}
    >
      {children}
    </SizableText>
  );
}
