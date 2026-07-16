/**
 * CornerPathEffect 圆角路径效果封装
 */
import React from 'react';
import { CornerPathEffect as CornerPathEffectImpl } from '../platform';

export const CornerPathEffect = (props: React.ComponentProps<typeof CornerPathEffectImpl>) =>
  React.createElement(CornerPathEffectImpl, props);
