/**
 * TwoPointConicalGradient 双点锥形渐变组件封装
 */
import React from 'react';
import { TwoPointConicalGradient as TwoPointConicalGradientImpl } from '../platform';

export const TwoPointConicalGradient = (props: React.ComponentProps<typeof TwoPointConicalGradientImpl>) =>
  React.createElement(TwoPointConicalGradientImpl, props);
