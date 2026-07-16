/**
 * DisplacementMap 滤镜组件 - HarmonyOS 实现
 */
import React from 'react';
import { DisplacementMap as DisplacementMapBase } from '@react-native-ohos/react-native-skia';

export const DisplacementMapOHOS = (props: React.ComponentProps<typeof DisplacementMapBase>) =>
  React.createElement(DisplacementMapBase, props);
