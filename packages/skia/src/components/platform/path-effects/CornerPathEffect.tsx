/**
 * CornerPathEffect 圆角路径效果
 */
import React from 'react';
import { CornerPathEffect as CornerPathEffectBase } from '@shopify/react-native-skia';

export const CornerPathEffect = (props: React.ComponentProps<typeof CornerPathEffectBase>) =>
  React.createElement(CornerPathEffectBase, props);
