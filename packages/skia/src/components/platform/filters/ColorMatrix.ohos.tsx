/**
 * ColorMatrix 滤镜组件 - HarmonyOS 实现
 */
import React from 'react';
import { ColorMatrix as ColorMatrixBase } from '@react-native-ohos/react-native-skia';

export const ColorMatrixOHOS = (props: React.ComponentProps<typeof ColorMatrixBase>) =>
  React.createElement(ColorMatrixBase, props);
