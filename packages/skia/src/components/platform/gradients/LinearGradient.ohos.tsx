/**
 * LinearGradient 渐变组件 - HarmonyOS 实现
 */
import React from 'react';
import { LinearGradient as LinearGradientBase } from '@react-native-ohos/react-native-skia';

export const LinearGradientOHOS = (props: React.ComponentProps<typeof LinearGradientBase>) =>
  React.createElement(LinearGradientBase, props);
