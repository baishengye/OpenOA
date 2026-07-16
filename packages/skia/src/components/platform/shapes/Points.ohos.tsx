/**
 * Points 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Points as PointsBase } from '@react-native-ohos/react-native-skia';

export const PointsOHOS = (props: React.ComponentProps<typeof PointsBase>) =>
  React.createElement(PointsBase, props);
