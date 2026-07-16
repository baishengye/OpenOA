/**
 * Path2DPathEffect 2D 路径效果封装
 */
import React from 'react';
import { Path2DPathEffect as Path2DPathEffectImpl } from '../platform';

export const Path2DPathEffect = (props: React.ComponentProps<typeof Path2DPathEffectImpl>) =>
  React.createElement(Path2DPathEffectImpl, props);
