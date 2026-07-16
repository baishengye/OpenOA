/**
 * Line 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Line as LineBase } from '@react-native-ohos/react-native-skia';

export const LineOHOS = (props: React.ComponentProps<typeof LineBase>) =>
  React.createElement(LineBase, props);
