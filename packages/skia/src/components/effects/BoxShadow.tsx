/**
 * BoxShadow 盒阴影组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { BoxShadow as BoxShadowBase } from '@shopify/react-native-skia';

export const BoxShadow = (props: React.ComponentProps<typeof BoxShadowBase>) =>
  React.createElement(BoxShadowBase, props);
