/**
 * ImageShader 图片着色器
 */
import React from 'react';
import { ImageShader as ImageShaderBase } from '@shopify/react-native-skia';

export const ImageShader = (props: React.ComponentProps<typeof ImageShaderBase>) =>
  React.createElement(ImageShaderBase, props);
