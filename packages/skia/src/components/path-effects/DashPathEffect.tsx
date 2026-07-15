/**
 * DashPathEffect 虚线路径效果封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { DashPathEffect as DashPathEffectBase } from '@shopify/react-native-skia';

export const DashPathEffect = (props: React.ComponentProps<typeof DashPathEffectBase>) =>
  React.createElement(DashPathEffectBase, props);
