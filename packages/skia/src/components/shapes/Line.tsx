/**
 * Line 线条组件封装
 */
import React from 'react';
import { Line as LineImpl } from '../platform';

export const Line = (props: React.ComponentProps<typeof LineImpl>) =>
  React.createElement(LineImpl, props);
