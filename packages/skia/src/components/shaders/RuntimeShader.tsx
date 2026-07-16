/**
 * RuntimeShader 运行时着色器封装
 */
import React from 'react';
import { RuntimeShader as RuntimeShaderImpl } from '../platform';

export const RuntimeShader = (props: React.ComponentProps<typeof RuntimeShaderImpl>) =>
  React.createElement(RuntimeShaderImpl, props);
