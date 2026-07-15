/**
 * Path1DPathEffect 路径沿路径效果封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Path1DPathEffect as Path1DPathEffectBase } from '@shopify/react-native-skia';

export const Path1DPathEffect = (props: React.ComponentProps<typeof Path1DPathEffectBase>) =>
  React.createElement(Path1DPathEffectBase, props);
