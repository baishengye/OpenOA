/**
 * DiffRect 差集矩形组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { DiffRect as DiffRectBase } from '@shopify/react-native-skia';

export const DiffRect = (props: React.ComponentProps<typeof DiffRectBase>) =>
  React.createElement(DiffRectBase, props);
