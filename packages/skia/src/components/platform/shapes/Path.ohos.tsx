/**
 * Path 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Path as PathBase } from '@react-native-ohos/react-native-skia';

export const PathOHOS = (props: React.ComponentProps<typeof PathBase>) =>
  React.createElement(PathBase, props);
