/**
 * Blur 滤镜组件 - HarmonyOS 实现
 */
import React from 'react';
import { Blur as BlurBase } from '@react-native-ohos/react-native-skia';

export const BlurOHOS = (props: React.ComponentProps<typeof BlurBase>) =>
  React.createElement(BlurBase, props);
