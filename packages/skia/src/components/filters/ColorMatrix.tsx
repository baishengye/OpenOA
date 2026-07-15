/**
 * ColorMatrix 颜色矩阵滤镜封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { ColorMatrix as ColorMatrixBase } from '@shopify/react-native-skia';

export const ColorMatrix = (props: React.ComponentProps<typeof ColorMatrixBase>) =>
  React.createElement(ColorMatrixBase, props);
