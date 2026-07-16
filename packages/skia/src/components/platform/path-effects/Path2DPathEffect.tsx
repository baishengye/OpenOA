/**
 * Path2DPathEffect 2D 路径效果
 */
import React from 'react';
import { Path2DPathEffect as Path2DPathEffectBase } from '@shopify/react-native-skia';

export const Path2DPathEffect = (props: React.ComponentProps<typeof Path2DPathEffectBase>) =>
  React.createElement(Path2DPathEffectBase, props);
