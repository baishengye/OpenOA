/**
 * Path2DPathEffect 路径效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { Path2DPathEffect as Path2DPathEffectBase } from '@react-native-ohos/react-native-skia';

export const Path2DPathEffectOHOS = (props: React.ComponentProps<typeof Path2DPathEffectBase>) =>
  React.createElement(Path2DPathEffectBase, props);
