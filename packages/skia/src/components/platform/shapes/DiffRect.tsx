/**
 * DiffRect 差分矩形组件
 */
import React from 'react';
import { DiffRect as DiffRectBase } from '@shopify/react-native-skia';

export const DiffRect = (props: React.ComponentProps<typeof DiffRectBase>) =>
  React.createElement(DiffRectBase, props);
