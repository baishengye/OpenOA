/**
 * RadialGradient 渐变组件 - HarmonyOS 实现
 */
import React from 'react';
import { RadialGradient as RadialGradientBase } from '@react-native-ohos/react-native-skia';

export const RadialGradientOHOS = (props: React.ComponentProps<typeof RadialGradientBase>) =>
  React.createElement(RadialGradientBase, props);
