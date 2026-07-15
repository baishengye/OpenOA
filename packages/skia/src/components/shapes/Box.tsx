/**
 * Box 盒模型组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Box as BoxBase } from '@shopify/react-native-skia';

export const Box = (props: React.ComponentProps<typeof BoxBase>) =>
  React.createElement(BoxBase, props);
