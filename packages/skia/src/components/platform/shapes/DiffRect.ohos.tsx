/**
 * DiffRect 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { DiffRect as DiffRectBase } from '@react-native-ohos/react-native-skia';

export const DiffRectOHOS = (props: React.ComponentProps<typeof DiffRectBase>) =>
  React.createElement(DiffRectBase, props);
