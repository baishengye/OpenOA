/**
 * Points 点组件封装
 */
import React from 'react';
import { Points as PointsImpl } from '../platform';

export const Points = (props: React.ComponentProps<typeof PointsImpl>) =>
  React.createElement(PointsImpl, props);
