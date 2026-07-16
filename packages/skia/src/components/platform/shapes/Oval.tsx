/**
 * Oval 椭圆组件
 */
import React from 'react';
import { Oval as OvalBase } from '@shopify/react-native-skia';

export const Oval = (props: React.ComponentProps<typeof OvalBase>) =>
  React.createElement(OvalBase, props);
