/**
 * Patch 形状组件 - HarmonyOS 实现
 */
import React from 'react';
import { Patch as PatchBase } from '@react-native-ohos/react-native-skia';

export const PatchOHOS = (props: React.ComponentProps<typeof PatchBase>) =>
  React.createElement(PatchBase, props);
