/**
 * Circle 圆形组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Circle as CircleBase } from '@shopify/react-native-skia';

export const Circle = (props: React.ComponentProps<typeof CircleBase>) =>
  React.createElement(CircleBase, props);
