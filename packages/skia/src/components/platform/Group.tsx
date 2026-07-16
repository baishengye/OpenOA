/**
 * Group 分组组件
 */
import React from 'react';
import { Group as GroupBase } from '@shopify/react-native-skia';

export const Group = (props: React.ComponentProps<typeof GroupBase>) =>
  React.createElement(GroupBase, props);
