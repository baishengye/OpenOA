/**
 * Blend 混合模式组件
 */
import React from 'react';
import { Blend as BlendBase } from '@shopify/react-native-skia';

export const Blend = (props: React.ComponentProps<typeof BlendBase>) =>
  React.createElement(BlendBase, props);
