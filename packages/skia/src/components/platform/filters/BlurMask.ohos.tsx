/**
 * BlurMask 滤镜组件 - HarmonyOS 实现
 */
import React from 'react';
import { BlurMask as BlurMaskBase } from '@react-native-ohos/react-native-skia';

export const BlurMaskOHOS = (props: React.ComponentProps<typeof BlurMaskBase>) =>
  React.createElement(BlurMaskBase, props);
