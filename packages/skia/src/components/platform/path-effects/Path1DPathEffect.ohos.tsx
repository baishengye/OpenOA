/**
 * Path1DPathEffect 路径效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { Path1DPathEffect as Path1DPathEffectBase } from '@react-native-ohos/react-native-skia';

export const Path1DPathEffectOHOS = (props: React.ComponentProps<typeof Path1DPathEffectBase>) =>
  React.createElement(Path1DPathEffectBase, props);
