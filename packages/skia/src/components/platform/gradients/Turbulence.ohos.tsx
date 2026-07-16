/**
 * Turbulence 渐变组件 - HarmonyOS 实现
 */
import React from 'react';
import { Turbulence as TurbulenceBase } from '@react-native-ohos/react-native-skia';

export const TurbulenceOHOS = (props: React.ComponentProps<typeof TurbulenceBase>) =>
  React.createElement(TurbulenceBase, props);
