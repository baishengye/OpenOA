/**
 * DiscretePathEffect 离散路径效果封装
 */
import React from 'react';
import { DiscretePathEffect as DiscretePathEffectImpl } from '../platform';

export const DiscretePathEffect = (props: React.ComponentProps<typeof DiscretePathEffectImpl>) =>
  React.createElement(DiscretePathEffectImpl, props);
