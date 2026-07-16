/**
 * Circle 圆形组件封装
 */
import React from 'react';
import { Circle as CircleImpl } from '../platform';

export const Circle = (props: React.ComponentProps<typeof CircleImpl>) =>
  React.createElement(CircleImpl, props);
