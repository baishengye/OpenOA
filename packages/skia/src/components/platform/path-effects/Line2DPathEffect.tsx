/**
 * Line2DPathEffect 2D 线条路径效果
 */
import React from 'react';
import { Line2DPathEffect as Line2DPathEffectBase } from '@shopify/react-native-skia';

export const Line2DPathEffect = (props: React.ComponentProps<typeof Line2DPathEffectBase>) =>
  React.createElement(Line2DPathEffectBase, props);
