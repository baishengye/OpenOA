/**
 * RoundedRect 圆角矩形组件封装
 */
import React from 'react';
import { RoundedRect as RoundedRectImpl } from '../platform';

export const RoundedRect = (props: React.ComponentProps<typeof RoundedRectImpl>) =>
  React.createElement(RoundedRectImpl, props);
