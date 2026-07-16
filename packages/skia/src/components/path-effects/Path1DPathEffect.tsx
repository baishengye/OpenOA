/**
 * Path1DPathEffect 1D 路径效果封装
 */
import React from 'react';
import { Path1DPathEffect as Path1DPathEffectImpl } from '../platform';

export const Path1DPathEffect = (props: React.ComponentProps<typeof Path1DPathEffectImpl>) =>
  React.createElement(Path1DPathEffectImpl, props);
