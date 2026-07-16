/**
 * CornerPathEffect 路径效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { CornerPathEffect as CornerPathEffectBase } from '@react-native-ohos/react-native-skia';

export const CornerPathEffectOHOS = (props: React.ComponentProps<typeof CornerPathEffectBase>) =>
  React.createElement(CornerPathEffectBase, props);
