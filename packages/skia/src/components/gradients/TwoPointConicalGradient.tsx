/**
 * TwoPointConicalGradient 双点圆锥渐变封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { TwoPointConicalGradient as TwoPointConicalGradientBase } from '@shopify/react-native-skia';

export const TwoPointConicalGradient = (props: React.ComponentProps<typeof TwoPointConicalGradientBase>) =>
  React.createElement(TwoPointConicalGradientBase, props);
