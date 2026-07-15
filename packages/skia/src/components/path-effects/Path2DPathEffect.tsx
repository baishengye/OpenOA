/**
 * Path2DPathEffect 2D 路径效果封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Path2DPathEffect as Path2DPathEffectBase } from '@shopify/react-native-skia';

export const Path2DPathEffect = (props: React.ComponentProps<typeof Path2DPathEffectBase>) =>
  React.createElement(Path2DPathEffectBase, props);
