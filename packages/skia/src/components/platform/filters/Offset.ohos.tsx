/**
 * Offset 滤镜组件 - HarmonyOS 实现
 */
import React from 'react';
import { Offset as OffsetBase } from '@react-native-ohos/react-native-skia';

export const OffsetOHOS = (props: React.ComponentProps<typeof OffsetBase>) =>
  React.createElement(OffsetBase, props);
