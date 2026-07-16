/**
 * DashPathEffect 虚线路径效果封装
 */
import React from 'react';
import { DashPathEffect as DashPathEffectImpl } from '../platform';

export const DashPathEffect = (props: React.ComponentProps<typeof DashPathEffectImpl>) =>
  React.createElement(DashPathEffectImpl, props);
