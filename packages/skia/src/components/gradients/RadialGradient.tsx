/**
 * RadialGradient 径向渐变组件封装
 */
import React from 'react';
import { RadialGradient as RadialGradientImpl } from '../platform';

export const RadialGradient = (props: React.ComponentProps<typeof RadialGradientImpl>) =>
  React.createElement(RadialGradientImpl, props);
