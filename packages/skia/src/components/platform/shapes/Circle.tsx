/**
 * Circle 圆形组件
 */
import React from 'react';
import { Circle as CircleBase } from '@shopify/react-native-skia';

export const Circle = (props: React.ComponentProps<typeof CircleBase>) =>
  React.createElement(CircleBase, props);
