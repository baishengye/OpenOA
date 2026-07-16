/**
 * Rect 矩形组件
 */
import React from 'react';
import { Rect as RectBase } from '@shopify/react-native-skia';

export const Rect = (props: React.ComponentProps<typeof RectBase>) =>
  React.createElement(RectBase, props);
