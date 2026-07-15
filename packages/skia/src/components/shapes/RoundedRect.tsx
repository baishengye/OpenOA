/**
 * RoundedRect 圆角矩形组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { RoundedRect as RoundedRectBase } from '@shopify/react-native-skia';

export const RoundedRect = (props: React.ComponentProps<typeof RoundedRectBase> & {
  stroke?: { width?: number; color?: string };
}) => {
  const { stroke, ...rest } = props;

  if (stroke) {
    const { r, ...rectProps } = rest as any;
    return (
      <RoundedRectBase
        {...rectProps}
        style="stroke"
        strokeWidth={stroke.width ?? 1}
        color={stroke.color ?? (rest as any).color ?? 'black'}
      />
    );
  }

  return <RoundedRectBase {...rest} />;
};

RoundedRect.displayName = 'RoundedRect';
