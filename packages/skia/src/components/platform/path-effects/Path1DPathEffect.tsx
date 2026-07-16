/**
 * Path1DPathEffect 1D 路径效果
 */
import React from 'react';
import { Path1DPathEffect as Path1DPathEffectBase } from '@shopify/react-native-skia';

export const Path1DPathEffect = (props: React.ComponentProps<typeof Path1DPathEffectBase>) =>
  React.createElement(Path1DPathEffectBase, props);
