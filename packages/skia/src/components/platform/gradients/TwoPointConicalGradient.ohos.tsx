/**
 * TwoPointConicalGradient 渐变组件 - HarmonyOS 实现
 */
import React from 'react';
import { TwoPointConicalGradient as TwoPointConicalGradientBase } from '@react-native-ohos/react-native-skia';

export const TwoPointConicalGradientOHOS = (props: React.ComponentProps<typeof TwoPointConicalGradientBase>) =>
  React.createElement(TwoPointConicalGradientBase, props);
