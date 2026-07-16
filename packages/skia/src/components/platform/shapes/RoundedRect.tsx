/**
 * RoundedRect 圆角矩形组件
 */
import React from 'react';
import { RoundedRect as RoundedRectBase } from '@shopify/react-native-skia';

export const RoundedRect = (props: React.ComponentProps<typeof RoundedRectBase>) =>
  React.createElement(RoundedRectBase, props);
