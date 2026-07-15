/**
 * Shadow 阴影滤镜封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Shadow as ShadowBase } from '@shopify/react-native-skia';

export const Shadow = (props: React.ComponentProps<typeof ShadowBase>) =>
  React.createElement(ShadowBase, props);
