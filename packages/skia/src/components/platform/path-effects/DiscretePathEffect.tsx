/**
 * DiscretePathEffect 离散路径效果
 */
import React from 'react';
import { DiscretePathEffect as DiscretePathEffectBase } from '@shopify/react-native-skia';

export const DiscretePathEffect = (props: React.ComponentProps<typeof DiscretePathEffectBase>) =>
  React.createElement(DiscretePathEffectBase, props);
