/**
 * Line2DPathEffect 2D 线条路径效果封装
 */
import React from 'react';
import { Line2DPathEffect as Line2DPathEffectImpl } from '../platform';

export const Line2DPathEffect = (props: React.ComponentProps<typeof Line2DPathEffectImpl>) =>
  React.createElement(Line2DPathEffectImpl, props);
