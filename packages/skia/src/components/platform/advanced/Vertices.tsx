/**
 * Vertices 顶点组件
 */
import React from 'react';
import { Vertices as VerticesBase } from '@shopify/react-native-skia';

export const Vertices = (props: React.ComponentProps<typeof VerticesBase>) =>
  React.createElement(VerticesBase, props);
