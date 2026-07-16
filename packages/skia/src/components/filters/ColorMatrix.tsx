/**
 * ColorMatrix 颜色矩阵组件封装
 */
import React from 'react';
import { ColorMatrix as ColorMatrixImpl } from '../platform';

export const ColorMatrix = (props: React.ComponentProps<typeof ColorMatrixImpl>) =>
  React.createElement(ColorMatrixImpl, props);
