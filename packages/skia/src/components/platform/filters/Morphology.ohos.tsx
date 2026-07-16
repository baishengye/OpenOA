/**
 * Morphology 滤镜组件 - HarmonyOS 实现
 */
import React from 'react';
import { Morphology as MorphologyBase } from '@react-native-ohos/react-native-skia';

export const MorphologyOHOS = (props: React.ComponentProps<typeof MorphologyBase>) =>
  React.createElement(MorphologyBase, props);
