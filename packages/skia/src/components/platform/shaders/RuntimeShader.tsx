/**
 * RuntimeShader 运行时着色器
 */
import React from 'react';
import { RuntimeShader as RuntimeShaderBase } from '@shopify/react-native-skia';

export const RuntimeShader = (props: React.ComponentProps<typeof RuntimeShaderBase>) =>
  React.createElement(RuntimeShaderBase, props);
