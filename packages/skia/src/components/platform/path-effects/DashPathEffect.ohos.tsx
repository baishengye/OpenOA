/**
 * DashPathEffect 路径效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { DashPathEffect as DashPathEffectBase } from '@react-native-ohos/react-native-skia';

export const DashPathEffectOHOS = (props: React.ComponentProps<typeof DashPathEffectBase>) =>
  React.createElement(DashPathEffectBase, props);
