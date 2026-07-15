/**
 * Oval 椭圆组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Oval as OvalBase } from '@shopify/react-native-skia';

export const Oval = (props: React.ComponentProps<typeof OvalBase>) =>
  React.createElement(OvalBase, props);
