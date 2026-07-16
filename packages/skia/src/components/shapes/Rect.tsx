/**
 * Rect 矩形组件封装
 */
import React from 'react';
import { Rect as RectImpl } from '../platform';

export const Rect = (props: React.ComponentProps<typeof RectImpl>) =>
  React.createElement(RectImpl, props);
