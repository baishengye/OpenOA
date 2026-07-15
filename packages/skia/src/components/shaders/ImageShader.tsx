/**
 * ImageShader 图像着色器封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { ImageShader as ImageShaderBase } from '@shopify/react-native-skia';

export const ImageShader = (props: React.ComponentProps<typeof ImageShaderBase>) =>
  React.createElement(ImageShaderBase, props);
