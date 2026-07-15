/**
 * Path 路径组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Path as PathBase } from '@shopify/react-native-skia';

export const Path = (props: React.ComponentProps<typeof PathBase>) =>
  React.createElement(PathBase, props);
