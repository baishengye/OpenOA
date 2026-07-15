/**
 * ColorShader 纯色着色器封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { ColorShader as ColorShaderBase } from '@shopify/react-native-skia';

export const ColorShader = (props: React.ComponentProps<typeof ColorShaderBase>) =>
  React.createElement(ColorShaderBase, props);
