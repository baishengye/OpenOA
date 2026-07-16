/**
 * Shader 着色器
 */
import React from 'react';
import { Shader as ShaderBase } from '@shopify/react-native-skia';

export const Shader = (props: React.ComponentProps<typeof ShaderBase>) =>
  React.createElement(ShaderBase, props);
