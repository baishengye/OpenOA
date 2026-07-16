/**
 * Blur 模糊滤镜组件封装
 */
import React from 'react';
import { Blur as BlurImpl } from '../platform';

export const Blur = (props: React.ComponentProps<typeof BlurImpl>) =>
  React.createElement(BlurImpl, props);
