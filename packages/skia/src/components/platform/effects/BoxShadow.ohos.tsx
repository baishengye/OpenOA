/**
 * BoxShadow 效果组件 - HarmonyOS 实现
 */
import React from 'react';
import { BoxShadow as BoxShadowBase } from '@react-native-ohos/react-native-skia';

export const BoxShadowOHOS = (props: React.ComponentProps<typeof BoxShadowBase>) =>
  React.createElement(BoxShadowBase, props);
