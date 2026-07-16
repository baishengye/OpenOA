/**
 * Rect 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Rect as RectBase } from '@react-native-ohos/react-native-skia';

export const RectOHOS = (props: React.ComponentProps<typeof RectBase>) =>
  React.createElement(RectBase, props);
