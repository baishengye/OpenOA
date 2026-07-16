/**
 * LinearGradient 线性渐变组件
 */
import React from 'react';
import { LinearGradient as LinearGradientBase } from '@shopify/react-native-skia';

export const LinearGradient = (props: React.ComponentProps<typeof LinearGradientBase>) =>
  React.createElement(LinearGradientBase, props);
