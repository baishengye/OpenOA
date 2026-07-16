/**
 * Path 路径组件封装
 */
import React from 'react';
import { Path as PathImpl } from '../platform';

export const Path = (props: React.ComponentProps<typeof PathImpl>) =>
  React.createElement(PathImpl, props);
