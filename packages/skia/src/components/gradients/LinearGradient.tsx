/**
 * LinearGradient 线性渐变组件封装
 */
import React from 'react';
import { LinearGradient as LinearGradientImpl } from '../platform';

export const LinearGradient = (props: React.ComponentProps<typeof LinearGradientImpl>) =>
  React.createElement(LinearGradientImpl, props);
