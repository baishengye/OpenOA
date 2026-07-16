/**
 * Shadow 阴影组件
 */
import React from 'react';
import { Shadow as ShadowBase } from '@shopify/react-native-skia';

export const Shadow = (props: React.ComponentProps<typeof ShadowBase>) =>
  React.createElement(ShadowBase, props);
