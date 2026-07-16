/**
 * DiscretePathEffect 路径效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { DiscretePathEffect as DiscretePathEffectBase } from '@react-native-ohos/react-native-skia';

export const DiscretePathEffectOHOS = (props: React.ComponentProps<typeof DiscretePathEffectBase>) =>
  React.createElement(DiscretePathEffectBase, props);
