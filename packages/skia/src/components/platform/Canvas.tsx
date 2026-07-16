/**
 * Canvas 画布组件
 */
import React from 'react';
import { Canvas as CanvasBase } from '@shopify/react-native-skia';

export const Canvas = (props: React.ComponentProps<typeof CanvasBase>) =>
  React.createElement(CanvasBase, props);
