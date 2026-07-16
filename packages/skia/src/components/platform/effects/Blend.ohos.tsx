/**
 * Blend 效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { Blend as BlendBase } from '@react-native-ohos/react-native-skia';

export const BlendOHOS = (props: React.ComponentProps<typeof BlendBase>) =>
  React.createElement(BlendBase, props);
