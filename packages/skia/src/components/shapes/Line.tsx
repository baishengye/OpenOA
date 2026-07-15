/**
 * Line 直线组件封装
 * 支持 stroke 属性
 */

import React from 'react';
import { Line as LineBase } from '@shopify/react-native-skia';
import type { SkPoint } from '../../types';

export interface LineProps {
  p1: SkPoint;
  p2: SkPoint;
  color?: string;
  strokeStyle?: {
    width?: number;
    color?: string;
    cap?: 'butt' | 'round' | 'square';
    join?: 'miter' | 'round' | 'bevel';
  };
  children?: React.ReactNode;
}

const Line = (props: LineProps) => {
  const { strokeStyle, ...rest } = props;

  // 如果使用 strokeStyle 属性
  if (strokeStyle) {
    return (
      <LineBase
        p1={props.p1}
        p2={props.p2}
        color={strokeStyle.color || props.color || 'black'}
        strokeWidth={strokeStyle.width ?? 1}
      />
    );
  }

  return <LineBase {...rest} />;
};

Line.displayName = 'Line';

export { Line };

