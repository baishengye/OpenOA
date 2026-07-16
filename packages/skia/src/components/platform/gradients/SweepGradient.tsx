/**
 * SweepGradient 扫描渐变组件
 */
import React from 'react';
import { SweepGradient as SweepGradientBase } from '@shopify/react-native-skia';

export const SweepGradient = (props: React.ComponentProps<typeof SweepGradientBase>) =>
  React.createElement(SweepGradientBase, props);
