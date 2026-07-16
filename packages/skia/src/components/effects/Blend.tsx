/**
 * Blend 混合模式组件封装
 */
import React from 'react';
import { Blend as BlendImpl } from '../platform';

export const Blend = (props: React.ComponentProps<typeof BlendImpl>) =>
  React.createElement(BlendImpl, props);
