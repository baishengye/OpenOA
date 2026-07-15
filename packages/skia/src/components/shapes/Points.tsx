/**
 * Points 点集合组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Points as PointsBase } from '@shopify/react-native-skia';

export const Points = (props: React.ComponentProps<typeof PointsBase>) =>
  React.createElement(PointsBase, props);
