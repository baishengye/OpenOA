/**
 * DiscretePathEffect 离散路径效果封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { DiscretePathEffect as DiscretePathEffectBase } from '@shopify/react-native-skia';

export const DiscretePathEffect = (props: React.ComponentProps<typeof DiscretePathEffectBase>) =>
  React.createElement(DiscretePathEffectBase, props);
