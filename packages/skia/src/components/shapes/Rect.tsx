/**
 * Rect 矩形组件封装
 * 支持 stroke 属性
 */

import React from 'react';
import { Rect as RectBase } from '@shopify/react-native-skia';
import type { RectProps as RectBaseProps } from '../../types';

export const Rect = (props: RectBaseProps) => {
  const { stroke, ...rest } = props;

  if (stroke) {
    return (
      <RectBase
        {...rest}
        style="stroke"
        strokeWidth={stroke.width ?? 1}
        color={stroke.color ?? props.color ?? 'black'}
      />
    );
  }

  return <RectBase {...rest} />;
};

Rect.displayName = 'Rect';
