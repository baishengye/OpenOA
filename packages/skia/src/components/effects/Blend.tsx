/**
 * Blend 混合组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Blend as BlendBase } from '@shopify/react-native-skia';

export const Blend = (props: React.ComponentProps<typeof BlendBase>) =>
  React.createElement(BlendBase, props);
