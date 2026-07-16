/**
 * Canvas 画布组件封装
 * 直接转发所有属性到基础组件
 */
import React from 'react';
import { Canvas as CanvasImpl } from './platform';

export const Canvas = (props: React.ComponentProps<typeof CanvasImpl>) =>
  React.createElement(CanvasImpl, props);
