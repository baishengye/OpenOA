/**
 * SweepGradient 渐变组件 - HarmonyOS 实现
 */
import React from 'react';
import { SweepGradient as SweepGradientBase } from '@react-native-ohos/react-native-skia';

export const SweepGradientOHOS = (props: React.ComponentProps<typeof SweepGradientBase>) =>
  React.createElement(SweepGradientBase, props);
