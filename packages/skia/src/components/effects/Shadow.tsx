/**
 * Shadow 阴影组件封装
 */
import React from 'react';
import { Shadow as ShadowImpl } from '../platform';

export const Shadow = (props: React.ComponentProps<typeof ShadowImpl>) =>
  React.createElement(ShadowImpl, props);
