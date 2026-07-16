/**
 * RoundedRect 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { RoundedRect as RoundedRectBase } from '@react-native-ohos/react-native-skia';

export const RoundedRectOHOS = (props: React.ComponentProps<typeof RoundedRectBase>) =>
  React.createElement(RoundedRectBase, props);
