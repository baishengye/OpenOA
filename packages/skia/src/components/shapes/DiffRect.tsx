/**
 * DiffRect 差异矩形组件封装
 */
import React from 'react';
import { DiffRect as DiffRectImpl } from '../platform';

export const DiffRect = (props: React.ComponentProps<typeof DiffRectImpl>) =>
  React.createElement(DiffRectImpl, props);
