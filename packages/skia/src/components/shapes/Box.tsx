/**
 * Box 盒组件封装
 */
import React from 'react';
import { Box as BoxImpl } from '../platform';

export const Box = (props: React.ComponentProps<typeof BoxImpl>) =>
  React.createElement(BoxImpl, props);
