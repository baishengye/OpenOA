/**
 * Line2DPathEffect 路径效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { Line2DPathEffect as Line2DPathEffectBase } from '@react-native-ohos/react-native-skia';

export const Line2DPathEffectOHOS = (props: React.ComponentProps<typeof Line2DPathEffectBase>) =>
  React.createElement(Line2DPathEffectBase, props);
