/**
 * Line2DPathEffect 2D 直线效果封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Line2DPathEffect as Line2DPathEffectBase } from '@shopify/react-native-skia';

export const Line2DPathEffect = (props: React.ComponentProps<typeof Line2DPathEffectBase>) =>
  React.createElement(Line2DPathEffectBase, props);
