/**
 * DashPathEffect 虚线路径效果
 */
import React from 'react';
import { DashPathEffect as DashPathEffectBase } from '@shopify/react-native-skia';

export const DashPathEffect = (props: React.ComponentProps<typeof DashPathEffectBase>) =>
  React.createElement(DashPathEffectBase, props);
