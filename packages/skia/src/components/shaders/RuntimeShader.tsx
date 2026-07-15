/**
 * RuntimeShader 运行时着色器封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { RuntimeShader as RuntimeShaderBase } from '@shopify/react-native-skia';

export const RuntimeShader = (props: React.ComponentProps<typeof RuntimeShaderBase>) =>
  React.createElement(RuntimeShaderBase, props);
