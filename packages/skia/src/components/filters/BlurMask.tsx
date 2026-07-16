/**
 * BlurMask 模糊遮罩组件封装
 */
import React from 'react';
import { BlurMask as BlurMaskImpl } from '../platform';

export const BlurMask = (props: React.ComponentProps<typeof BlurMaskImpl>) =>
  React.createElement(BlurMaskImpl, props);
