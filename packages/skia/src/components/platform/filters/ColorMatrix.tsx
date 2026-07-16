/**
 * ColorMatrix 颜色矩阵组件
 */
import React from 'react';
import { ColorMatrix as ColorMatrixBase } from '@shopify/react-native-skia';

export const ColorMatrix = (props: React.ComponentProps<typeof ColorMatrixBase>) =>
  React.createElement(ColorMatrixBase, props);
