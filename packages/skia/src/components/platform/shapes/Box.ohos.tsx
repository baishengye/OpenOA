/**
 * Box 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Box as BoxBase } from '@react-native-ohos/react-native-skia';

export const BoxOHOS = (props: React.ComponentProps<typeof BoxBase>) =>
  React.createElement(BoxBase, props);
