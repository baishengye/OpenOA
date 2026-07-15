/**
 * CornerPathEffect 圆角路径效果封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { CornerPathEffect as CornerPathEffectBase } from '@shopify/react-native-skia';

export const CornerPathEffect = (props: React.ComponentProps<typeof CornerPathEffectBase>) =>
  React.createElement(CornerPathEffectBase, props);
