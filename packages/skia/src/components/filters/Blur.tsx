/**
 * Blur 模糊滤镜封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Blur as BlurBase } from '@shopify/react-native-skia';

export const Blur = (props: React.ComponentProps<typeof BlurBase>) =>
  React.createElement(BlurBase, props);
