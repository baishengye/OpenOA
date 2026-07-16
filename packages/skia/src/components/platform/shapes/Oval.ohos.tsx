/**
 * Oval 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Oval as OvalBase } from '@react-native-ohos/react-native-skia';

export const OvalOHOS = (props: React.ComponentProps<typeof OvalBase>) =>
  React.createElement(OvalBase, props);
