/**
 * Shader 着色器封装
 */
import React from 'react';
import { Shader as ShaderImpl } from '../platform';

export const Shader = (props: React.ComponentProps<typeof ShaderImpl>) =>
  React.createElement(ShaderImpl, props);
