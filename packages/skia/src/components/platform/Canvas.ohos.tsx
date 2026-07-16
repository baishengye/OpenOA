/**
 * Canvas 画布组件 - HarmonyOS 实现
 */
import React from 'react';
import { Canvas as CanvasBase } from '@react-native-ohos/react-native-skia';

export const CanvasOHOS = (props: React.ComponentProps<typeof CanvasBase>) =>
  React.createElement(CanvasBase, props);
