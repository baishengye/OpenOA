/**
 * ColorShader 颜色着色器
 */
import React from 'react';
import { ColorShader as ColorShaderBase } from '@shopify/react-native-skia';

export const ColorShader = (props: React.ComponentProps<typeof ColorShaderBase>) =>
  React.createElement(ColorShaderBase, props);
