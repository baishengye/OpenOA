/**
 * Circle 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Circle as CircleBase } from '@react-native-ohos/react-native-skia';

export const CircleOHOS = (props: React.ComponentProps<typeof CircleBase>) =>
  React.createElement(CircleBase, props);
