/**
 * Shader 着色器组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Shader as ShaderBase } from '@shopify/react-native-skia';

export const Shader = (props: React.ComponentProps<typeof ShaderBase>) =>
  React.createElement(ShaderBase, props);
