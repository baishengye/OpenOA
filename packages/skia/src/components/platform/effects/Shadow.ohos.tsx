/**
 * Shadow 效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { Shadow as ShadowBase } from '@react-native-ohos/react-native-skia';

export const ShadowOHOS = (props: React.ComponentProps<typeof ShadowBase>) =>
  React.createElement(ShadowBase, props);
