/**
 * Blur 模糊滤镜组件
 */
import React from 'react';
import { Blur as BlurBase } from '@shopify/react-native-skia';

export const Blur = (props: React.ComponentProps<typeof BlurBase>) =>
  React.createElement(BlurBase, props);
