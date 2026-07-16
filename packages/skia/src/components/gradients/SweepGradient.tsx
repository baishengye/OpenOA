/**
 * SweepGradient 扫描渐变组件封装
 */
import React from 'react';
import { SweepGradient as SweepGradientImpl } from '../platform';

export const SweepGradient = (props: React.ComponentProps<typeof SweepGradientImpl>) =>
  React.createElement(SweepGradientImpl, props);
