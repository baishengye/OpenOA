/**
 * Oval 椭圆组件封装
 */
import React from 'react';
import { Oval as OvalImpl } from '../platform';

export const Oval = (props: React.ComponentProps<typeof OvalImpl>) =>
  React.createElement(OvalImpl, props);
