/**
 * ImageShader 图片着色器封装
 */
import React from 'react';
import { ImageShader as ImageShaderImpl } from '../platform';

export const ImageShader = (props: React.ComponentProps<typeof ImageShaderImpl>) =>
  React.createElement(ImageShaderImpl, props);
