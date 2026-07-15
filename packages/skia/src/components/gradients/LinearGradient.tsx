/**
 * LinearGradient 线性渐变封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { LinearGradient as LinearGradientBase } from '@shopify/react-native-skia';

export const LinearGradient = (props: React.ComponentProps<typeof LinearGradientBase>) =>
  React.createElement(LinearGradientBase, props);
