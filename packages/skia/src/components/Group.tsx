/**
 * Group 分组组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Group as GroupBase } from '@shopify/react-native-skia';

export const Group = (props: React.ComponentProps<typeof GroupBase>) =>
  React.createElement(GroupBase, props);
