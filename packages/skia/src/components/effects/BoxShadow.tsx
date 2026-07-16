/**
 * BoxShadow 盒阴影组件封装
 */
import React from 'react';
import { BoxShadow as BoxShadowImpl } from '../platform';

export const BoxShadow = (props: React.ComponentProps<typeof BoxShadowImpl>) =>
  React.createElement(BoxShadowImpl, props);
