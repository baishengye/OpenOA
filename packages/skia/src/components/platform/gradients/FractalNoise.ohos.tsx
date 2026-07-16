/**
 * FractalNoise 渐变组件 - HarmonyOS 实现
 */
import React from 'react';
import { FractalNoise as FractalNoiseBase } from '@react-native-ohos/react-native-skia';

export const FractalNoiseOHOS = (props: React.ComponentProps<typeof FractalNoiseBase>) =>
  React.createElement(FractalNoiseBase, props);
