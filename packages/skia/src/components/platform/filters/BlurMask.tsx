/**
 * BlurMask 模糊遮罩组件
 */
import React from 'react';
import { BlurMask as BlurMaskBase } from '@shopify/react-native-skia';

export const BlurMask = (props: React.ComponentProps<typeof BlurMaskBase>) =>
  React.createElement(BlurMaskBase, props);
