/**
 * Points 点集组件
 */
import React from 'react';
import { Points as PointsBase } from '@shopify/react-native-skia';

export const Points = (props: React.ComponentProps<typeof PointsBase>) =>
  React.createElement(PointsBase, props);
