/**
 * Vertices 顶点组件封装
 */
import React from 'react';
import { Vertices as VerticesImpl } from '../platform';

export const Vertices = (props: React.ComponentProps<typeof VerticesImpl>) =>
  React.createElement(VerticesImpl, props);
