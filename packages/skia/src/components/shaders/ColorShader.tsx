/**
 * ColorShader 颜色着色器封装
 */
import React from 'react';
import { ColorShader as ColorShaderImpl } from '../platform';

export const ColorShader = (props: React.ComponentProps<typeof ColorShaderImpl>) =>
  React.createElement(ColorShaderImpl, props);
