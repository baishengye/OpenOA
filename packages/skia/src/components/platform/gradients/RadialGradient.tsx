/**
 * RadialGradient 径向渐变组件
 */
import React from 'react';
import { RadialGradient as RadialGradientBase } from '@shopify/react-native-skia';

export const RadialGradient = (props: React.ComponentProps<typeof RadialGradientBase>) =>
  React.createElement(RadialGradientBase, props);
