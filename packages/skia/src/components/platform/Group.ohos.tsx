/**
 * Group 分组组件 - HarmonyOS 实现
 */
import React from 'react';
import { Group as GroupBase } from '@react-native-ohos/react-native-skia';

export const GroupOHOS = (props: React.ComponentProps<typeof GroupBase>) =>
  React.createElement(GroupBase, props);
